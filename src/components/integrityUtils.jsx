import { base44 } from '@/api/base44Client';

export const runIntegrityCheck = async (userProfile) => {
  const report = {
    ok: true,
    warnings: [],
    errors: [],
    timestamp: new Date().toISOString()
  };

  try {
    if (!userProfile || !userProfile.id) {
      report.errors.push('No user profile found');
      report.ok = false;
      return report;
    }

    const userId = userProfile.id;

    // Check 1: Verify HabitLogs reference existing Habits
    try {
      const habits = await base44.entities.Habit.filter({ userId });
      const habitIds = new Set(habits.map(h => h.id));
      const logs = await base44.entities.HabitLog.filter({ userId });
      
      const orphanedLogs = logs.filter(log => !habitIds.has(log.habitId));
      if (orphanedLogs.length > 0) {
        report.warnings.push(`${orphanedLogs.length} habit log(s) reference missing habits`);
      }
    } catch (error) {
      report.errors.push(`Failed to check habit logs: ${error.message}`);
      report.ok = false;
    }

    // Check 2: Verify DailyReview dates are unique per user
    try {
      const reviews = await base44.entities.DailyReview.filter({ userId });
      const dateMap = new Map();
      const duplicates = [];
      
      reviews.forEach(review => {
        if (review.date) {
          if (dateMap.has(review.date)) {
            duplicates.push(review.date);
          }
          dateMap.set(review.date, (dateMap.get(review.date) || 0) + 1);
        }
      });
      
      if (duplicates.length > 0) {
        report.errors.push(`${duplicates.length} duplicate daily review date(s) found`);
        report.ok = false;
      }
    } catch (error) {
      report.errors.push(`Failed to check daily reviews: ${error.message}`);
      report.ok = false;
    }

    // Check 3: Verify no null externalIds on core entities
    try {
      const entityChecks = [
        { name: 'Habit', entity: 'Habit' },
        { name: 'HabitLog', entity: 'HabitLog' },
        { name: 'JournalEntry', entity: 'JournalEntry' },
        { name: 'Decision', entity: 'Decision' },
        { name: 'DailyReview', entity: 'DailyReview' }
      ];
      
      for (const check of entityChecks) {
        const records = await base44.entities[check.entity].filter({ userId });
        const missingExtIds = records.filter(r => !r.externalId);
        
        if (missingExtIds.length > 0) {
          report.warnings.push(`${missingExtIds.length} ${check.name} record(s) missing externalId`);
        }
      }
    } catch (error) {
      report.errors.push(`Failed to check externalIds: ${error.message}`);
      report.ok = false;
    }

    // Check 4: Verify backup timestamps are valid ISO
    if (userProfile.lastBackupAt) {
      try {
        const date = new Date(userProfile.lastBackupAt);
        if (isNaN(date.getTime())) {
          report.warnings.push('Invalid lastBackupAt timestamp');
        }
      } catch (error) {
        report.warnings.push('Failed to parse lastBackupAt timestamp');
      }
    }

  } catch (error) {
    report.errors.push(`Integrity check failed: ${error.message}`);
    report.ok = false;
  }

  return report;
};