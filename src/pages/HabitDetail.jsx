import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import StreakStrip from '../components/StreakStrip';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getUserToday, getUserDate, calculateCurrentStreak, calculateBestStreak } from '../components/dateUtils';
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

export default function HabitDetail() {
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [userId, setUserId] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [isFirstHabit, setIsFirstHabit] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [today, setToday] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
          navigate(createPageUrl('Habits'));
          return;
        }

        const currentUser = await base44.auth.me();
        const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const profile = userProfiles[0];
        const uid = profile?.id;
        setUserId(uid);
        setUserProfile(profile);

        const todayDate = getUserToday(profile);
        setToday(todayDate);

        const habits = await base44.entities.Habit.filter({ id });
        if (habits.length === 0) {
          navigate(createPageUrl('Habits'));
          return;
        }
        setHabit(habits[0]);

        if (uid) {
          // Check if this is the user's first habit
          const allHabits = await base44.entities.Habit.filter({ userId: uid, isActive: true });
          setIsFirstHabit(allHabits.length === 1);

          // Load today's log
          const todayLogs = await base44.entities.HabitLog.filter({ habitId: id, userId: uid, date: todayDate });
          if (todayLogs.length > 0) {
            setTodayLog(todayLogs[0]);
          }

          // Load last 14 days of logs
          const fourteenDaysAgo = getUserDate(profile, -13);
          const allLogs = await base44.entities.HabitLog.filter({ habitId: id, userId: uid }, '-date');
          const filteredLogs = allLogs.filter(log => log.date >= fourteenDaysAgo && log.date <= todayDate);
          setRecentLogs(filteredLogs);
          
          // Calculate streaks
          const current = calculateCurrentStreak(allLogs, todayDate);
          const best = calculateBestStreak(allLogs);
          setCurrentStreak(current);
          setBestStreak(best);
        }
      } catch (error) {
        console.error('Error loading habit:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  const handleStatusClick = async (status) => {
    if (!userId || !habit) return;

    try {
      if (todayLog) {
        // Update existing log
        const updated = await base44.entities.HabitLog.update(todayLog.id, { status });
        setTodayLog(updated);
        
        // Update recent logs
        setRecentLogs(prev => prev.map(log => log.id === updated.id ? updated : log));
        
        // Recalculate streaks
        const allLogs = await base44.entities.HabitLog.filter({ habitId: habit.id, userId }, '-date');
        const todayDate = getUserToday(userProfile);
        const current = calculateCurrentStreak(allLogs, todayDate);
        const best = calculateBestStreak(allLogs);
        setCurrentStreak(current);
        setBestStreak(best);
      } else {
        // Check if this is the first habit log ever
        const isFirstLogEver = recentLogs.length === 0;
        
        // Create new log
        const newLog = await base44.entities.HabitLog.create({
          habitId: habit.id,
          userId,
          date: today,
          status
        });
        setTodayLog(newLog);
        
        // Add to recent logs
        setRecentLogs(prev => [newLog, ...prev]);
        
        // Recalculate streaks
        const allLogs = await base44.entities.HabitLog.filter({ habitId: habit.id, userId }, '-date');
        const todayDate = getUserToday(userProfile);
        const current = calculateCurrentStreak(allLogs, todayDate);
        const best = calculateBestStreak(allLogs);
        setCurrentStreak(current);
        setBestStreak(best);
        
        // Show success toast and navigate for first-time users
        if (isFirstLogEver) {
          toast.success('First step completed.');
          setTimeout(() => {
            navigate(`${createPageUrl('Home')}?justCompleted=true`);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error updating habit log:', error);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await base44.entities.Habit.update(habit.id, { isActive: false });
      navigate(createPageUrl('Habits'));
    } catch (error) {
      console.error('Error archiving habit:', error);
      setArchiving(false);
    }
  };



  const getScheduleLabel = (type) => {
    const labels = { daily: 'Daily', weekly: 'Weekly', custom: 'Custom' };
    return labels[type] || type;
  };

  const getStatusStyle = (status, isActive) => {
    const baseStyle = {
      flex: 1,
      padding: '12px',
      borderRadius: '18px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    };

    if (isActive) {
      return {
        ...baseStyle,
        backgroundColor: '#C9A227',
        color: '#0F1115',
        border: '2px solid #C9A227',
        boxShadow: '0 2px 8px rgba(201, 162, 39, 0.3)'
      };
    }

    return {
      ...baseStyle,
      backgroundColor: '#0F1115',
      color: '#E8EAF0',
      border: '2px solid #2A2F3A'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-20" style={{ backgroundColor: '#0F1115' }}>
        <p style={{ color: '#9AA3B2' }}>Loading...</p>
        <BottomNav />
      </div>
    );
  }

  if (!habit) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2"
          style={{ color: '#9AA3B2' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="mb-4">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
            {habit.name}
          </h1>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-1 text-xs"
              style={{
                backgroundColor: '#1A1D24',
                color: '#C9A227',
                borderRadius: '12px'
              }}
            >
              {getScheduleLabel(habit.scheduleType)}
            </span>
          </div>
          {habit.description && (
            <p className="text-sm" style={{ color: '#9AA3B2' }}>
              {habit.description}
            </p>
          )}
        </div>

        {/* Today's status */}
        <div
          className="p-4 mb-4"
          style={{
            backgroundColor: '#1A1D24',
            borderRadius: '18px',
            border: !todayLog && isFirstHabit ? '2px solid rgba(201, 162, 39, 0.2)' : 'none'
          }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Today's status
          </h2>
          <p className="text-sm mb-4" style={{ color: '#9AA3B2' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          
          {!todayLog && isFirstHabit && (
            <p className="text-sm mb-3" style={{ color: '#9AA3B2', fontStyle: 'italic' }}>
              Mark today's result to activate your system.
            </p>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusClick('done')}
              style={getStatusStyle('done', todayLog?.status === 'done')}
              onMouseEnter={(e) => {
                if (todayLog?.status === 'done') {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                } else {
                  e.currentTarget.style.backgroundColor = '#1A1D24';
                }
              }}
              onMouseLeave={(e) => {
                if (todayLog?.status === 'done') {
                  e.currentTarget.style.filter = 'brightness(1)';
                } else {
                  e.currentTarget.style.backgroundColor = '#0F1115';
                }
              }}
            >
              Done
            </button>
            <button
              onClick={() => handleStatusClick('skipped')}
              style={getStatusStyle('skipped', todayLog?.status === 'skipped')}
              onMouseEnter={(e) => {
                if (todayLog?.status === 'skipped') {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                } else {
                  e.currentTarget.style.backgroundColor = '#1A1D24';
                }
              }}
              onMouseLeave={(e) => {
                if (todayLog?.status === 'skipped') {
                  e.currentTarget.style.filter = 'brightness(1)';
                } else {
                  e.currentTarget.style.backgroundColor = '#0F1115';
                }
              }}
            >
              Skipped
            </button>
            <button
              onClick={() => handleStatusClick('missed')}
              style={getStatusStyle('missed', todayLog?.status === 'missed')}
              onMouseEnter={(e) => {
                if (todayLog?.status === 'missed') {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                } else {
                  e.currentTarget.style.backgroundColor = '#1A1D24';
                }
              }}
              onMouseLeave={(e) => {
                if (todayLog?.status === 'missed') {
                  e.currentTarget.style.filter = 'brightness(1)';
                } else {
                  e.currentTarget.style.backgroundColor = '#0F1115';
                }
              }}
            >
              Missed
            </button>
          </div>
        </div>

        {/* Streak stats */}
        {recentLogs.length > 0 && (
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#1A1D24',
              borderRadius: '18px'
            }}
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm" style={{ color: '#9AA3B2' }}>
                Current streak:
              </span>
              <span className="text-lg font-semibold" style={{ color: '#E8EAF0' }}>
                {currentStreak} day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-sm" style={{ color: '#9AA3B2' }}>
                Best streak:
              </span>
              <span className="text-lg font-semibold" style={{ color: '#E8EAF0' }}>
                {bestStreak} day{bestStreak !== 1 ? 's' : ''}
              </span>
            </div>
            {currentStreak > 0 && currentStreak === bestStreak && (
              <p className="text-xs mb-3" style={{ color: '#C9A227' }}>
                New personal record
              </p>
            )}
            <StreakStrip logs={recentLogs} userTimezone={userProfile?.timezone || 'UTC'} />
          </div>
        )}

        {/* Recent history */}
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#E8EAF0' }}>
            Recent history
          </h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm" style={{ color: '#9AA3B2' }}>
              No history yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center p-3"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
                  <span className="text-sm" style={{ color: '#E8EAF0' }}>
                    {format(new Date(log.date), 'MMM d, yyyy')}
                  </span>
                  <span
                    className="px-3 py-1 text-xs font-semibold capitalize"
                    style={{
                      backgroundColor: log.status === 'done' ? '#C9A227' : '#0F1115',
                      color: log.status === 'done' ? '#0F1115' : '#9AA3B2',
                      borderRadius: '12px'
                    }}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Archive habit */}
        <div className="mt-6">
          <button
            onClick={() => setShowArchiveDialog(true)}
            className="w-full py-3 font-semibold"
            style={{
              backgroundColor: '#1A1D24',
              color: '#E8EAF0',
              borderRadius: '18px'
            }}
          >
            Archive habit
          </button>
          <p className="text-xs mt-2 text-center" style={{ color: '#9AA3B2' }}>
            Archived habits are hidden but not deleted.
          </p>
        </div>
      </div>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent style={{ backgroundColor: '#1A1D24', borderColor: '#1A1D24' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#E8EAF0' }}>Archive this habit?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#9AA3B2' }}>
              This will remove it from your active habits list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={archiving}
              style={{ 
                backgroundColor: '#0F1115', 
                color: '#E8EAF0',
                borderRadius: '18px'
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={archiving}
              style={{ 
                backgroundColor: '#C9A227', 
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              {archiving ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BottomNav />
    </div>
  );
}