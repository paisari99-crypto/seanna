import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TodaySummary({ totalHabits, completedToday, tomorrowHabits }) {
  const navigate = useNavigate();

  if (totalHabits === 0) {
    return null;
  }

  const allCompleted = completedToday === totalHabits;

  return (
    <div
      className="p-6 mb-6"
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '18px'
      }}
    >
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Today
      </h3>
      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
        {allCompleted 
          ? 'All habits completed today.'
          : `You completed ${completedToday} of ${totalHabits} habit${totalHabits !== 1 ? 's' : ''} today.`}
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
        {tomorrowHabits === totalHabits 
          ? 'Tomorrow: Same system continues'
          : `Tomorrow: ${tomorrowHabits} habit${tomorrowHabits !== 1 ? 's' : ''} scheduled`}
      </p>
      {totalHabits > 7 && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
          Many active habits. Focus on your essentials.
        </p>
      )}
      {!allCompleted && (
        <button
          onClick={() => navigate(createPageUrl('Habits'))}
          className="px-4 py-2 font-semibold"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: '18px'
          }}
        >
          Continue today
        </button>
      )}
    </div>
  );
}