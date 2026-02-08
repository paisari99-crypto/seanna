import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, History } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getUserToday } from '../components/dateUtils';
import { createPageUrl } from '@/utils';

export default function DailyReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [todayDate, setTodayDate] = useState('');
  const [habitsSummary, setHabitsSummary] = useState({ completed: 0, total: 0 });
  
  const [workedWell, setWorkedWell] = useState('');
  const [difficult, setDifficult] = useState('');
  const [focusTomorrow, setFocusTomorrow] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        
        if (profiles.length === 0) return;
        
        const profile = profiles[0];
        setUserProfile(profile);
        
        const today = getUserToday(profile);
        setTodayDate(today);
        
        // Get today's habits summary
        const activeHabits = await base44.entities.Habit.filter({ userId: profile.id, isActive: true });
        const todayLogs = await base44.entities.HabitLog.filter({ userId: profile.id, date: today });
        const completed = todayLogs.filter(log => log.status === 'done').length;
        
        setHabitsSummary({ completed, total: activeHabits.length });
        
        // Check if review exists for today
        const reviews = await base44.entities.DailyReview.filter({ userId: profile.id, date: today });
        
        if (reviews.length > 0) {
          const review = reviews[0];
          setExistingReview(review);
          setWorkedWell(review.workedWell || '');
          setDifficult(review.difficult || '');
          setFocusTomorrow(review.focusTomorrow || '');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (!userProfile || !todayDate) return;
    
    setSaving(true);
    try {
      const reviewData = {
        userId: userProfile.id,
        date: todayDate,
        workedWell,
        difficult,
        focusTomorrow,
        summarySnapshot: {
          habitsCompleted: habitsSummary.completed,
          habitsTotal: habitsSummary.total,
          timestamp: new Date().toISOString()
        }
      };
      
      if (existingReview) {
        await base44.entities.DailyReview.update(existingReview.id, reviewData);
        toast.success('Review updated');
      } else {
        const newReview = await base44.entities.DailyReview.create(reviewData);
        setExistingReview(newReview);
        toast.success('Review saved');
      }
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen animate-fadeIn" style={{ backgroundColor: '#0F1115' }}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <p style={{ color: '#9AA3B2' }}>Loading review...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 animate-fadeIn" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2"
            style={{ color: '#9AA3B2' }}
          >
            <ArrowLeft size={24} />
          </button>
          
          <button
            onClick={() => navigate(createPageUrl('DailyReviewHistory'))}
            className="p-2"
            style={{ color: '#9AA3B2' }}
          >
            <History size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Daily Review
          </h1>
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            {new Date(todayDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div
          className="p-4 mb-6"
          style={{
            backgroundColor: '#1A1D24',
            borderRadius: '18px',
            border: '1px solid rgba(202, 162, 39, 0.2)'
          }}
        >
          <p className="text-sm" style={{ color: '#C9A227' }}>
            Completed {habitsSummary.completed} of {habitsSummary.total} habits today
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E8EAF0' }}>
              What worked today?
            </label>
            <Textarea
              value={workedWell}
              onChange={(e) => setWorkedWell(e.target.value)}
              placeholder="What went well? What are you proud of?"
              rows={4}
              style={{
                backgroundColor: '#1A1D24',
                color: '#E8EAF0',
                border: '1px solid #2A2F3A',
                borderRadius: '12px'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E8EAF0' }}>
              What was difficult?
            </label>
            <Textarea
              value={difficult}
              onChange={(e) => setDifficult(e.target.value)}
              placeholder="What challenged you? What didn't go as planned?"
              rows={4}
              style={{
                backgroundColor: '#1A1D24',
                color: '#E8EAF0',
                border: '1px solid #2A2F3A',
                borderRadius: '12px'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#E8EAF0' }}>
              One focus for tomorrow
            </label>
            <Textarea
              value={focusTomorrow}
              onChange={(e) => setFocusTomorrow(e.target.value)}
              placeholder="What's your main priority tomorrow?"
              rows={3}
              style={{
                backgroundColor: '#1A1D24',
                color: '#E8EAF0',
                border: '1px solid #2A2F3A',
                borderRadius: '12px'
              }}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full transition-all hover:opacity-90"
            style={{
              backgroundColor: '#C9A227',
              color: '#0F1115',
              borderRadius: '18px',
              fontWeight: 600,
              opacity: saving ? 0.5 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save review'}
          </Button>
        </div>
      </div>
    </div>
  );
}