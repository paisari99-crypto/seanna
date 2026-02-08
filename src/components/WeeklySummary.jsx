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
        backgroundColor: 'var(--surface-alt)',
        borderRadius: '18px'
      }}
    >
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {thisWeekCount} habit{thisWeekCount !== 1 ? 's' : ''} completed this week
      </p>
      {(hasImprovement || motivationText) && (
        <div className="flex items-center gap-2 mt-0.5">
          {hasImprovement && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
              Improvement from last week
            </p>
          )}
          {hasImprovement && motivationText && (
            <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>•</span>
          )}
          {motivationText && (
            <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
              {motivationText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}