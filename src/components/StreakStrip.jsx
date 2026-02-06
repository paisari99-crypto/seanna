import React from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export default function StreakStrip({ logs, userTimezone }) {
  // Get last 7 days in user's timezone
  const getDaysArray = () => {
    const days = [];
    const now = new Date();
    const zonedNow = toZonedTime(now, userTimezone);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(zonedNow);
      date.setDate(date.getDate() - i);
      days.push({
        date: format(date, 'yyyy-MM-dd'),
        weekday: format(date, 'EEE')
      });
    }
    
    return days;
  };

  const days = getDaysArray();
  
  const getStatusForDay = (dateStr) => {
    const log = logs.find(l => l.date === dateStr);
    if (!log) return 'none';
    return log.status;
  };

  return (
    <div className="flex gap-2">
      {days.map((day) => {
        const status = getStatusForDay(day.date);
        
        return (
          <div key={day.date} className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-lg"
              style={{
                backgroundColor: status === 'done' 
                  ? '#C9A227' 
                  : status === 'missed' 
                    ? '#9AA3B2' 
                    : 'transparent',
                border: status === 'none' ? '1px solid #9AA3B2' : 'none',
                opacity: status === 'missed' ? 0.3 : 1
              }}
            />
            <span className="text-xs" style={{ color: '#9AA3B2' }}>
              {day.weekday}
            </span>
          </div>
        );
      })}
    </div>
  );
}