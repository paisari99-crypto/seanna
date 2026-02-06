import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Plus, AlertCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import DuplicateHabitsDialog from '../components/DuplicateHabitsDialog';
import { getUserToday } from '../utils/dateUtils';
import { format } from 'date-fns';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [habitStreaks, setHabitStreaks] = useState({});
  const [habitCompletedToday, setHabitCompletedToday] = useState({});
  const [loading, setLoading] = useState(true);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfile = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const userId = userProfile[0]?.id;
        
        if (userId) {
          const activeHabits = await base44.entities.Habit.filter(
            { userId, isActive: true },
            '-created_date'
          );
          setHabits(activeHabits);

          // Calculate streaks and check today's completion for each habit
          const streaks = {};
          const completedToday = {};
          const today = await getUserToday();
          
          for (const habit of activeHabits) {
            const logs = await base44.entities.HabitLog.filter(
              { habitId: habit.id, userId },
              '-date'
            );
            streaks[habit.id] = calculateStreak(logs, today);
            
            // Check if habit is done today
            const todayLog = logs.find(log => log.date === today);
            completedToday[habit.id] = todayLog?.status === 'done';
          }
          setHabitStreaks(streaks);
          setHabitCompletedToday(completedToday);
          
          // Detect duplicate habits
          const duplicates = findDuplicateHabits(activeHabits);
          setDuplicateGroups(duplicates);
        }
      } catch (error) {
        console.error('Error loading habits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const findDuplicateHabits = (habits) => {
    const groups = [];
    const processed = new Set();
    
    for (let i = 0; i < habits.length; i++) {
      if (processed.has(i)) continue;
      
      const group = [habits[i]];
      processed.add(i);
      
      for (let j = i + 1; j < habits.length; j++) {
        if (processed.has(j)) continue;
        
        if (areSimilar(habits[i].name, habits[j].name)) {
          group.push(habits[j]);
          processed.add(j);
        }
      }
      
      if (group.length > 1) {
        groups.push(group);
      }
    }
    
    return groups;
  };

  const areSimilar = (name1, name2) => {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();
    
    // Exact match
    if (n1 === n2) return true;
    
    // Calculate similarity
    const longer = n1.length > n2.length ? n1 : n2;
    const shorter = n1.length > n2.length ? n2 : n1;
    
    if (longer.length === 0) return true;
    
    const editDistance = levenshteinDistance(n1, n2);
    const similarity = (longer.length - editDistance) / longer.length;
    
    return similarity > 0.8;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const calculateStreak = (logs, todayStr) => {
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const mostRecentLog = sortedLogs[0];

    // Check if most recent log is today or yesterday
    const todayDate = new Date(todayStr);
    const yesterdayDate = new Date(todayStr);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = format(yesterdayDate, 'yyyy-MM-dd');

    if (mostRecentLog.date !== todayStr && mostRecentLog.date !== yesterdayStr) return 0;
    if (mostRecentLog.status !== 'done') return 0;

    let streak = 0;
    let expectedDate = mostRecentLog.date;

    for (const log of sortedLogs) {
      if (log.date === expectedDate && log.status === 'done') {
        streak++;
        const nextDate = new Date(expectedDate);
        nextDate.setDate(nextDate.getDate() - 1);
        expectedDate = format(nextDate, 'yyyy-MM-dd');
      } else if (log.date < expectedDate) {
        break;
      }
    }

    return streak;
  };

  const getScheduleLabel = (type) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      custom: 'Custom'
    };
    return labels[type] || type;
  };

  const truncateDescription = (desc) => {
    if (!desc) return '';
    return desc.length > 60 ? desc.substring(0, 60) + '...' : desc;
  };

  const renderHabitCard = (habit) => {
    const isCompleted = habitCompletedToday[habit.id];
    return (
      <Link
        key={habit.id}
        to={`${createPageUrl('HabitDetail')}?id=${habit.id}`}
        className="block"
      >
        <div
          className="p-4 transition-transform hover:scale-[1.02] relative"
          style={{
            backgroundColor: '#1A1D24',
            borderRadius: '18px',
            border: isCompleted ? 'none' : '1px solid rgba(201, 162, 39, 0.3)',
            opacity: isCompleted ? 0.7 : 1
          }}
        >
          {!isCompleted && (
            <div
              className="absolute top-3 right-3 w-2 h-2 rounded-full"
              style={{ backgroundColor: '#C9A227' }}
            />
          )}
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold flex-1" style={{ color: '#E8EAF0' }}>
              {habit.name}
            </h3>
            <span
              className="px-2 py-1 text-xs ml-2"
              style={{
                backgroundColor: '#0F1115',
                color: '#C9A227',
                borderRadius: '12px'
              }}
            >
              {getScheduleLabel(habit.scheduleType)}
            </span>
          </div>
          <p className="text-xs mb-1" style={{ color: '#9AA3B2' }}>
            {habitStreaks[habit.id] > 0 
              ? `Streak: ${habitStreaks[habit.id]} day${habitStreaks[habit.id] !== 1 ? 's' : ''}`
              : 'No active streak'}
          </p>
          {habit.description && (
            <p className="text-sm" style={{ color: '#9AA3B2' }}>
              {truncateDescription(habit.description)}
            </p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
              Habits
            </h1>
            <p className="text-sm mb-2" style={{ color: '#9AA3B2' }}>
              Small systems. Real change.
            </p>
            <Link
              to={createPageUrl('ArchivedHabits')}
              className="text-xs"
              style={{ color: '#9AA3B2' }}
            >
              View archived habits
            </Link>
          </div>
          <Link
            to={createPageUrl('HabitNew')}
            className="px-4 py-2 flex items-center gap-2"
            style={{
              backgroundColor: '#C9A227',
              color: '#0F1115',
              borderRadius: '18px',
              fontWeight: 600
            }}
          >
            <Plus size={18} />
            New
          </Link>
        </div>

        {!loading && duplicateGroups.length > 0 && (
          <div
            className="mb-4 p-3 flex items-start gap-3"
            style={{
              backgroundColor: 'rgba(26, 29, 36, 0.6)',
              borderRadius: '18px',
              border: '1px solid rgba(154, 163, 178, 0.1)'
            }}
          >
            <AlertCircle size={16} style={{ color: '#9AA3B2', marginTop: '2px', flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-xs mb-2" style={{ color: '#9AA3B2' }}>
                You have similar habits. Consider merging or renaming.
              </p>
              <button
                onClick={() => setShowDuplicatesDialog(true)}
                className="text-xs px-3 py-1"
                style={{
                  color: '#C9A227',
                  backgroundColor: 'rgba(201, 162, 39, 0.1)',
                  borderRadius: '12px',
                  fontWeight: 500
                }}
              >
                Review habits
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#9AA3B2' }}>No active habits yet. Tap New to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              // Sort habits: incomplete first, then by streak descending
              const incomplete = habits.filter(h => !habitCompletedToday[h.id])
                .sort((a, b) => (habitStreaks[b.id] || 0) - (habitStreaks[a.id] || 0));
              const completed = habits.filter(h => habitCompletedToday[h.id])
                .sort((a, b) => (habitStreaks[b.id] || 0) - (habitStreaks[a.id] || 0));
              
              return (
                <>
                  {incomplete.length > 0 && (
                    <>
                      <h4 className="text-xs font-semibold mb-2 mt-2" style={{ color: '#9AA3B2', opacity: 0.7 }}>
                        Needs attention
                      </h4>
                      {incomplete.map((habit) => renderHabitCard(habit))}
                    </>
                  )}
                  {completed.length > 0 && (
                    <>
                      <h4 className="text-xs font-semibold mb-2 mt-4" style={{ color: '#9AA3B2', opacity: 0.7 }}>
                        Completed today
                      </h4>
                      {completed.map((habit) => renderHabitCard(habit))}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
      
      <DuplicateHabitsDialog
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
        duplicates={duplicateGroups}
      />
      
      <BottomNav />
    </div>
  );
}