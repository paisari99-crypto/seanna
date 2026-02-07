import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { BookOpen, Target, GitBranch, TrendingUp, Settings } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import GuidanceCard from '../components/GuidanceCard';
import TodaySummary from '../components/TodaySummary';
import WeeklySummary from '../components/WeeklySummary';
import { getUserToday, getStartOfWeek } from '../components/dateUtils';
import { format } from 'date-fns';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [habitCount, setHabitCount] = useState(0);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [totalActiveHabits, setTotalActiveHabits] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [lastWeekCount, setLastWeekCount] = useState(0);
  
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
        const activeTodayLogs = todayLogs.filter(log => activeHabitIds.includes(log.habitId));
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
        const activeThisWeekLogs = thisWeekLogs.filter(log => activeHabitIds.includes(log.habitId));
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
      } catch (error) {
        console.error('Error checking onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#0F1115' }}>
        <p style={{ color: '#9AA3B2' }}>Loading...</p>
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

      <div className="px-4 pb-8">
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

        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                to={createPageUrl(card.page)}
                className="block transition-transform hover:scale-105"
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