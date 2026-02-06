import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [habitStreaks, setHabitStreaks] = useState({});
  const [loading, setLoading] = useState(true);

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

          // Calculate streaks for each habit
          const streaks = {};
          for (const habit of activeHabits) {
            const logs = await base44.entities.HabitLog.filter(
              { habitId: habit.id, userId },
              '-date'
            );
            streaks[habit.id] = calculateStreak(logs);
          }
          setHabitStreaks(streaks);
        }
      } catch (error) {
        console.error('Error loading habits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const calculateStreak = (logs) => {
    if (logs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Check if the most recent log is today or yesterday with status "done"
    const mostRecentLog = sortedLogs[0];
    const mostRecentDate = new Date(mostRecentLog.date);
    mostRecentDate.setHours(0, 0, 0, 0);

    if (mostRecentDate < yesterday) {
      return 0; // Streak broken if last log is before yesterday
    }

    if (mostRecentLog.status !== 'done') {
      return 0; // Streak broken if most recent is not "done"
    }

    // Count consecutive "done" days backwards from most recent
    let streak = 0;
    let currentDate = new Date(mostRecentDate);

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime() && log.status === 'done') {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (logDate.getTime() < currentDate.getTime()) {
        // Gap in dates or non-done status, streak ends
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

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#9AA3B2' }}>No active habits yet. Tap New to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <Link
                key={habit.id}
                to={`${createPageUrl('HabitDetail')}?id=${habit.id}`}
                className="block"
              >
                <div
                  className="p-4 transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: '#1A1D24',
                    borderRadius: '18px'
                  }}
                >
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
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}