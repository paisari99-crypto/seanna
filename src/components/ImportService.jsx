import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function ImportService({ userProfile, onComplete }) {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle'); // idle, validating, preview, importing, complete
  const [validationResult, setValidationResult] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const generateExternalId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const computeHabitKey = (habit) => {
    if (!habit) return null;
    const name = (habit.name || '').toLowerCase().trim();
    if (!name) return null;
    const scheduleType = habit.scheduleType || '';
    const description = (habit.description || '').toLowerCase().trim();
    return `${name}|${scheduleType}|${description}`;
  };

  const computeLogKey = (habitKey, date) => {
    if (!habitKey || !date) return null;
    return `${habitKey}|${date}`;
  };

  const computeJournalKey = (entry) => {
    if (!entry) return null;
    const createdDate = entry.created_date || '';
    const title = (entry.title || '').toLowerCase().trim();
    if (title) {
      return `${createdDate}|${title}`;
    }
    const bodyStart = (entry.body || '').substring(0, 80).toLowerCase().trim();
    return `${createdDate}|${bodyStart}`;
  };

  const computeDecisionKey = (decision) => {
    if (!decision) return null;
    const createdDate = decision.created_date || '';
    const title = (decision.title || '').toLowerCase().trim();
    if (!title) return null;
    const context = (decision.context || '').toLowerCase().trim();
    return `${createdDate}|${title}|${context}`;
  };

  const validateBackup = async (backupData) => {
    const errors = [];
    const warnings = [];

    // Check version
    if (!backupData.version) {
      errors.push('Missing version field');
    }

    // Detect if this is a new format (v1.1.0+) with habitExternalId
    const isNewFormat = backupData.habitLogs?.some(log => log.habitExternalId !== undefined);

    // Check required sections
    const requiredSections = ['habits', 'habitLogs', 'journalEntries', 'decisions'];
    requiredSections.forEach(section => {
      if (!backupData[section]) {
        warnings.push(`Missing ${section} section - will be treated as empty`);
      }
    });

    // Check if it's a valid Seanna backup
    if (!backupData.exportDate && !backupData.userProfile) {
      errors.push('Invalid backup format - not a Seanna backup file');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      isNewFormat,
      sections: {
        habits: backupData.habits || [],
        habitLogs: backupData.habitLogs || [],
        journalEntries: backupData.journalEntries || [],
        decisions: backupData.decisions || []
      }
    };
  };

  const generateImportPreview = async (sections, isNewFormat) => {
    try {
      const currentUserId = userProfile.id;

      // Normalize sections (defensive)
      const habits = Array.isArray(sections.habits) ? sections.habits : [];
      const habitLogs = Array.isArray(sections.habitLogs) ? sections.habitLogs : [];
      const journalEntries = Array.isArray(sections.journalEntries) ? sections.journalEntries : [];
      const decisions = Array.isArray(sections.decisions) ? sections.decisions : [];

      // Fetch existing records
      const existingHabits = await base44.entities.Habit.filter({ userId: currentUserId });
      const existingLogs = await base44.entities.HabitLog.filter({ userId: currentUserId });
      const existingJournals = await base44.entities.JournalEntry.filter({ userId: currentUserId });
      const existingDecisions = await base44.entities.Decision.filter({ userId: currentUserId });

      // Build lookup maps by externalId (primary) and content key (fallback) - defensive
      const existingHabitsByExtId = new Map();
      const existingHabitsByKey = new Map();
      
      if (Array.isArray(existingHabits)) {
        existingHabits.forEach(h => {
          if (h && h.externalId) {
            existingHabitsByExtId.set(h.externalId, h);
          }
          if (h) {
            const key = computeHabitKey(h);
            if (key) {
              existingHabitsByKey.set(key, h);
            }
          }
        });
      }

      // Build log deduplication map: (habitExternalId + date) -> log - defensive
      const existingLogsByCompositeKey = new Map();
      
      if (Array.isArray(existingLogs) && Array.isArray(existingHabits)) {
        existingLogs.forEach(log => {
          if (log && log.habitId && log.date) {
            const habit = existingHabits.find(h => h && h.id === log.habitId);
            if (habit && habit.externalId) {
              const key = `${habit.externalId}|${log.date}`;
              existingLogsByCompositeKey.set(key, log);
            }
          }
        });
      }

      const existingJournalsByExtId = new Map();
      const existingJournalsByKey = new Map();
      
      if (Array.isArray(existingJournals)) {
        existingJournals.forEach(j => {
          if (j && j.externalId) {
            existingJournalsByExtId.set(j.externalId, j);
          }
          if (j) {
            const key = computeJournalKey(j);
            if (key) {
              existingJournalsByKey.set(key, j);
            }
          }
        });
      }

      const existingDecisionsByExtId = new Map();
      const existingDecisionsByKey = new Map();
      
      if (Array.isArray(existingDecisions)) {
        existingDecisions.forEach(d => {
          if (d && d.externalId) {
            existingDecisionsByExtId.set(d.externalId, d);
          }
          if (d) {
            const key = computeDecisionKey(d);
            if (key) {
              existingDecisionsByKey.set(key, d);
            }
          }
        });
      }

      const preview = {
        habits: { create: [], skip: [] },
        habitLogs: { create: [], skip: [] },
        journalEntries: { create: [], skip: [] },
        decisions: { create: [], skip: [] },
        unmatchedHabitRefs: []
      };

      // Track habit mappings for logs
      const habitExtIdToMatched = new Map(); // externalId from backup -> existing habit

      // Process habits - prefer externalId, fallback to content key - defensive
      if (Array.isArray(habits)) {
        habits.forEach(habit => {
          if (!habit) return;
          
          let matchedHabit = null;
          
          if (habit.externalId && existingHabitsByExtId.has(habit.externalId)) {
            matchedHabit = existingHabitsByExtId.get(habit.externalId);
          } else {
            const habitKey = computeHabitKey(habit);
            if (habitKey && existingHabitsByKey.has(habitKey)) {
              matchedHabit = existingHabitsByKey.get(habitKey);
            }
          }
          
          if (matchedHabit) {
            preview.habits.skip.push(habit);
            // Track for log resolution
            if (habit.externalId) {
              habitExtIdToMatched.set(habit.externalId, matchedHabit);
            }
          } else {
            preview.habits.create.push(habit);
          }
        });
      }

      // Process journal entries - defensive
      if (Array.isArray(journalEntries)) {
        journalEntries.forEach(entry => {
          if (!entry) return;
          
          let isDuplicate = false;
          
          if (entry.externalId && existingJournalsByExtId.has(entry.externalId)) {
            isDuplicate = true;
          } else {
            const journalKey = computeJournalKey(entry);
            if (journalKey && existingJournalsByKey.has(journalKey)) {
              isDuplicate = true;
            }
          }
          
          if (isDuplicate) {
            preview.journalEntries.skip.push(entry);
          } else {
            preview.journalEntries.create.push(entry);
          }
        });
      }

      // Process decisions - defensive
      if (Array.isArray(decisions)) {
        decisions.forEach(decision => {
          if (!decision) return;
          
          let isDuplicate = false;
          
          if (decision.externalId && existingDecisionsByExtId.has(decision.externalId)) {
            isDuplicate = true;
          } else {
            const decisionKey = computeDecisionKey(decision);
            if (decisionKey && existingDecisionsByKey.has(decisionKey)) {
              isDuplicate = true;
            }
          }
          
          if (isDuplicate) {
            preview.decisions.skip.push(decision);
          } else {
            preview.decisions.create.push(decision);
          }
        });
      }

      // Process habit logs - only create logs for habits that will exist (defensive)
      const processedLogKeys = new Set();
      
      if (Array.isArray(habitLogs)) {
        habitLogs.forEach(log => {
          if (!log) {
            return;
          }
          
          let habitExternalId;
          
          // New format: log has habitExternalId directly
          if (isNewFormat && log.habitExternalId) {
            habitExternalId = log.habitExternalId;
          }
          // Old format: resolve via habitId in backup
          else if (log.habitId) {
            const habitFromBackup = habits.find(h => h && h.id === log.habitId);
            habitExternalId = habitFromBackup?.externalId;
            
            // If habit not in backup, check if it exists in user's account
            if (!habitExternalId && Array.isArray(existingHabits)) {
              const existingHabit = existingHabits.find(h => h && h.id === log.habitId);
              habitExternalId = existingHabit?.externalId;
            }
          }
          
          // Skip logs without a valid habitExternalId
          if (!habitExternalId) {
            preview.habitLogs.skip.push(log);
            preview.unmatchedHabitRefs.push(log);
            return;
          }
          
          // Check if habit exists (either in backup to be created, or already exists)
          const habitWillExist = 
            (Array.isArray(habits) && habits.some(h => h && h.externalId === habitExternalId)) ||
            existingHabitsByExtId.has(habitExternalId);
            
          // Skip logs that reference non-existent habits
          if (!habitWillExist) {
            preview.habitLogs.skip.push(log);
            preview.unmatchedHabitRefs.push(log);
            return;
          }
          
          // Deduplicate by composite key
          if (!log.date) {
            preview.habitLogs.skip.push(log);
            return;
          }
          
          const logKey = `${habitExternalId}|${log.date}`;
          
          if (existingLogsByCompositeKey.has(logKey) || processedLogKeys.has(logKey)) {
            preview.habitLogs.skip.push(log);
          } else {
            preview.habitLogs.create.push(log);
            processedLogKeys.add(logKey);
          }
        });
      }

      return preview;
    } catch (error) {
      console.error('Error generating preview:', error);
      throw new Error('Failed to generate import preview');
    }
  };

  const executeImport = async (sections, preview, isNewFormat) => {
    const currentUserId = userProfile.id;
    const createdIds = {
      habits: [],
      habitLogs: [],
      journalEntries: [],
      decisions: []
    };
    
    try {
      const results = {
        habits: { created: 0, skipped: 0, errors: [] },
        habitLogs: { created: 0, skipped: 0, errors: [] },
        journalEntries: { created: 0, skipped: 0, errors: [] },
        decisions: { created: 0, skipped: 0, errors: [] }
      };

      // Fetch existing habits and build externalId -> internal ID map (defensive)
      const existingHabits = await base44.entities.Habit.filter({ userId: currentUserId });
      const habitExtIdToInternalId = new Map();
      
      if (Array.isArray(existingHabits)) {
        existingHabits.forEach(h => {
          if (h && h.externalId && h.id) {
            habitExtIdToInternalId.set(h.externalId, h.id);
          }
        });
      }

      // Import habits (defensive)
      const habitsToCreate = Array.isArray(preview.habits.create) ? preview.habits.create : [];
      
      for (const habit of habitsToCreate) {
        try {
          if (!habit) {
            continue;
          }
          
          const { id, created_date, updated_date, created_by, userId, ...data } = habit;
          
          // Generate externalId if not present (backward compatibility)
          if (!data.externalId) {
            data.externalId = generateExternalId();
          }
          
          const newHabit = await base44.entities.Habit.create({
            ...data,
            userId: currentUserId
          });
          
          // Track for rollback
          if (newHabit && newHabit.id) {
            createdIds.habits.push(newHabit.id);
            
            // Track mapping for logs
            if (newHabit.externalId) {
              habitExtIdToInternalId.set(newHabit.externalId, newHabit.id);
            }
          }
          
          results.habits.created++;
        } catch (error) {
          console.error('Failed to create habit:', error);
          throw new Error(`Failed to create habit "${habit?.name || 'unknown'}": ${error.message}`);
        }
      }

      results.habits.skipped = Array.isArray(preview.habits.skip) ? preview.habits.skip.length : 0;

      // Import habit logs - only create if habit reference can be resolved (defensive)
      const logsToCreate = Array.isArray(preview.habitLogs.create) ? preview.habitLogs.create : [];
      
      for (const log of logsToCreate) {
        try {
          if (!log) {
            continue;
          }
          
          const { id, created_date, updated_date, created_by, userId, habitId, habitExternalId, ...data } = log;
          
          // Generate externalId for the log if not present
          if (!data.externalId) {
            data.externalId = generateExternalId();
          }
          
          // Resolve habit by externalId
          let resolvedHabitExternalId;
          
          if (isNewFormat && habitExternalId) {
            resolvedHabitExternalId = habitExternalId;
          } else if (habitId) {
            // Old format: lookup habit in backup
            const backupHabits = Array.isArray(sections.habits) ? sections.habits : [];
            const habitFromBackup = backupHabits.find(h => h && h.id === habitId);
            resolvedHabitExternalId = habitFromBackup?.externalId;
          }
          
          const actualHabitId = habitExtIdToInternalId.get(resolvedHabitExternalId);
          
          // Skip logs that can't resolve habit (defensive check)
          if (!actualHabitId) {
            console.warn('Skipping log: habit not found', resolvedHabitExternalId);
            results.habitLogs.skipped++;
            continue;
          }
          
          const newLog = await base44.entities.HabitLog.create({
            ...data,
            habitId: actualHabitId,
            userId: currentUserId
          });
          
          if (newLog && newLog.id) {
            createdIds.habitLogs.push(newLog.id);
          }
          
          results.habitLogs.created++;
        } catch (error) {
          console.error('Failed to create log:', error);
          throw new Error(`Failed to create log: ${error.message}`);
        }
      }

      results.habitLogs.skipped = Array.isArray(preview.habitLogs.skip) ? preview.habitLogs.skip.length : 0;

      // Import journal entries (defensive)
      const journalsToCreate = Array.isArray(preview.journalEntries.create) ? preview.journalEntries.create : [];
      
      for (const entry of journalsToCreate) {
        try {
          if (!entry) {
            continue;
          }
          
          const { id, created_date, updated_date, created_by, userId, ...data } = entry;
          
          if (!data.externalId) {
            data.externalId = generateExternalId();
          }
          
          const newEntry = await base44.entities.JournalEntry.create({
            ...data,
            userId: currentUserId
          });
          
          if (newEntry && newEntry.id) {
            createdIds.journalEntries.push(newEntry.id);
          }
          
          results.journalEntries.created++;
        } catch (error) {
          console.error('Failed to create journal entry:', error);
          throw new Error(`Failed to create journal "${entry?.title || 'Untitled'}": ${error.message}`);
        }
      }

      results.journalEntries.skipped = Array.isArray(preview.journalEntries.skip) ? preview.journalEntries.skip.length : 0;

      // Import decisions (defensive)
      const decisionsToCreate = Array.isArray(preview.decisions.create) ? preview.decisions.create : [];
      
      for (const decision of decisionsToCreate) {
        try {
          if (!decision) {
            continue;
          }
          
          const { id, created_date, updated_date, created_by, userId, ...data } = decision;
          
          if (!data.externalId) {
            data.externalId = generateExternalId();
          }
          
          const newDecision = await base44.entities.Decision.create({
            ...data,
            userId: currentUserId
          });
          
          if (newDecision && newDecision.id) {
            createdIds.decisions.push(newDecision.id);
          }
          
          results.decisions.created++;
        } catch (error) {
          console.error('Failed to create decision:', error);
          throw new Error(`Failed to create decision "${decision?.title || 'unknown'}": ${error.message}`);
        }
      }

      results.decisions.skipped = Array.isArray(preview.decisions.skip) ? preview.decisions.skip.length : 0;

      return results;
    } catch (error) {
      // Rollback: delete all created records
      console.error('Import failed, rolling back...', error);
      
      try {
        const allIds = [
          ...(Array.isArray(createdIds.decisions) ? createdIds.decisions : []),
          ...(Array.isArray(createdIds.journalEntries) ? createdIds.journalEntries : []),
          ...(Array.isArray(createdIds.habitLogs) ? createdIds.habitLogs : []),
          ...(Array.isArray(createdIds.habits) ? createdIds.habits : [])
        ];
        
        for (const id of createdIds.decisions || []) {
          if (id) {
            await base44.entities.Decision.delete(id).catch(e => console.error('Rollback error:', e));
          }
        }
        for (const id of createdIds.journalEntries || []) {
          if (id) {
            await base44.entities.JournalEntry.delete(id).catch(e => console.error('Rollback error:', e));
          }
        }
        for (const id of createdIds.habitLogs || []) {
          if (id) {
            await base44.entities.HabitLog.delete(id).catch(e => console.error('Rollback error:', e));
          }
        }
        for (const id of createdIds.habits || []) {
          if (id) {
            await base44.entities.Habit.delete(id).catch(e => console.error('Rollback error:', e));
          }
        }
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      
      throw new Error('Import failed. No data was changed.');
    }
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStage('validating');
    setError(null);

    try {
      const text = await selectedFile.text();
      const backupData = JSON.parse(text);

      const validation = await validateBackup(backupData);
      setValidationResult(validation);

      if (!validation.valid) {
        setError(validation.errors.join(', '));
        setStage('idle');
        return;
      }

      const preview = await generateImportPreview(validation.sections, validation.isNewFormat);
      setImportPreview(preview);
      setStage('preview');
    } catch (err) {
      setError(err.message || 'Invalid backup file');
      setStage('idle');
    }

    event.target.value = '';
  };

  const handleConfirmImport = async () => {
    setStage('importing');
    try {
      const result = await executeImport(validationResult.sections, importPreview, validationResult.isNewFormat);
      setImportResult(result);
      setStage('complete');
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Import failed. No data was changed.');
      setStage('idle');
    }
  };

  const handleCancel = () => {
    setFile(null);
    setStage('idle');
    setValidationResult(null);
    setImportPreview(null);
    setImportResult(null);
    setError(null);
  };

  const handleClose = () => {
    handleCancel();
    if (onComplete) onComplete();
  };

  if (stage === 'idle') {
    return (
      <div>
        <label
          className="w-full py-3 font-semibold block text-center cursor-pointer"
          style={{
            backgroundColor: '#C9A227',
            color: '#0F1115',
            borderRadius: '18px'
          }}
        >
          Import backup
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        {error && (
          <div className="mt-3 p-3 flex gap-2" style={{ backgroundColor: '#1A1D24', borderRadius: '12px' }}>
            <AlertCircle size={16} style={{ color: '#ff6b6b', marginTop: '2px' }} />
            <p className="text-sm" style={{ color: '#ff6b6b' }}>{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (stage === 'validating') {
    return (
      <div className="p-4 flex items-center gap-3" style={{ backgroundColor: '#1A1D24', borderRadius: '18px' }}>
        <Loader2 size={20} className="animate-spin" style={{ color: '#C9A227' }} />
        <p className="text-sm" style={{ color: '#E8EAF0' }}>Validating backup file...</p>
      </div>
    );
  }

  if (stage === 'preview') {
    const totalCreate = Object.values(importPreview || {}).reduce((sum, section) => {
      return sum + (Array.isArray(section?.create) ? section.create.length : 0);
    }, 0);
    const totalSkip = Object.values(importPreview || {}).reduce((sum, section) => {
      return sum + (Array.isArray(section?.skip) ? section.skip.length : 0);
    }, 0);

    return (
      <div className="space-y-4">
        <div className="p-4" style={{ backgroundColor: '#1A1D24', borderRadius: '18px' }}>
          <h3 className="text-base font-semibold mb-3" style={{ color: '#E8EAF0' }}>
            Import Preview
          </h3>
          
          {validationResult.warnings.length > 0 && (
            <div className="mb-3 p-2 flex gap-2" style={{ backgroundColor: '#0F1115', borderRadius: '12px' }}>
              <Info size={16} style={{ color: '#C9A227', marginTop: '2px' }} />
              <div className="text-xs" style={{ color: '#9AA3B2' }}>
                {validationResult.warnings.map((warning, i) => (
                  <p key={i}>{warning}</p>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
              <span>Records to create:</span>
              <span className="font-semibold" style={{ color: '#C9A227' }}>{totalCreate}</span>
            </div>
            {totalSkip > 0 && (
              <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
                <span>Duplicates to skip:</span>
                <span className="font-semibold" style={{ color: '#9AA3B2' }}>{totalSkip}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 space-y-1 text-xs" style={{ borderTop: '1px solid #0F1115', color: '#9AA3B2' }}>
            <p>Habits: {importPreview.habits.create.length} new, {importPreview.habits.skip.length} duplicates</p>
            <p>Habit logs: {importPreview.habitLogs.create.length} new, {importPreview.habitLogs.skip.length} duplicates</p>
            <p>Journal entries: {importPreview.journalEntries.create.length} new, {importPreview.journalEntries.skip.length} duplicates</p>
            <p>Decisions: {importPreview.decisions.create.length} new, {importPreview.decisions.skip.length} duplicates</p>
          </div>

          {totalSkip > 0 && (
            <div className="mt-3 p-2" style={{ backgroundColor: '#0F1115', borderRadius: '12px' }}>
              <p className="text-xs" style={{ color: '#9AA3B2' }}>
                {totalSkip} duplicate record{totalSkip !== 1 ? 's' : ''} detected. These will be skipped to prevent duplication.
              </p>
            </div>
          )}
          
          {importPreview.unmatchedHabitRefs?.length > 0 && (
            <div className="mt-3 p-2" style={{ backgroundColor: '#0F1115', borderRadius: '12px', border: '1px solid #C9A227' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#C9A227' }}>Warning</p>
              <p className="text-xs" style={{ color: '#9AA3B2' }}>
                {importPreview.unmatchedHabitRefs.length} habit log{importPreview.unmatchedHabitRefs.length !== 1 ? 's' : ''} reference habits not found in this backup or your account. These will be skipped.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleConfirmImport}
            className="flex-1"
            style={{
              backgroundColor: '#C9A227',
              color: '#0F1115',
              borderRadius: '18px',
              fontWeight: 600
            }}
          >
            Confirm import
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
            style={{
              backgroundColor: '#1A1D24',
              color: '#E8EAF0',
              borderRadius: '18px'
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'importing') {
    return (
      <div className="p-4 flex items-center gap-3" style={{ backgroundColor: '#1A1D24', borderRadius: '18px' }}>
        <Loader2 size={20} className="animate-spin" style={{ color: '#C9A227' }} />
        <p className="text-sm" style={{ color: '#E8EAF0' }}>Importing data...</p>
      </div>
    );
  }

  if (stage === 'complete') {
    const totalCreated = Object.values(importResult || {}).reduce((sum, section) => {
      return sum + (section?.created || 0);
    }, 0);
    const totalSkipped = Object.values(importResult || {}).reduce((sum, section) => {
      return sum + (section?.skipped || 0);
    }, 0);
    const hasErrors = Object.values(importResult || {}).some(section => 
      Array.isArray(section?.errors) && section.errors.length > 0
    );

    return (
      <div className="space-y-4">
        <div className="p-4" style={{ backgroundColor: '#1A1D24', borderRadius: '18px' }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={20} style={{ color: '#C9A227' }} />
            <h3 className="text-base font-semibold" style={{ color: '#E8EAF0' }}>
              Import Complete
            </h3>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
              <span>Records created:</span>
              <span className="font-semibold" style={{ color: '#C9A227' }}>{totalCreated}</span>
            </div>
            {totalSkipped > 0 && (
              <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
                <span>Duplicates skipped:</span>
                <span className="font-semibold" style={{ color: '#9AA3B2' }}>{totalSkipped}</span>
              </div>
            )}
          </div>

          <div className="pt-3 space-y-1 text-xs" style={{ borderTop: '1px solid #0F1115', color: '#9AA3B2' }}>
            <p>Habits: {importResult.habits.created} created, {importResult.habits.skipped} skipped</p>
            <p>Habit logs: {importResult.habitLogs.created} created, {importResult.habitLogs.skipped} skipped</p>
            <p>Journal entries: {importResult.journalEntries.created} created, {importResult.journalEntries.skipped} skipped</p>
            <p>Decisions: {importResult.decisions.created} created, {importResult.decisions.skipped} skipped</p>
          </div>

          {hasErrors && (
            <div className="mt-3 p-2" style={{ backgroundColor: '#0F1115', borderRadius: '12px' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#ff6b6b' }}>Errors:</p>
              <div className="space-y-1 text-xs" style={{ color: '#9AA3B2' }}>
                {Object.values(importResult).flatMap(section => section.errors).map((error, i) => (
                  <p key={i}>• {error}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleClose}
          className="w-full"
          style={{
            backgroundColor: '#C9A227',
            color: '#0F1115',
            borderRadius: '18px',
            fontWeight: 600
          }}
        >
          Done
        </Button>
      </div>
    );
  }

  return null;
}