import React from 'react';

export default function WeeklySummary({ thisWeekCount, lastWeekCount }) {
  const hasImprovement = thisWeekCount > lastWeekCount && lastWeekCount > 0;

  return (
    <div
      className="p-3 mb-4"
      style={{
        backgroundColor: 'rgba(26, 29, 36, 0.4)',
        borderRadius: '18px'
      }}
    >
      <p className="text-xs" style={{ color: '#9AA3B2' }}>
        {thisWeekCount} habit{thisWeekCount !== 1 ? 's' : ''} completed this week
      </p>
      {hasImprovement && (
        <p className="text-xs mt-0.5" style={{ color: '#9AA3B2', opacity: 0.6 }}>
          Improvement from last week
        </p>
      )}
    </div>
  );
}