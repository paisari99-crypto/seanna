import { format } from 'date-fns';

/**
 * Get the most consistent habit based on completion rate over last 7 days
 * @param {Array} habits - Array of habit objects
 * @param {Array} logs - Array of habit log objects
 * @returns {Object|null} - Habit with highest completion rate or null
 */
export const getMostConsistentHabit = (habits, logs) => {
  if (!habits || habits.length === 0 || !logs || logs.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // Last 7 days including today

  const habitStats = habits.map(habit => {
    const habitLogs = logs.filter(log => 
      log.habitId === habit.id && 
      new Date(log.date) >= sevenDaysAgo && 
      new Date(log.date) <= today
    );
    
    const doneCount = habitLogs.filter(log => log.status === 'done').length;
    const completionRate = doneCount / 7;
    
    return {
      habit,
      completionRate,
      doneCount
    };
  }).filter(stat => stat.completionRate > 0);

  if (habitStats.length === 0) return null;

  // Sort by completion rate (desc), then by done count (desc)
  habitStats.sort((a, b) => {
    if (b.completionRate !== a.completionRate) {
      return b.completionRate - a.completionRate;
    }
    return b.doneCount - a.doneCount;
  });

  return habitStats[0].habit;
};

/**
 * Get the habit with most missed logs over last 7 days
 * @param {Array} habits - Array of habit objects
 * @param {Array} logs - Array of habit log objects
 * @returns {Object|null} - Habit with most missed logs or null
 */
export const getMostMissedHabit = (habits, logs) => {
  if (!habits || habits.length === 0 || !logs || logs.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const habitMissedCounts = habits.map(habit => {
    const habitLogs = logs.filter(log => 
      log.habitId === habit.id && 
      new Date(log.date) >= sevenDaysAgo && 
      new Date(log.date) <= today
    );
    
    const missedCount = habitLogs.filter(log => log.status === 'missed').length;
    
    return {
      habit,
      missedCount
    };
  }).filter(stat => stat.missedCount > 0);

  if (habitMissedCounts.length === 0) return null;

  // Sort by missed count (desc)
  habitMissedCounts.sort((a, b) => b.missedCount - a.missedCount);

  return habitMissedCounts[0].habit;
};

/**
 * Get the weekday with most done logs
 * @param {Array} logs - Array of habit log objects
 * @returns {string|null} - Weekday name (e.g., 'Monday') or null
 */
export const getBestWeekday = (logs) => {
  if (!logs || logs.length === 0) return null;

  const doneLogs = logs.filter(log => log.status === 'done');
  if (doneLogs.length === 0) return null;

  const weekdayCounts = {
    'Monday': 0,
    'Tuesday': 0,
    'Wednesday': 0,
    'Thursday': 0,
    'Friday': 0,
    'Saturday': 0,
    'Sunday': 0
  };

  doneLogs.forEach(log => {
    const date = new Date(log.date);
    const weekday = format(date, 'EEEE');
    if (weekdayCounts[weekday] !== undefined) {
      weekdayCounts[weekday]++;
    }
  });

  let bestWeekday = null;
  let maxCount = 0;

  Object.entries(weekdayCounts).forEach(([weekday, count]) => {
    if (count > maxCount) {
      maxCount = count;
      bestWeekday = weekday;
    }
  });

  return bestWeekday;
};