import React from 'react';

export default function WeeklySummary({ thisWeekCount, lastWeekCount }) {
  const hasImprovement = thisWeekCount > lastWeekCount && lastWeekCount > 0;

  return (
    <div
      className="p-6 mb-6"
      style={{
        backgroundColor: '#1A1D24',
        borderRadius: '18px'
      }}
    >
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8EAF0' }}>
        This week
      </h3>
      <p className="text-sm" style={{ color: '#9AA3B2' }}>
        You completed {thisWeekCount} habit{thisWeekCount !== 1 ? 's' : ''} this week.
      </p>
      {hasImprovement && (
        <p className="text-xs mt-1" style={{ color: '#9AA3B2', opacity: 0.7 }}>
          Improvement from last week
        </p>
      )}
    </div>
  );
}