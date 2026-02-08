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
    const name = (habit.name || '').toLowerCase().trim();
    const scheduleType = habit.scheduleType || '';
    const description = (habit.description || '').toLowerCase().trim();
    return `${name}|${scheduleType}|${description}`;
  };

  const computeLogKey = (habitKey, date) => {
    return `${habitKey}|${date}`;
  };

  const computeJournalKey = (entry) => {
    const createdDate = entry.created_date || '';
    const title = (entry.title || '').toLowerCase().trim();
    if (title) {
      return `${createdDate}|${title}`;
    }
    const bodyStart = (entry.body || '').substring(0, 80).toLowerCase().trim();
    return `${createdDate}|${bodyStart}`;
  };

  const computeDecisionKey = (decision) => {
    const createdDate = decision.created_date || '';
    const title = (decision.title || '').toLowerCase().trim();
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
      sections: {
        habits: backupData.habits || [],
        habitLogs: backupData.habitLogs || [],
        journalEntries: backupData.journalEntries || [],
        decisions: backupData.decisions || []
      }
    };
  };

  const generateImportPreview = async (sections) => {
    const currentUserId = userProfile.id;

    // Fetch existing records
    const existingHabits = await base44.entities.Habit.filter({ userId: currentUserId });
    const existingLogs = await base44.entities.HabitLog.filter({ userId: currentUserId });
    const existingJournals = await base44.entities.JournalEntry.filter({ userId: currentUserId });
    const existingDecisions = await base44.entities.Decision.filter({ userId: currentUserId });

    // Build lookup maps using deterministic keys
    const existingHabitsByKey = new Map();
    const existingHabitsByExtId = new Map();
    existingHabits.forEach(h => {
      const key = computeHabitKey(h);
      existingHabitsByKey.set(key, h);
      if (h.externalId) {
        existingHabitsByExtId.set(h.externalId, h);
      }
    });

    const existingLogsByKey = new Map();
    existingLogs.forEach(log => {
      const habit = existingHabits.find(h => h.id === log.habitId);
      if (habit) {
        const habitKey = computeHabitKey(habit);
        const logKey = computeLogKey(habitKey, log.date);
        existingLogsByKey.set(logKey, log);
      }
    });

    const existingJournalsByKey = new Map();
    const existingJournalsByExtId = new Map();
    existingJournals.forEach(j => {
      const key = computeJournalKey(j);
      existingJournalsByKey.set(key, j);
      if (j.externalId) {
        existingJournalsByExtId.set(j.externalId, j);
      }
    });

    const existingDecisionsByKey = new Map();
    const existingDecisionsByExtId = new Map();
    existingDecisions.forEach(d => {
      const key = computeDecisionKey(d);
      existingDecisionsByKey.set(key, d);
      if (d.externalId) {
        existingDecisionsByExtId.set(d.externalId, d);
      }
    });

    const preview = {
      habits: {
        create: [],
        skip: []
      },
      habitLogs: {
        create: [],
        skip: []
      },
      journalEntries: {
        create: [],
        skip: []
      },
      decisions: {
        create: [],
        skip: []
      }
    };

    // Track habits being imported (for log resolution)
    const importedHabitMap = new Map(); // backup habit id -> habit key

    // Process habits - deduplicate by externalId OR content key
    sections.habits.forEach(habit => {
      const habitKey = computeHabitKey(habit);
      importedHabitMap.set(habit.id, habitKey);
      
      let isDuplicate = false;
      
      // Check by externalId first (if present)
      if (habit.externalId && existingHabitsByExtId.has(habit.externalId)) {
        isDuplicate = true;
      }
      // Fall back to content-based key
      else if (existingHabitsByKey.has(habitKey)) {
        isDuplicate = true;
      }
      
      if (isDuplicate) {
        preview.habits.skip.push(habit);
      } else {
        preview.habits.create.push(habit);
      }
    });

    // Process journal entries - deduplicate by externalId OR content key
    sections.journalEntries.forEach(entry => {
      const journalKey = computeJournalKey(entry);
      
      let isDuplicate = false;
      
      if (entry.externalId && existingJournalsByExtId.has(entry.externalId)) {
        isDuplicate = true;
      } else if (existingJournalsByKey.has(journalKey)) {
        isDuplicate = true;
      }
      
      if (isDuplicate) {
        preview.journalEntries.skip.push(entry);
      } else {
        preview.journalEntries.create.push(entry);
      }
    });

    // Process decisions - deduplicate by externalId OR content key
    sections.decisions.forEach(decision => {
      const decisionKey = computeDecisionKey(decision);
      
      let isDuplicate = false;
      
      if (decision.externalId && existingDecisionsByExtId.has(decision.externalId)) {
        isDuplicate = true;
      } else if (existingDecisionsByKey.has(decisionKey)) {
        isDuplicate = true;
      }
      
      if (isDuplicate) {
        preview.decisions.skip.push(decision);
      } else {
        preview.decisions.create.push(decision);
      }
    });

    // Process habit logs - deduplicate by habit key + date
    const processedLogKeys = new Set();
    
    sections.habitLogs.forEach(log => {
      // Get habit key from backup
      const habitKey = importedHabitMap.get(log.habitId);
      
      if (!habitKey) {
        // Habit not in backup - check if it exists in user's account
        const existingHabit = existingHabits.find(h => h.id === log.habitId);
        if (!existingHabit) {
          preview.habitLogs.skip.push(log);
          return;
        }
      }
      
      const resolvedHabitKey = habitKey || computeHabitKey(existingHabits.find(h => h.id === log.habitId));
      const logKey = computeLogKey(resolvedHabitKey, log.date);
      
      // Check if duplicate
      if (existingLogsByKey.has(logKey) || processedLogKeys.has(logKey)) {
        preview.habitLogs.skip.push(log);
      } else {
        preview.habitLogs.create.push(log);
        processedLogKeys.add(logKey);
      }
    });

    return preview;
  };

  const executeImport = async (sections, preview) => {
    const currentUserId = userProfile.id;
    const results = {
      habits: { created: 0, skipped: 0, errors: [] },
      habitLogs: { created: 0, skipped: 0, errors: [] },
      journalEntries: { created: 0, skipped: 0, errors: [] },
      decisions: { created: 0, skipped: 0, errors: [] }
    };

    // Fetch existing habits and build key mappings
    const existingHabits = await base44.entities.Habit.filter({ userId: currentUserId });
    
    // Map habit keys to internal IDs (for both existing and to-be-created habits)
    const habitKeyToInternalId = new Map();
    existingHabits.forEach(h => {
      const key = computeHabitKey(h);
      habitKeyToInternalId.set(key, h.id);
    });

    // Import habits
    for (const habit of preview.habits.create) {
      try {
        const { id, created_date, updated_date, created_by, userId, ...data } = habit;
        
        // Generate externalId if not present (for future exports)
        if (!data.externalId) {
          data.externalId = generateExternalId();
        }
        
        const newHabit = await base44.entities.Habit.create({
          ...data,
          userId: currentUserId
        });
        
        // Track the new mapping
        const habitKey = computeHabitKey(habit);
        habitKeyToInternalId.set(habitKey, newHabit.id);
        
        results.habits.created++;
      } catch (error) {
        results.habits.errors.push(`Failed to create habit "${habit.name}": ${error.message}`);
      }
    }

    results.habits.skipped = preview.habits.skip.length;

    // Import habit logs
    for (const log of preview.habitLogs.create) {
      try {
        const { id, created_date, updated_date, created_by, userId, ...data } = log;
        
        // Generate externalId if not present
        if (!data.externalId) {
          data.externalId = generateExternalId();
        }
        
        // Map habitId using habit key
        const habitFromBackup = sections.habits.find(h => h.id === log.habitId);
        let actualHabitId;
        
        if (habitFromBackup) {
          const habitKey = computeHabitKey(habitFromBackup);
          actualHabitId = habitKeyToInternalId.get(habitKey);
        } else {
          // Habit not in backup, use existing habitId
          actualHabitId = log.habitId;
        }
        
        if (!actualHabitId) {
          results.habitLogs.errors.push(`Failed to create log: habit not found`);
          continue;
        }
        
        await base44.entities.HabitLog.create({
          ...data,
          habitId: actualHabitId,
          userId: currentUserId
        });
        results.habitLogs.created++;
      } catch (error) {
        results.habitLogs.errors.push(`Failed to create log: ${error.message}`);
      }
    }

    results.habitLogs.skipped = preview.habitLogs.skip.length;

    // Import journal entries
    for (const entry of preview.journalEntries.create) {
      try {
        const { id, created_date, updated_date, created_by, userId, ...data } = entry;
        
        if (!data.externalId) {
          data.externalId = generateExternalId();
        }
        
        await base44.entities.JournalEntry.create({
          ...data,
          userId: currentUserId
        });
        results.journalEntries.created++;
      } catch (error) {
        results.journalEntries.errors.push(`Failed to create journal "${entry.title || 'Untitled'}": ${error.message}`);
      }
    }

    results.journalEntries.skipped = preview.journalEntries.skip.length;

    // Import decisions
    for (const decision of preview.decisions.create) {
      try {
        const { id, created_date, updated_date, created_by, userId, ...data } = decision;
        
        if (!data.externalId) {
          data.externalId = generateExternalId();
        }
        
        await base44.entities.Decision.create({
          ...data,
          userId: currentUserId
        });
        results.decisions.created++;
      } catch (error) {
        results.decisions.errors.push(`Failed to create decision "${decision.title}": ${error.message}`);
      }
    }

    results.decisions.skipped = preview.decisions.skip.length;

    return results;
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

      const preview = await generateImportPreview(validation.sections);
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
      const result = await executeImport(validationResult.sections, importPreview);
      setImportResult(result);
      setStage('complete');
    } catch (err) {
      setError(err.message || 'Import failed');
      setStage('preview');
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
    const totalCreate = Object.values(importPreview).reduce((sum, section) => sum + section.create.length, 0);
    const totalSkip = Object.values(importPreview).reduce((sum, section) => sum + section.skip.length, 0);

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
    const totalCreated = Object.values(importResult).reduce((sum, section) => sum + section.created, 0);
    const totalSkipped = Object.values(importResult).reduce((sum, section) => sum + section.skipped, 0);
    const hasErrors = Object.values(importResult).some(section => section.errors.length > 0);

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