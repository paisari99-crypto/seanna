import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ArchivedHabits() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        const userProfile = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        const userId = userProfile[0]?.id;
        
        if (userId) {
          const archivedHabits = await base44.entities.Habit.filter(
            { userId, isActive: false },
            '-created_date'
          );
          setHabits(archivedHabits);
        }
      } catch (error) {
        console.error('Error loading archived habits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

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
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2"
          style={{ color: '#9AA3B2' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Archived Habits
          </h1>
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            Your archived habits are here.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#9AA3B2' }}>Loading...</p>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#9AA3B2' }}>No archived habits yet.</p>
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