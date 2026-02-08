import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ChevronRight, ArrowLeft, Moon } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import ImportService from '../components/ImportService';
import ErrorBoundary from '../components/ErrorBoundary';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BUILD_TIMESTAMP = new Date().toISOString();

export default function Settings() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [savingQuietHours, setSavingQuietHours] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [showIsolationCheck, setShowIsolationCheck] = useState(false);
  const [isolationData, setIsolationData] = useState(null);
  const [runningIsolationCheck, setRunningIsolationCheck] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [backupExporting, setBackupExporting] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [showImportService, setShowImportService] = useState(false);
  const [showSafetyGateModal, setShowSafetyGateModal] = useState(false);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [pendingImportData, setPendingImportData] = useState(null);
  const [importReport, setImportReport] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        
        if (userProfiles.length > 0) {
          const profile = userProfiles[0];
          setUserProfile(profile);
          setQuietHoursEnabled(profile.quietHoursEnabled || false);
          setQuietHoursStart(profile.quietHoursStart || '22:00');
          setQuietHoursEnd(profile.quietHoursEnd || '08:00');
        }
        
        // Load diagnostics data
        const lastError = localStorage.getItem('seanna_last_error');
        const lastSync = localStorage.getItem('seanna_last_sync');
        setDiagnosticsData({
          lastError: lastError ? JSON.parse(lastError) : null,
          lastSync: lastSync || 'Never',
          appVersion: '1.0.0'
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleDeleteRequest = async () => {
    setDeleting(true);
    try {
      await base44.entities.DeletionRequest.create({
        userId: userProfile.id,
        status: 'requested'
      });
      setDeleteMessage('Deletion request submitted successfully.');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error requesting deletion:', error);
      setDeleteMessage('Failed to request deletion. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuietHoursToggle = async (checked) => {
    setSavingQuietHours(true);
    try {
      setQuietHoursEnabled(checked);
      await base44.entities.UserProfile.update(userProfile.id, { 
        quietHoursEnabled: checked,
        quietHoursStart,
        quietHoursEnd
      });
      toast.success(checked ? 'Quiet hours enabled' : 'Quiet hours disabled');
    } catch (error) {
      console.error('Error updating quiet hours:', error);
      toast.error('Failed to update');
    } finally {
      setSavingQuietHours(false);
    }
  };

  const handleQuietHoursTimeChange = async (field, value) => {
    if (!value) return;
    
    setSavingQuietHours(true);
    try {
      if (field === 'start') {
        setQuietHoursStart(value);
        await base44.entities.UserProfile.update(userProfile.id, { 
          quietHoursStart: value,
          quietHoursEnabled,
          quietHoursEnd
        });
      } else {
        setQuietHoursEnd(value);
        await base44.entities.UserProfile.update(userProfile.id, { 
          quietHoursEnd: value,
          quietHoursEnabled,
          quietHoursStart
        });
      }
      toast.success('Quiet hours updated');
    } catch (error) {
      console.error('Error updating quiet hours:', error);
      toast.error('Failed to update');
    } finally {
      setSavingQuietHours(false);
    }
  };

  const generateExternalId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const ensureExternalIds = async (records, entityName) => {
    const updates = [];
    for (const record of records) {
      if (!record.externalId) {
        const externalId = generateExternalId();
        updates.push(
          base44.entities[entityName].update(record.id, { externalId })
            .then(() => ({ ...record, externalId }))
        );
      } else {
        updates.push(Promise.resolve(record));
      }
    }
    return Promise.all(updates);
  };

  const handleExportJSON = async () => {
    setBackupExporting(true);
    setBackupMessage('');
    try {
      // Fetch all user data (including archived/inactive habits)
      let habits = await base44.entities.Habit.filter({ userId: userProfile.id });
      let logs = await base44.entities.HabitLog.filter({ userId: userProfile.id });
      let journalEntries = await base44.entities.JournalEntry.filter({ userId: userProfile.id });
      let decisions = await base44.entities.Decision.filter({ userId: userProfile.id });
      
      // Ensure all records have externalIds
      habits = await ensureExternalIds(habits, 'Habit');
      logs = await ensureExternalIds(logs, 'HabitLog');
      journalEntries = await ensureExternalIds(journalEntries, 'JournalEntry');
      decisions = await ensureExternalIds(decisions, 'Decision');
      
      // Build habit id to externalId map
      const habitIdToExtId = new Map(habits.map(h => [h.id, h.externalId]));
      
      // Find habit IDs referenced by logs
      const referencedHabitIds = new Set(logs.map(log => log.habitId).filter(Boolean));
      
      // Validate: check if any logs reference missing habits
      const exportWarnings = [];
      const validLogs = [];
      
      logs.forEach(log => {
        const habitExtId = habitIdToExtId.get(log.habitId);
        if (!habitExtId) {
          exportWarnings.push(`Log excluded: habit ID ${log.habitId} not found`);
        } else {
          validLogs.push({
            externalId: log.externalId,
            habitExternalId: habitExtId,
            date: log.date,
            status: log.status,
            note: log.note,
            created_date: log.created_date
          });
        }
      });
      
      const backup = {
        version: '1.1.0',
        exportDate: new Date().toISOString(),
        userProfile: {
          displayName: userProfile.displayName,
          timezone: userProfile.timezone,
          planTier: userProfile.planTier
        },
        habits,
        habitLogs: validLogs,
        journalEntries,
        decisions,
        ...(exportWarnings.length > 0 && { exportWarnings })
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seanna-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      setBackupMessage(exportWarnings.length > 0 ? `Backup downloaded (${exportWarnings.length} warnings)` : 'Backup downloaded');
    } catch (error) {
      console.error('Error exporting data:', error);
      setBackupMessage('Export failed');
    } finally {
      setBackupExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setBackupExporting(true);
    setBackupMessage('');
    try {
      const habits = await base44.entities.Habit.filter({ userId: userProfile.id });
      const logs = await base44.entities.HabitLog.filter({ userId: userProfile.id });
      
      // Calculate stats for each habit
      const habitStats = habits.map(habit => {
        const habitLogs = logs.filter(log => log.habitId === habit.id);
        const doneCount = habitLogs.filter(log => log.status === 'done').length;
        const totalLogs = habitLogs.length;
        const completionRate = totalLogs > 0 ? Math.round((doneCount / totalLogs) * 100) : 0;
        
        return {
          name: habit.name,
          description: habit.description || '',
          scheduleType: habit.scheduleType,
          isActive: habit.isActive,
          totalLogs,
          completedLogs: doneCount,
          completionRate: `${completionRate}%`,
          createdDate: habit.created_date
        };
      });
      
      // Create CSV
      const headers = ['Name', 'Description', 'Schedule', 'Active', 'Total Logs', 'Completed', 'Completion Rate', 'Created'];
      const rows = habitStats.map(h => [
        h.name,
        h.description,
        h.scheduleType,
        h.isActive ? 'Yes' : 'No',
        h.totalLogs,
        h.completedLogs,
        h.completionRate,
        h.createdDate
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seanna-habits-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      setBackupMessage('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setBackupMessage('Export failed');
    } finally {
      setBackupExporting(false);
    }
  };

  const handleImportReportGenerated = async (reportData) => {
    try {
      // Check if this backup was already imported
      if (reportData.backupHash) {
        const receipts = await base44.entities.ImportReceipt.filter({ 
          userId: userProfile.id,
          backupHash: reportData.backupHash
        });
        
        if (receipts.length > 0) {
          // Found existing import - show safety gate
          setExistingReceipt(receipts[0]);
          setPendingImportData(reportData);
          setShowSafetyGateModal(true);
          return;
        }
      }
      
      // If import result is available, generate report
      if (reportData.result) {
        await generateImportReport(reportData);
      }
    } catch (error) {
      console.error('Error checking import receipt:', error);
      toast.error('Failed to check import history');
    }
  };

  const generateImportReport = async (reportData) => {
    try {
      const result = reportData?.result ?? {};
      const preview = reportData?.preview ?? {};
      
      const report = {
        backupHash: reportData?.backupHash ?? 'unknown',
        fileName: reportData?.fileName ?? 'unknown',
        version: reportData?.version ?? '1.0.0',
        importedAt: new Date().toISOString(),
        created: {
          habits: result.habits?.created ?? 0,
          habitLogs: result.habitLogs?.created ?? 0,
          journalEntries: result.journalEntries?.created ?? 0,
          decisions: result.decisions?.created ?? 0
        },
        skipped: {
          habits: result.habits?.skipped ?? 0,
          habitLogs: result.habitLogs?.skipped ?? 0,
          journalEntries: result.journalEntries?.skipped ?? 0,
          decisions: result.decisions?.skipped ?? 0
        },
        duplicates: [
          ...(Array.isArray(preview.habits?.duplicates) ? preview.habits.duplicates : []),
          ...(Array.isArray(preview.habitLogs?.duplicates) ? preview.habitLogs.duplicates : []),
          ...(Array.isArray(preview.journalEntries?.duplicates) ? preview.journalEntries.duplicates : []),
          ...(Array.isArray(preview.decisions?.duplicates) ? preview.decisions.duplicates : [])
        ],
        missingRefs: Array.isArray(preview.unmatchedHabitRefs) ? preview.unmatchedHabitRefs : [],
        missingHabitIds: Array.from(preview.missingHabitIds ?? []),
        warnings: Array.isArray(preview.warnings) ? preview.warnings : [],
        errors: Array.isArray(result.errors) ? result.errors : []
      };
      
      setImportReport(report);
      
      // Save import receipt (wrapped in try/catch)
      try {
        await base44.entities.ImportReceipt.create({
          userId: userProfile.id,
          backupHash: report.backupHash,
          fileName: report.fileName,
          version: report.version,
          importedAt: report.importedAt,
          countsCreated: report.created,
          countsSkipped: report.skipped,
          warnings: report.warnings,
          errors: report.errors.map(e => String(e))
        });
      } catch (receiptError) {
        console.error('Failed to save import receipt:', receiptError);
      }
      
      toast.success('Import complete');
    } catch (error) {
      console.error('Error generating import report:', error);
      setImportReport({
        backupHash: 'error',
        fileName: 'error',
        version: '1.0.0',
        importedAt: new Date().toISOString(),
        created: { habits: 0, habitLogs: 0, journalEntries: 0, decisions: 0 },
        skipped: { habits: 0, habitLogs: 0, journalEntries: 0, decisions: 0 },
        duplicates: [],
        missingRefs: [],
        missingHabitIds: [],
        warnings: [],
        errors: [error.message || 'Unknown error']
      });
      toast.error('Import completed but report generation failed');
    }
  };

  const handleImportComplete = () => {
    setShowImportService(false);
    setShowSafetyGateModal(false);
    setPendingImportData(null);
  };

  const handleSafetyGateCancel = () => {
    setShowSafetyGateModal(false);
    setPendingImportData(null);
    setShowImportService(false);
  };

  const handleSafetyGateConfirm = () => {
    setShowSafetyGateModal(false);
    // Import will proceed in ImportService
  };

  const downloadImportReport = () => {
    if (!importReport) return;
    
    const blob = new Blob([JSON.stringify(importReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seanna-import-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const handleIsolationCheck = async () => {
    setRunningIsolationCheck(true);
    try {
      const currentUser = await base44.auth.me();
      const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      const userId = userProfiles[0]?.id;

      if (!userId) {
        setIsolationData({ error: 'No user profile found' });
        return;
      }

      // Fetch all data
      const habits = await base44.entities.Habit.filter({ userId });
      const habitLogs = await base44.entities.HabitLog.filter({ userId });
      const journals = await base44.entities.JournalEntry.filter({ userId });
      const decisions = await base44.entities.Decision.filter({ userId });
      const options = await base44.entities.DecisionOption.filter({ userId });
      const criteria = await base44.entities.DecisionCriterion.filter({ userId });
      const scores = await base44.entities.DecisionScore.filter({ userId });

      // Check for ownership mismatches
      const checkOwnership = (records, ownerField, modelName) => {
        const mismatches = records.filter(r => r[ownerField] !== userId);
        return {
          total: records.length,
          mismatches: mismatches.length,
          model: modelName,
          ownerField
        };
      };

      const results = {
        userProfile: { total: 1, mismatches: 0, model: 'UserProfile', ownerField: 'created_by' },
        habits: checkOwnership(habits, 'userId', 'Habit'),
        habitLogs: checkOwnership(habitLogs, 'userId', 'HabitLog'),
        journals: checkOwnership(journals, 'userId', 'JournalEntry'),
        decisions: checkOwnership(decisions, 'userId', 'Decision'),
        options: checkOwnership(options, 'userId', 'DecisionOption'),
        criteria: checkOwnership(criteria, 'userId', 'DecisionCriterion'),
        scores: checkOwnership(scores, 'userId', 'DecisionScore')
      };

      const totalRecords = Object.values(results).reduce((sum, r) => sum + r.total, 0);
      const totalMismatches = Object.values(results).reduce((sum, r) => sum + r.mismatches, 0);

      setIsolationData({
        userId,
        userEmail: currentUser.email,
        totalRecords,
        totalMismatches,
        details: results,
        timestamp: new Date().toISOString()
      });
      setShowIsolationCheck(true);
    } catch (error) {
      console.error('Error running isolation check:', error);
      setIsolationData({ error: error.message });
    } finally {
      setRunningIsolationCheck(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
        <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2"
          style={{ color: '#9AA3B2' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Settings
          </h1>
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            Manage your account and data.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : (
          <div className="space-y-4">
            {/* Card 1: Account */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Account
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                    Display Name
                  </p>
                  <p className="text-base" style={{ color: '#E8EAF0' }}>
                    {userProfile?.displayName || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                    Plan
                  </p>
                  <span
                    className="inline-block px-3 py-1 text-sm font-semibold"
                    style={{
                      backgroundColor: userProfile?.planTier === 'premium' ? '#C9A227' : '#0F1115',
                      color: userProfile?.planTier === 'premium' ? '#0F1115' : '#C9A227',
                      borderRadius: '12px'
                    }}
                  >
                    {userProfile?.planTier === 'premium' ? 'Premium' : 'Free'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Moon size={18} style={{ color: '#C9A227' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#E8EAF0' }}>
                  Quiet hours
                </h2>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="quiet-hours-toggle" style={{ color: '#E8EAF0' }}>
                  Enable quiet hours
                </Label>
                <Switch
                  id="quiet-hours-toggle"
                  checked={quietHoursEnabled}
                  onCheckedChange={handleQuietHoursToggle}
                  disabled={savingQuietHours}
                />
              </div>
              
              {quietHoursEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="quiet-start" className="text-sm mb-2 block" style={{ color: '#9AA3B2' }}>
                      Start time
                    </Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => handleQuietHoursTimeChange('start', e.target.value)}
                      disabled={savingQuietHours}
                      style={{
                        backgroundColor: '#0F1115',
                        color: '#E8EAF0',
                        border: '1px solid #2A2F3A',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quiet-end" className="text-sm mb-2 block" style={{ color: '#9AA3B2' }}>
                      End time
                    </Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => handleQuietHoursTimeChange('end', e.target.value)}
                      disabled={savingQuietHours}
                      style={{
                        backgroundColor: '#0F1115',
                        color: '#E8EAF0',
                        border: '1px solid #2A2F3A',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                  
                  <p className="text-xs" style={{ color: '#9AA3B2' }}>
                    Reminders will not be sent during quiet hours
                  </p>
                </div>
              )}
            </div>

            {/* Backup */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Backup
              </h2>
              <div className="space-y-2">
                <button
                  onClick={handleExportJSON}
                  disabled={backupExporting || showImportService}
                  className="w-full py-3 font-semibold"
                  style={{
                    backgroundColor: '#C9A227',
                    color: '#0F1115',
                    borderRadius: '18px',
                    opacity: (backupExporting || showImportService) ? 0.5 : 1
                  }}
                >
                  {backupExporting ? 'Downloading...' : 'Download backup'}
                </button>
                
                <button
                  onClick={handleExportCSV}
                  disabled={backupExporting || showImportService}
                  className="w-full py-3 font-semibold"
                  style={{
                    backgroundColor: '#C9A227',
                    color: '#0F1115',
                    borderRadius: '18px',
                    opacity: (backupExporting || showImportService) ? 0.5 : 1
                  }}
                >
                  Export habits summary (CSV)
                </button>
                
                {!showImportService ? (
                  <button
                    onClick={() => {
                      setShowImportService(true);
                      setImportReport(null);
                    }}
                    disabled={backupExporting}
                    className="w-full py-3 font-semibold"
                    style={{
                      backgroundColor: '#C9A227',
                      color: '#0F1115',
                      borderRadius: '18px',
                      opacity: backupExporting ? 0.5 : 1
                    }}
                  >
                    Import backup
                  </button>
                ) : (
                  <ImportService 
                    userProfile={userProfile}
                    onComplete={handleImportComplete}
                    onReportGenerated={handleImportReportGenerated}
                  />
                )}
              </div>
              
              {backupMessage && (
                <p className="text-sm mt-3" style={{ color: backupMessage.includes('failed') ? '#E8EAF0' : '#C9A227' }}>
                  {backupMessage}
                </p>
              )}
              
              {importReport && (() => {
                const report = importReport ?? {};
                const created = report.created ?? {};
                const skipped = report.skipped ?? {};
                const warnings = Array.isArray(report.warnings) ? report.warnings : [];
                const errors = Array.isArray(report.errors) ? report.errors : [];
                
                return (
                  <div className="mt-4 p-4" style={{ backgroundColor: '#0F1115', borderRadius: '12px' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: '#C9A227' }}>
                        Import Report
                      </h3>
                      <button
                        onClick={downloadImportReport}
                        className="flex items-center gap-1 text-xs"
                        style={{ color: '#9AA3B2' }}
                      >
                        <Download size={14} />
                        Download JSON
                      </button>
                    </div>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="mb-2" style={{ color: '#E8EAF0', fontWeight: 600 }}>Created</p>
                        <div className="space-y-1" style={{ color: '#9AA3B2' }}>
                          <p>Habits: {created.habits ?? 0}</p>
                          <p>Habit logs: {created.habitLogs ?? 0}</p>
                          <p>Journal entries: {created.journalEntries ?? 0}</p>
                          <p>Decisions: {created.decisions ?? 0}</p>
                        </div>
                      </div>
                      
                      {((skipped.habits ?? 0) + (skipped.habitLogs ?? 0) + (skipped.journalEntries ?? 0) + (skipped.decisions ?? 0)) > 0 && (
                        <div>
                          <p className="mb-2" style={{ color: '#E8EAF0', fontWeight: 600 }}>Skipped (duplicates)</p>
                          <div className="space-y-1" style={{ color: '#9AA3B2' }}>
                            {(skipped.habits ?? 0) > 0 && <p>Habits: {skipped.habits}</p>}
                            {(skipped.habitLogs ?? 0) > 0 && <p>Habit logs: {skipped.habitLogs}</p>}
                            {(skipped.journalEntries ?? 0) > 0 && <p>Journal entries: {skipped.journalEntries}</p>}
                            {(skipped.decisions ?? 0) > 0 && <p>Decisions: {skipped.decisions}</p>}
                          </div>
                        </div>
                      )}
                      
                      {warnings.length > 0 && (
                        <div className="p-2" style={{ backgroundColor: '#1A1D24', borderRadius: '8px' }}>
                          <p className="mb-1" style={{ color: '#C9A227', fontWeight: 600 }}>Warnings</p>
                          {warnings.map((warning, i) => (
                            <p key={i} style={{ color: '#9AA3B2' }}>• {warning}</p>
                          ))}
                        </div>
                      )}
                      
                      {errors.length > 0 && (
                        <div className="p-2" style={{ backgroundColor: '#1A1D24', borderRadius: '8px', border: '1px solid #ff6b6b' }}>
                          <p className="mb-1" style={{ color: '#ff6b6b', fontWeight: 600 }}>Errors</p>
                          {errors.map((error, i) => (
                            <p key={i} style={{ color: '#9AA3B2' }}>• {String(error)}</p>
                          ))}
                        </div>
                      )}
                      
                      <div className="pt-2" style={{ borderTop: '1px solid #1A1D24' }}>
                        <p style={{ color: '#9AA3B2', fontSize: '10px' }}>
                          Imported: {report.importedAt ? new Date(report.importedAt).toLocaleString() : 'Unknown'}
                        </p>
                        <p style={{ color: '#9AA3B2', fontSize: '10px', opacity: 0.7 }}>
                          Hash: {report.backupHash?.substring(0, 12) ?? 'unknown'}...
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Card 3: Delete my data */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Delete my data
              </h2>
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="w-full py-3 mb-3 font-semibold"
                style={{
                  backgroundColor: '#C9A227',
                  color: '#0F1115',
                  borderRadius: '18px',
                  opacity: deleting ? 0.5 : 1
                }}
              >
                Request Deletion
              </button>
              {deleteMessage && (
                <p className="text-sm" style={{ color: '#9AA3B2' }}>
                  {deleteMessage}
                </p>
              )}
            </div>

            {/* Card 4: Information */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Information
              </h2>
              <div className="space-y-2">
                <Link
                  to={createPageUrl('About')}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid rgba(202, 162, 39, 0.1)' }}
                >
                  <span style={{ color: '#E8EAF0' }}>About Seanna</span>
                  <ChevronRight size={18} style={{ color: '#9AA3B2' }} />
                </Link>
                <Link
                  to={createPageUrl('Privacy')}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid rgba(202, 162, 39, 0.1)' }}
                >
                  <span style={{ color: '#E8EAF0' }}>Privacy</span>
                  <ChevronRight size={18} style={{ color: '#9AA3B2' }} />
                </Link>
                <Link
                  to={createPageUrl('Disclaimer')}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid rgba(202, 162, 39, 0.1)' }}
                >
                  <span style={{ color: '#E8EAF0' }}>Disclaimer</span>
                  <ChevronRight size={18} style={{ color: '#9AA3B2' }} />
                </Link>
                
                {/* Hidden diagnostics - tap 5 times to reveal */}
                <button
                  onClick={() => {
                    const taps = parseInt(sessionStorage.getItem('diag_taps') || '0') + 1;
                    sessionStorage.setItem('diag_taps', taps.toString());
                    if (taps >= 5) {
                      setShowDiagnostics(true);
                      sessionStorage.removeItem('diag_taps');
                    }
                  }}
                  className="flex items-center justify-between py-3 w-full text-left"
                >
                  <span style={{ color: '#E8EAF0' }}>App Information</span>
                  <ChevronRight size={18} style={{ color: '#9AA3B2' }} />
                </button>
              </div>
            </div>
            
            {/* Developer Diagnostics Panel */}
            {showDiagnostics && diagnosticsData && (
              <div
                className="p-4"
                style={{
                  backgroundColor: '#1A1D24',
                  borderRadius: '18px',
                  border: '1px solid #2A2F3A'
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold" style={{ color: '#C9A227' }}>
                    Diagnostics
                  </h2>
                  <button
                    onClick={() => setShowDiagnostics(false)}
                    className="text-xs"
                    style={{ color: '#9AA3B2' }}
                  >
                    Hide
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                      App version
                    </p>
                    <p className="text-sm" style={{ color: '#E8EAF0' }}>
                      {diagnosticsData.appVersion}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                      Last sync
                    </p>
                    <p className="text-sm" style={{ color: '#E8EAF0' }}>
                      {diagnosticsData.lastSync === 'Never' 
                        ? diagnosticsData.lastSync 
                        : new Date(diagnosticsData.lastSync).toLocaleString()}
                    </p>
                  </div>
                  
                  {diagnosticsData.lastError && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                        Last error
                      </p>
                      <div
                        className="p-2 text-xs"
                        style={{
                          backgroundColor: '#0F1115',
                          borderRadius: '8px',
                          color: '#E8EAF0',
                          fontFamily: 'monospace',
                          maxHeight: '120px',
                          overflow: 'auto'
                        }}
                      >
                        <p className="mb-1">{new Date(diagnosticsData.lastError.timestamp).toLocaleString()}</p>
                        <p>{diagnosticsData.lastError.error}</p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      localStorage.removeItem('seanna_last_error');
                      localStorage.removeItem('seanna_last_sync');
                      setDiagnosticsData({
                        ...diagnosticsData,
                        lastError: null,
                        lastSync: 'Never'
                      });
                    }}
                    className="w-full py-2 text-xs"
                    style={{
                      backgroundColor: '#0F1115',
                      color: '#9AA3B2',
                      borderRadius: '12px'
                    }}
                  >
                    Clear logs
                  </button>
                </div>
              </div>
            )}

            {/* Isolation Check Panel */}
            {showIsolationCheck && isolationData && (
              <div
                className="p-4"
                style={{
                  backgroundColor: '#1A1D24',
                  borderRadius: '18px',
                  border: isolationData.totalMismatches > 0 ? '2px solid #ff6b6b' : '1px solid #2A2F3A'
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold" style={{ color: '#C9A227' }}>
                    Isolation Check
                  </h2>
                  <button
                    onClick={() => setShowIsolationCheck(false)}
                    className="text-xs"
                    style={{ color: '#9AA3B2' }}
                  >
                    Hide
                  </button>
                </div>
                
                {isolationData.error ? (
                  <p className="text-sm" style={{ color: '#ff6b6b' }}>
                    Error: {isolationData.error}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                        User ID
                      </p>
                      <p className="text-xs font-mono" style={{ color: '#E8EAF0' }}>
                        {isolationData.userId}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
                        Total records
                      </p>
                      <p className="text-sm" style={{ color: '#E8EAF0' }}>
                        {isolationData.totalRecords}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs mb-1" style={{ color: isolationData.totalMismatches > 0 ? '#ff6b6b' : '#9AA3B2' }}>
                        Owner mismatches
                      </p>
                      <p className="text-sm font-bold" style={{ color: isolationData.totalMismatches > 0 ? '#ff6b6b' : '#C9A227' }}>
                        {isolationData.totalMismatches} {isolationData.totalMismatches === 0 ? '✓' : '⚠'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs mb-2" style={{ color: '#9AA3B2' }}>
                        Details
                      </p>
                      <div
                        className="p-2 text-xs"
                        style={{
                          backgroundColor: '#0F1115',
                          borderRadius: '8px',
                          color: '#E8EAF0',
                          fontFamily: 'monospace',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}
                      >
                        {Object.entries(isolationData.details).map(([key, data]) => (
                          <div key={key} className="mb-1">
                            {data.model}: {data.total} records, {data.mismatches} mismatches
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs" style={{ color: '#9AA3B2', opacity: 0.7 }}>
                      Checked: {new Date(isolationData.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Card 5: Developer */}
            <div
              className="p-5"
              style={{
                backgroundColor: '#1A1D24',
                borderRadius: '18px'
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#E8EAF0' }}>
                Developer
              </h2>
              <div className="space-y-2">
                <button
                  onClick={handleIsolationCheck}
                  disabled={runningIsolationCheck}
                  className="w-full py-3 font-semibold"
                  style={{
                    backgroundColor: '#1A1D24',
                    color: '#C9A227',
                    borderRadius: '18px',
                    opacity: runningIsolationCheck ? 0.5 : 1
                  }}
                >
                  {runningIsolationCheck ? 'Running...' : 'Run isolation check'}
                </button>
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full py-3 font-semibold"
                  style={{
                    backgroundColor: '#C9A227',
                    color: '#0F1115',
                    borderRadius: '18px'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Diagnostic Info */}
            <div className="mt-8 pt-4 space-y-1 text-center">
              <p className="text-xs" style={{ color: '#9AA3B2', opacity: 0.6 }}>
                Build: {BUILD_TIMESTAMP}
              </p>
              <p className="text-xs" style={{ color: '#9AA3B2', opacity: 0.6 }}>
                Workspace: {currentUser?.email || userProfile?.displayName || 'Unknown'}
              </p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent style={{ backgroundColor: '#1A1D24', borderColor: '#1A1D24' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#E8EAF0' }}>Delete your data?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#9AA3B2' }}>
              This will permanently delete your data. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleting}
              style={{ 
                backgroundColor: '#0F1115', 
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              disabled={deleting}
              style={{ 
                backgroundColor: '#C9A227', 
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              {deleting ? 'Processing...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSafetyGateModal} onOpenChange={setShowSafetyGateModal}>
        <AlertDialogContent style={{ backgroundColor: '#1A1D24', borderColor: '#1A1D24' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#C9A227' }}>Backup already imported</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#9AA3B2' }}>
              This exact backup was imported on {existingReceipt ? new Date(existingReceipt.importedAt).toLocaleString() : 'previously'}.
              <br /><br />
              Importing again may create duplicates. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSafetyGateCancel}
              style={{ 
                backgroundColor: '#C9A227', 
                color: '#0F1115',
                borderRadius: '18px',
                fontWeight: 600
              }}
            >
              Cancel
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleSafetyGateConfirm}
              style={{ 
                backgroundColor: '#1A1D24', 
                color: '#9AA3B2',
                borderRadius: '18px',
                border: '1px solid #2A2F3A'
              }}
            >
              Import anyway
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}