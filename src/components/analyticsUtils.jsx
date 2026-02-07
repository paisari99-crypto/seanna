import { format } from 'date-fns';

/**
 * Calculate most consistent habit over last 7 days
 * Returns { name, completionRate } or null if insufficient data
 */
export const getMostConsistentHabit = (habits, habitLogs) => {
  if (!habits || habits.length === 0) return null;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const habitStats = habits.map(habit => {
    const logs = habitLogs.filter(log => 
      log.habitId === habit.id && 
      new Date(log.date) >= sevenDaysAgo
    );
    
    const loggedDays = logs.length;
    const doneCount = logs.filter(log => log.status === 'done').length;
    const completionRate = loggedDays > 0 ? (doneCount / loggedDays) * 100 : 0;
    
    return {
      name: habit.name,
      completionRate,
      loggedDays
    };
  });
  
  // Filter habits with at least 3 logged days
  const eligible = habitStats.filter(h => h.loggedDays >= 3);
  
  if (eligible.length === 0) return null;
  
  // Find the one with highest completion rate
  eligible.sort((a, b) => b.completionRate - a.completionRate);
  
  return eligible[0];
};

/**
 * Find habit that needs attention (lowest completion rate, min 3 logs)
 * Returns { name } or null
 */
export const getNeedsAttentionHabit = (habits, habitLogs) => {
  if (!habits || habits.length === 0) return null;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const habitStats = habits.map(habit => {
    const logs = habitLogs.filter(log => 
      log.habitId === habit.id && 
      new Date(log.date) >= sevenDaysAgo
    );
    
    const loggedDays = logs.length;
    const doneCount = logs.filter(log => log.status === 'done').length;
    const completionRate = loggedDays > 0 ? (doneCount / loggedDays) * 100 : 0;
    
    return {
      name: habit.name,
      completionRate,
      loggedDays
    };
  });
  
  // Filter habits with at least 3 logged days
  const eligible = habitStats.filter(h => h.loggedDays >= 3);
  
  if (eligible.length === 0) return null;
  
  // Find the one with lowest completion rate
  eligible.sort((a, b) => a.completionRate - b.completionRate);
  
  return eligible[0];
};

/**
 * Find strongest weekday over last 14 days
 * Returns weekday name or null
 */
export const getStrongestDay = (habitLogs) => {
  if (!habitLogs || habitLogs.length === 0) return null;
  
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const recentLogs = habitLogs.filter(log => new Date(log.date) >= fourteenDaysAgo);
  
  if (recentLogs.length < 5) return null; // Need at least 5 logs
  
  // Count done logs per weekday
  const weekdayCounts = {
    0: { done: 0, total: 0 }, // Sunday
    1: { done: 0, total: 0 }, // Monday
    2: { done: 0, total: 0 }, // Tuesday
    3: { done: 0, total: 0 }, // Wednesday
    4: { done: 0, total: 0 }, // Thursday
    5: { done: 0, total: 0 }, // Friday
    6: { done: 0, total: 0 }  // Saturday
  };
  
  recentLogs.forEach(log => {
    const date = new Date(log.date);
    const weekday = date.getDay();
    
    weekdayCounts[weekday].total++;
    if (log.status === 'done') {
      weekdayCounts[weekday].done++;
    }
  });
  
  // Calculate completion rates
  const weekdayRates = Object.entries(weekdayCounts).map(([day, counts]) => ({
    day: parseInt(day),
    rate: counts.total > 0 ? (counts.done / counts.total) * 100 : 0,
    total: counts.total
  }));
  
  // Filter days with at least 2 logs
  const eligibleDays = weekdayRates.filter(d => d.total >= 2);
  
  if (eligibleDays.length === 0) return null;
  
  // Find highest rate
  eligibleDays.sort((a, b) => b.rate - a.rate);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[eligibleDays[0].day];
};