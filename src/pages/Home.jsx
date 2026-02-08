import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { BookOpen, Target, GitBranch, TrendingUp, Settings, FileText, ChevronRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import GuidanceCard from '../components/GuidanceCard';
import TodaySummary from '../components/TodaySummary';
import WeeklySummary from '../components/WeeklySummary';
import { getUserToday, getStartOfWeek } from '../components/dateUtils';
import { format } from 'date-fns';
import { SkeletonCard, SkeletonStat } from '../components/SkeletonLoader';
import { runIntegrityCheck } from '../components/integrityUtils';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [habitCount, setHabitCount] = useState(0);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [totalActiveHabits, setTotalActiveHabits] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [lastWeekCount, setLastWeekCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [showBackupBanner, setShowBackupBanner] = useState(false);
  const [backupExporting, setBackupExporting] = useState(false);
  const [todayReviewExists, setTodayReviewExists] = useState(false);
  
  // Check if just completed a habit
  const urlParams = new URLSearchParams(window.location.search);
  const justCompleted = urlParams.get('justCompleted') === 'true';

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });

        if (userProfiles.length === 0 || !userProfiles[0].displayName) {
          navigate(createPageUrl('Onboarding'));
          return;
        }

        const profile = userProfiles[0];
        const userId = profile.id;
        setUserProfile(profile);
        
        // Check if backup banner should be shown
        const dismissedUntil = localStorage.getItem('backup_banner_dismissed_until');
        const now = new Date();
        
        if (dismissedUntil && new Date(dismissedUntil) > now) {
          setShowBackupBanner(false);
        } else if (!profile.lastBackupAt) {
          setShowBackupBanner(true);
        } else {
          const lastBackup = new Date(profile.lastBackupAt);
          const daysSinceBackup = (now - lastBackup) / (1000 * 60 * 60 * 24);
          setShowBackupBanner(daysSinceBackup >= 7);
        }
        
        // Check if user has any habits
        const habits = await base44.entities.Habit.filter({ userId });
        setHabitCount(habits.length);

        // Get active habits for today summary
        const activeHabits = await base44.entities.Habit.filter({ userId, isActive: true });
        const activeHabitIds = activeHabits.map(h => h.id);
        setTotalActiveHabits(activeHabits.length);

        // Check if user has logged any habit today (only active habits)
        const today = getUserToday(profile);
        const todayLogs = await base44.entities.HabitLog.filter({ userId, date: today });
        // Defensive: filter logs that reference existing habits only
        const activeTodayLogs = todayLogs.filter(log => {
          const habitExists = activeHabitIds.includes(log.habitId);
          if (!habitExists) {
            console.warn(`Log references missing habit: ${log.habitId}`);
          }
          return habitExists;
        });
        setHasLoggedToday(activeTodayLogs.length > 0);

        // Count completed habits today (only active habits)
        const completedCount = activeTodayLogs.filter(log => log.status === 'done').length;
        setCompletedToday(completedCount);

        // Calculate this week's completed habits (only active habits)
        // Week starts Monday 00:00, ends Sunday 23:59:59 in user's timezone
        const startOfWeekStr = getStartOfWeek(profile);
        const nextMondayDate = new Date(startOfWeekStr);
        nextMondayDate.setDate(nextMondayDate.getDate() + 7);
        const nextMondayStr = format(nextMondayDate, 'yyyy-MM-dd');

        const thisWeekLogs = await base44.entities.HabitLog.filter({ userId });
        // Defensive: filter logs that reference existing habits only
        const activeThisWeekLogs = thisWeekLogs.filter(log => {
          const habitExists = activeHabitIds.includes(log.habitId);
          if (!habitExists) {
            console.warn(`Log references missing habit: ${log.habitId}`);
          }
          return habitExists;
        });
        const thisWeekCompleted = activeThisWeekLogs.filter(log => 
          log.date >= startOfWeekStr && log.date < nextMondayStr && log.status === 'done'
        ).length;
        setThisWeekCount(thisWeekCompleted);

        // Calculate last week's completed habits (only active habits)
        const startOfLastWeekDate = new Date(startOfWeekStr);
        startOfLastWeekDate.setDate(startOfLastWeekDate.getDate() - 7);
        const startOfLastWeekStr = format(startOfLastWeekDate, 'yyyy-MM-dd');

        const lastWeekCompleted = activeThisWeekLogs.filter(log => 
          log.date >= startOfLastWeekStr && log.date < startOfWeekStr && log.status === 'done'
        ).length;
        setLastWeekCount(lastWeekCompleted);
        
        // Check if today's review exists
        const todayReviews = await base44.entities.DailyReview.filter({ userId, date: today });
        setTodayReviewExists(todayReviews.length > 0);
        
        // Run background integrity check (non-blocking)
        runIntegrityCheck(profile).then(report => {
          try {
            localStorage.setItem('seanna_integrity_report', JSON.stringify(report));
          } catch (e) {
            console.error('Failed to store integrity report:', e);
          }
        }).catch(error => {
          console.error('Integrity check failed silently:', error);
        });
      } catch (error) {
        console.error('Error checking onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [navigate]);
  
  const handleDismissBanner = () => {
    const dismissUntil = new Date();
    dismissUntil.setHours(dismissUntil.getHours() + 24);
    localStorage.setItem('backup_banner_dismissed_until', dismissUntil.toISOString());
    setShowBackupBanner(false);
  };
  
  const handleBackupFromBanner = async () => {
    setBackupExporting(true);
    try {
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
      
      let habits = await base44.entities.Habit.filter({ userId: userProfile.id });
      let logs = await base44.entities.HabitLog.filter({ userId: userProfile.id });
      let journalEntries = await base44.entities.JournalEntry.filter({ userId: userProfile.id });
      let decisions = await base44.entities.Decision.filter({ userId: userProfile.id });
      
      habits = await ensureExternalIds(habits, 'Habit');
      logs = await ensureExternalIds(logs, 'HabitLog');
      journalEntries = await ensureExternalIds(journalEntries, 'JournalEntry');
      decisions = await ensureExternalIds(decisions, 'Decision');
      
      const habitIdToExtId = new Map(habits.map(h => [h.id, h.externalId]));
      const validLogs = [];
      
      logs.forEach(log => {
        const habitExtId = habitIdToExtId.get(log.habitId);
        if (habitExtId) {
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
        decisions
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
      
      const now = new Date().toISOString();
      await base44.entities.UserProfile.update(userProfile.id, { lastBackupAt: now });
      setUserProfile({ ...userProfile, lastBackupAt: now });
      setShowBackupBanner(false);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setBackupExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-16" style={{ backgroundColor: '#0F1115' }}>
        <div style={{ paddingTop: '24px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '24px' }}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
                Seanna
              </h1>
              <p className="text-lg" style={{ color: '#9AA3B2' }}>
                Your cognitive toolkit
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-3">
          <SkeletonStat />
          <SkeletonStat />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  }
  
  const cards = [
    {
      id: 'journal',
      title: 'Journal',
      description: 'Capture thoughts and patterns',
      icon: BookOpen,
      page: 'Journal'
    },
    {
      id: 'habits',
      title: 'Habits',
      description: 'Build systems, not streaks',
      icon: Target,
      page: 'Habits'
    },
    {
      id: 'decisions',
      title: 'Decisions',
      description: 'Compare options with clarity',
      icon: GitBranch,
      page: 'Decisions'
    },
    {
      id: 'insights',
      title: 'Insights',
      description: 'See trends across your tools',
      icon: TrendingUp,
      page: 'Insights'
    }
  ];

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#0F1115' }}>
      <div style={{ paddingTop: '24px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '24px' }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
              Seanna
            </h1>
            <p className="text-lg" style={{ color: '#9AA3B2' }}>
              Your cognitive toolkit
            </p>
          </div>
          <button
            onClick={() => navigate(createPageUrl('Settings'))}
            className="p-2"
            style={{ color: '#9AA3B2' }}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-8 animate-fadeIn">
        {showBackupBanner && (
          <div 
            className="mb-3 p-4 flex items-start justify-between gap-3"
            style={{
              backgroundColor: '#1A1D24',
              borderRadius: '18px',
              border: '1px solid rgba(202, 162, 39, 0.2)'
            }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: '#C9A227' }}>
                Backup recommended
              </p>
              <p className="text-xs mb-3" style={{ color: '#9AA3B2' }}>
                Last backup: {userProfile?.lastBackupAt 
                  ? new Date(userProfile.lastBackupAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : 'Never'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBackupFromBanner}
                  disabled={backupExporting}
                  className="px-3 py-1.5 text-xs font-semibold"
                  style={{
                    backgroundColor: '#C9A227',
                    color: '#0F1115',
                    borderRadius: '12px',
                    opacity: backupExporting ? 0.5 : 1
                  }}
                >
                  {backupExporting ? 'Downloading...' : 'Download backup'}
                </button>
                <button
                  onClick={handleDismissBanner}
                  disabled={backupExporting}
                  className="px-3 py-1.5 text-xs"
                  style={{
                    color: '#9AA3B2',
                    opacity: backupExporting ? 0.5 : 1
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        <GuidanceCard 
          habitCount={habitCount} 
          hasLoggedToday={hasLoggedToday} 
          justCompleted={justCompleted}
          developerPreview={false} 
        />

        <TodaySummary 
          totalHabits={totalActiveHabits}
          completedToday={completedToday}
          tomorrowHabits={totalActiveHabits}
        />

        <WeeklySummary 
          thisWeekCount={thisWeekCount}
          lastWeekCount={lastWeekCount}
          totalHabits={totalActiveHabits}
        />
        
        <button
          onClick={() => navigate(createPageUrl('DailyReview'))}
          className="w-full p-4 flex items-center justify-between mb-3"
          style={{
            backgroundColor: '#1A1D24',
            borderRadius: '18px',
            border: '1px solid rgba(202, 162, 39, 0.2)'
          }}
        >
          <div className="flex items-center gap-3">
            <FileText size={24} style={{ color: '#C9A227' }} />
            <div className="text-left">
              <p className="font-semibold" style={{ color: '#E8EAF0' }}>
                {todayReviewExists ? "Edit today's review" : 'Daily review'}
              </p>
              <p className="text-xs" style={{ color: '#9AA3B2' }}>
                Reflect on your day
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={{ color: '#9AA3B2' }} />
        </button>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                to={createPageUrl(card.page)}
                className="block transition-all duration-150 hover:scale-105 animate-slideUp"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div
                  className="p-4 shadow-lg"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <Icon size={32} className="mb-3" style={{ color: '#C9A227' }} />
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#E8EAF0' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#9AA3B2' }}>
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}