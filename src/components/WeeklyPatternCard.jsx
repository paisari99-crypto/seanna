import React from 'react';

export default function WeeklyPatternCard({ mostConsistent, mostMissed, bestWeekday, totalLogs }) {
  if (totalLogs < 3) {
    return (
      <div
        className="p-5 mb-4"
        style={{
          backgroundColor: '#1A1D24',
          borderRadius: '18px'
        }}
      >
        <h2 className="text-lg font-semibold mb-3" style={{ color: '#E8EAF0' }}>
          Your weekly pattern
        </h2>
        <p className="text-sm" style={{ color: '#9AA3B2' }}>
          Keep logging habits to reveal patterns.
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-5 mb-4"
      style={{
        backgroundColor: '#1A1D24',
        borderRadius: '18px'
      }}
    >
      <h2 className="text-lg font-semibold mb-3" style={{ color: '#E8EAF0' }}>
        Your weekly pattern
      </h2>
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm" style={{ color: '#9AA3B2' }}>
            Most consistent:
          </span>
          <span className="text-sm font-medium" style={{ color: '#E8EAF0' }}>
            {mostConsistent?.name || 'None'}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm" style={{ color: '#9AA3B2' }}>
            Most missed:
          </span>
          <span className="text-sm font-medium" style={{ color: '#E8EAF0' }}>
            {mostMissed?.name || 'None'}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm" style={{ color: '#9AA3B2' }}>
            Best day:
          </span>
          <span className="text-sm font-medium" style={{ color: '#E8EAF0' }}>
            {bestWeekday || 'None'}
          </span>
        </div>
      </div>
    </div>
  );
}