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

    const existingHabitIds = new Set(existingHabits.map(h => h.id));
    const existingLogIds = new Set(existingLogs.map(l => l.id));
    const existingJournalIds = new Set(existingJournals.map(j => j.id));
    const existingDecisionIds = new Set(existingDecisions.map(d => d.id));

    const preview = {
      habits: {
        create: sections.habits.filter(h => !existingHabitIds.has(h.id)),
        update: sections.habits.filter(h => existingHabitIds.has(h.id)),
        skip: []
      },
      habitLogs: {
        create: sections.habitLogs.filter(l => !existingLogIds.has(l.id)),
        update: sections.habitLogs.filter(l => existingLogIds.has(l.id)),
        skip: []
      },
      journalEntries: {
        create: sections.journalEntries.filter(j => !existingJournalIds.has(j.id)),
        update: sections.journalEntries.filter(j => existingJournalIds.has(j.id)),
        skip: []
      },
      decisions: {
        create: sections.decisions.filter(d => !existingDecisionIds.has(d.id)),
        update: sections.decisions.filter(d => existingDecisionIds.has(d.id)),
        skip: []
      }
    };

    // Check referential integrity - logs referencing missing habits
    const habitIdMap = new Map(sections.habits.map(h => [h.id, h]));
    preview.habitLogs.skip = sections.habitLogs.filter(log => {
      return log.habitId && !habitIdMap.has(log.habitId) && !existingHabitIds.has(log.habitId);
    });
    
    preview.habitLogs.create = preview.habitLogs.create.filter(log => !preview.habitLogs.skip.includes(log));
    preview.habitLogs.update = preview.habitLogs.update.filter(log => !preview.habitLogs.skip.includes(log));

    return preview;
  };

  const executeImport = async (sections, preview) => {
    const currentUserId = userProfile.id;
    const results = {
      habits: { created: 0, updated: 0, skipped: 0, errors: [] },
      habitLogs: { created: 0, updated: 0, skipped: 0, errors: [] },
      journalEntries: { created: 0, updated: 0, skipped: 0, errors: [] },
      decisions: { created: 0, updated: 0, skipped: 0, errors: [] }
    };

    // Import habits
    for (const habit of preview.habits.create) {
      try {
        const { id, created_date, updated_date, created_by, userId, ...data } = habit;
        await base44.entities.Habit.create({
          ...data,
          userId: currentUserId
        });
        results.habits.created++;
      } catch (error) {
        results.habits.errors.push(`Failed to create habit "${habit.name}": ${error.message}`);
      }
    }

    for (const habit of preview.habits.update) {
      try {
        const { created_date, updated_date, created_by, userId, ...data } = habit;
        await base44.entities.Habit.update(habit.id, data);
        results.habits.updated++;
      } catch (error) {
        results.habits.errors.push(`Failed to update habit "${habit.name}": ${error.message}`);
      }
    }

    // Import habit logs
    for (const log of preview.habitLogs.create) {
      try {
        const { id, created_date, updated_date, created_by, userId, ...data } = log;
        await base44.entities.HabitLog.create({
          ...data,
          userId: currentUserId
        });
        results.habitLogs.created++;
      } catch (error) {
        results.habitLogs.errors.push(`Failed to create log: ${error.message}`);
      }
    }

    for (const log of preview.habitLogs.update) {
      try {
        const { created_date, updated_date, created_by, userId, ...data } = log;
        await base44.entities.HabitLog.update(log.id, data);
        results.habitLogs.updated++;
      } catch (error) {
        results.habitLogs.errors.push(`Failed to update log: ${error.message}`);
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

    for (const entry of preview.journalEntries.update) {
      try {
        const { created_date, updated_date, created_by, userId, ...data } = entry;
        await base44.entities.JournalEntry.update(entry.id, data);
        results.journalEntries.updated++;
      } catch (error) {
        results.journalEntries.errors.push(`Failed to update journal "${entry.title || 'Untitled'}": ${error.message}`);
      }
    }

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

    for (const decision of preview.decisions.update) {
      try {
        const { created_date, updated_date, created_by, userId, ...data } = decision;
        await base44.entities.Decision.update(decision.id, data);
        results.decisions.updated++;
      } catch (error) {
        results.decisions.errors.push(`Failed to update decision "${decision.title}": ${error.message}`);
      }
    }

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
    const totalUpdate = Object.values(importPreview).reduce((sum, section) => sum + section.update.length, 0);
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
            <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
              <span>Records to update:</span>
              <span className="font-semibold" style={{ color: '#C9A227' }}>{totalUpdate}</span>
            </div>
            {totalSkip > 0 && (
              <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
                <span>Records to skip:</span>
                <span className="font-semibold" style={{ color: '#9AA3B2' }}>{totalSkip}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 space-y-1 text-xs" style={{ borderTop: '1px solid #0F1115', color: '#9AA3B2' }}>
            <p>Habits: {importPreview.habits.create.length} new, {importPreview.habits.update.length} update</p>
            <p>Habit logs: {importPreview.habitLogs.create.length} new, {importPreview.habitLogs.update.length} update, {importPreview.habitLogs.skip.length} skip</p>
            <p>Journal entries: {importPreview.journalEntries.create.length} new, {importPreview.journalEntries.update.length} update</p>
            <p>Decisions: {importPreview.decisions.create.length} new, {importPreview.decisions.update.length} update</p>
          </div>

          {totalSkip > 0 && (
            <div className="mt-3 p-2" style={{ backgroundColor: '#0F1115', borderRadius: '12px' }}>
              <p className="text-xs" style={{ color: '#9AA3B2' }}>
                Some habit logs will be skipped because they reference habits not in the backup or your account.
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
    const totalUpdated = Object.values(importResult).reduce((sum, section) => sum + section.updated, 0);
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
            <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
              <span>Records updated:</span>
              <span className="font-semibold" style={{ color: '#C9A227' }}>{totalUpdated}</span>
            </div>
            {totalSkipped > 0 && (
              <div className="flex justify-between" style={{ color: '#E8EAF0' }}>
                <span>Records skipped:</span>
                <span className="font-semibold" style={{ color: '#9AA3B2' }}>{totalSkipped}</span>
              </div>
            )}
          </div>

          <div className="pt-3 space-y-1 text-xs" style={{ borderTop: '1px solid #0F1115', color: '#9AA3B2' }}>
            <p>Habits: {importResult.habits.created} created, {importResult.habits.updated} updated</p>
            <p>Habit logs: {importResult.habitLogs.created} created, {importResult.habitLogs.updated} updated, {importResult.habitLogs.skipped} skipped</p>
            <p>Journal entries: {importResult.journalEntries.created} created, {importResult.journalEntries.updated} updated</p>
            <p>Decisions: {importResult.decisions.created} created, {importResult.decisions.updated} updated</p>
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