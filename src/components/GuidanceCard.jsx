import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GuidanceCard({ habitCount, hasLoggedToday, developerPreview }) {
  const navigate = useNavigate();

  // Priority 1: Habit completed today → success card
  if (hasLoggedToday) {
    return (
      <div
        className="p-6 mb-6"
        style={{
          backgroundColor: '#1A1D24',
          borderRadius: '18px',
          border: '2px solid rgba(201, 162, 39, 0.3)'
        }}
      >
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
          System active
        </h3>
        <p className="text-sm mb-4" style={{ color: '#9AA3B2' }}>
          You completed progress today.
        </p>
        <button
          onClick={() => navigate(createPageUrl('Insights'))}
          className="px-4 py-2 font-semibold"
          style={{
            backgroundColor: '#C9A227',
            color: '#0F1115',
            borderRadius: '18px'
          }}
        >
          View insights
        </button>
      </div>
    );
  }

  // Priority 2: No habits → onboarding card
  if (!developerPreview && habitCount > 0) {
    return null;
  }

  // Priority 3: Habit exists but not logged → mark progress card
  return (
    <div
      className="p-6 mb-6"
      style={{
        backgroundColor: '#1A1D24',
        borderRadius: '18px',
        border: '2px solid rgba(201, 162, 39, 0.2)'
      }}
    >
      <h3 className="text-xl font-semibold mb-2" style={{ color: '#E8EAF0' }}>
        Start your first system
      </h3>
      <p className="text-sm mb-4" style={{ color: '#9AA3B2' }}>
        Build one small habit to see how Seanna works.
      </p>
      <button
        onClick={() => navigate(`${createPageUrl('HabitNew')}?onboarding=true`)}
        className="px-4 py-2 font-semibold"
        style={{
          backgroundColor: '#C9A227',
          color: '#0F1115',
          borderRadius: '18px'
        }}
      >
        Create first habit
      </button>
    </div>
  );
}