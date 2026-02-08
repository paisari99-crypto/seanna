import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function DailyReviewHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const currentUser = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
        
        if (profiles.length === 0) return;
        
        const profile = profiles[0];
        const allReviews = await base44.entities.DailyReview.filter({ userId: profile.id });
        
        // Sort by date descending
        const sorted = allReviews.sort((a, b) => b.date.localeCompare(a.date));
        setReviews(sorted);
      } catch (error) {
        console.error('Error loading reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen animate-fadeIn" style={{ backgroundColor: '#0F1115' }}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <p style={{ color: '#9AA3B2' }}>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 animate-fadeIn" style={{ backgroundColor: '#0F1115' }}>
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 p-2"
          style={{ color: '#9AA3B2' }}
        >
          <ArrowLeft size={24} />
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1" style={{ color: '#E8EAF0' }}>
            Review History
          </h1>
          <p className="text-sm" style={{ color: '#9AA3B2' }}>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {reviews.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{
              backgroundColor: '#1A1D24',
              borderRadius: '18px'
            }}
          >
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(201, 162, 39, 0.1)' }}>
                <FileText size={32} style={{ color: '#C9A227', opacity: 0.5 }} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8EAF0' }}>
              No reviews yet
            </h3>
            <p className="text-sm mb-4" style={{ color: '#9AA3B2' }}>
              Start your first daily review to track your progress.
            </p>
            <button
              onClick={() => navigate(createPageUrl('DailyReview'))}
              className="px-6 py-3 font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: '#C9A227',
                color: '#0F1115',
                borderRadius: '18px'
              }}
            >
              Create first review
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <button
                key={review.id}
                onClick={() => navigate(createPageUrl('DailyReview'))}
                className="w-full text-left p-4 flex items-center justify-between transition-all hover:opacity-80 animate-slideUp"
                style={{
                  backgroundColor: '#1A1D24',
                  borderRadius: '18px',
                  animationDelay: `${index * 30}ms`
                }}
              >
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: '#E8EAF0' }}>
                    {new Date(review.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  
                  {review.summarySnapshot?.habitsCompleted !== undefined && (
                    <p className="text-xs mb-2" style={{ color: '#C9A227' }}>
                      {review.summarySnapshot.habitsCompleted} of {review.summarySnapshot.habitsTotal} habits completed
                    </p>
                  )}
                  
                  {review.focusTomorrow && (
                    <p className="text-sm line-clamp-2" style={{ color: '#9AA3B2' }}>
                      Focus: {review.focusTomorrow}
                    </p>
                  )}
                </div>
                
                <ChevronRight size={20} style={{ color: '#9AA3B2' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}