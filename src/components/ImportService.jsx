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

    // Build maps by externalId for deduplication
    const existingHabitsByExtId = new Map(existingHabits.filter(h => h.externalId).map(h => [h.externalId, h]));
    const existingJournalsByExtId = new Map(existingJournals.filter(j => j.externalId).map(j => [j.externalId, j]));
    const existingDecisionsByExtId = new Map(existingDecisions.filter(d => d.externalId).map(d => [d.externalId, d]));

    // Build habit externalId map for log deduplication
    const habitExtIdToId = new Map();
    existingHabits.forEach(h => {
      if (h.externalId) habitExtIdToId.set(h.externalId, h.id);
    });
    sections.habits.forEach(h => {
      if (h.externalId) habitExtIdToId.set(h.externalId, h.id);
    });

    // For HabitLog: composite key (habitExternalId + date + userId)
    const existingLogKeys = new Set();
    existingLogs.forEach(log => {
      const habit = existingHabits.find(h => h.id === log.habitId);
      if (habit?.externalId) {
        existingLogKeys.add(`${habit.externalId}:${log.date}`);
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

    // Process habits - deduplicate by externalId
    sections.habits.forEach(habit => {
      // Ensure externalId exists (backward compatibility)
      if (!habit.externalId) {
        habit.externalId = generateExternalId();
      }
      
      if (existingHabitsByExtId.has(habit.externalId)) {
        preview.habits.skip.push(habit);
      } else {
        preview.habits.create.push(habit);
      }
    });

    // Process journal entries - deduplicate by externalId
    sections.journalEntries.forEach(entry => {
      if (!entry.externalId) {
        entry.externalId = generateExternalId();
      }
      
      if (existingJournalsByExtId.has(entry.externalId)) {
        preview.journalEntries.skip.push(entry);
      } else {
        preview.journalEntries.create.push(entry);
      }
    });

    // Process decisions - deduplicate by externalId
    sections.decisions.forEach(decision => {
      if (!decision.externalId) {
        decision.externalId = generateExternalId();
      }
      
      if (existingDecisionsByExtId.has(decision.externalId)) {
        preview.decisions.skip.push(decision);
      } else {
        preview.decisions.create.push(decision);
      }
    });

    // Process habit logs - composite deduplication
    const habitExtIdMap = new Map(sections.habits.map(h => [h.id, h.externalId]));
    
    sections.habitLogs.forEach(log => {
      if (!log.externalId) {
        log.externalId = generateExternalId();
      }
      
      // Find habit's externalId (from backup or existing)
      let habitExternalId = habitExtIdMap.get(log.habitId);
      if (!habitExternalId) {
        const existingHabit = existingHabits.find(h => h.id === log.habitId);
        habitExternalId = existingHabit?.externalId;
      }
      
      if (!habitExternalId) {
        // Habit doesn't exist - skip this log
        preview.habitLogs.skip.push(log);
        return;
      }
      
      const logKey = `${habitExternalId}:${log.date}`;
      if (existingLogKeys.has(logKey)) {
        // Duplicate log for same habit+date
        preview.habitLogs.skip.push(log);
      } else {
        preview.habitLogs.create.push(log);
        existingLogKeys.add(logKey); // Track to avoid duplicates within this import
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

    // Fetch existing habits to map externalIds to internal IDs
    const existingHabits = await base44.entities.Habit.filter({ userId: currentUserId });
    const habitExtIdToInternalId = new Map(
      existingHabits.filter(h => h.externalId).map(h => [h.externalId, h.id])
    );

    // Import habits
    for (const habit of preview.habits.create) {
      try {
        const { id, created_date, updated_date, created_by, userId, ...data } = habit;
        const newHabit = await base44.entities.Habit.create({
          ...data,
          userId: currentUserId
        });
        // Track the new mapping
        habitExtIdToInternalId.set(newHabit.externalId, newHabit.id);
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
        
        // Map habitId from backup to actual internal ID
        const habitFromBackup = sections.habits.find(h => h.id === log.habitId);
        const habitExternalId = habitFromBackup?.externalId;
        const actualHabitId = habitExternalId ? habitExtIdToInternalId.get(habitExternalId) : log.habitId;
        
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