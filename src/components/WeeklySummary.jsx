import React from 'react';

export default function WeeklySummary({ thisWeekCount, lastWeekCount, totalHabits }) {
  const hasImprovement = thisWeekCount > lastWeekCount && lastWeekCount > 0;
  
  // Calculate completion rate (assuming 7 days * totalHabits possible completions)
  const possibleCompletions = totalHabits * 7;
  const completionRate = possibleCompletions > 0 ? (thisWeekCount / possibleCompletions) * 100 : 0;
  
  let motivationText = '';
  if (completionRate >= 90) {
    motivationText = 'Excellent consistency';
  } else if (completionRate >= 70) {
    motivationText = 'Strong week';
  }

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
      {(hasImprovement || motivationText) && (
        <div className="flex items-center gap-2 mt-0.5">
          {hasImprovement && (
            <p className="text-xs" style={{ color: '#9AA3B2', opacity: 0.6 }}>
              Improvement from last week
            </p>
          )}
          {hasImprovement && motivationText && (
            <span style={{ color: '#9AA3B2', opacity: 0.6 }}>•</span>
          )}
          {motivationText && (
            <p className="text-xs font-medium" style={{ color: '#C9A227' }}>
              {motivationText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}