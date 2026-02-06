import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * Get the user's timezone from their profile
 */
export const getUserTimezone = (userProfile) => {
  return userProfile?.timezone || 'UTC';
};

/**
 * Get today's date in the user's timezone as YYYY-MM-DD
 */
export const getUserToday = (userProfile) => {
  const timezone = getUserTimezone(userProfile);
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  return format(zonedDate, 'yyyy-MM-dd');
};

/**
 * Get a date relative to today in the user's timezone
 * @param {number} daysOffset - positive for future, negative for past
 */
export const getUserDate = (userProfile, daysOffset = 0) => {
  const timezone = getUserTimezone(userProfile);
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  zonedDate.setDate(zonedDate.getDate() + daysOffset);
  return format(zonedDate, 'yyyy-MM-dd');
};

/**
 * Format a date in the user's timezone
 */
export const formatUserDate = (date, userProfile, formatString = 'EEEE, MMMM d, yyyy') => {
  const timezone = getUserTimezone(userProfile);
  const zonedDate = toZonedTime(date, timezone);
  return format(zonedDate, formatString);
};

/**
 * Calculate current streak from full HabitLog history
 * A streak is consecutive days with status = "done"
 * Skipped or Missed breaks the streak
 * Must be today or yesterday to count as active
 */
export const calculateCurrentStreak = (logs, todayStr) => {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const mostRecentLog = sortedLogs[0];

  // Check if most recent log is today or yesterday
  const todayDate = new Date(todayStr);
  const yesterdayDate = new Date(todayStr);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = format(yesterdayDate, 'yyyy-MM-dd');

  if (mostRecentLog.date !== todayStr && mostRecentLog.date !== yesterdayStr) return 0;
  if (mostRecentLog.status !== 'done') return 0;

  let streak = 0;
  let expectedDate = mostRecentLog.date;

  for (const log of sortedLogs) {
    if (log.date === expectedDate && log.status === 'done') {
      streak++;
      const nextDate = new Date(expectedDate);
      nextDate.setDate(nextDate.getDate() - 1);
      expectedDate = format(nextDate, 'yyyy-MM-dd');
    } else if (log.date < expectedDate) {
      break;
    }
  }

  return streak;
};

/**
 * Calculate best streak from full HabitLog history
 * Scans all logs to find the longest consecutive "done" streak ever
 */
export const calculateBestStreak = (logs) => {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate = null;

  for (const log of sortedLogs) {
    if (log.status !== 'done') {
      currentStreak = 0;
      lastDate = null;
      continue;
    }

    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      currentStreak = 1;
    } else {
      const dayDiff = Math.round((logDate - lastDate) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    lastDate = logDate;
  }

  return maxStreak;
};

/**
 * Get the start of the current week (Monday) in user's timezone
 * @param {string} dateStr - YYYY-MM-DD date string
 * @returns {string} YYYY-MM-DD for the Monday of that week
 */
export const getStartOfWeek = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysToMonday = (dayOfWeek + 6) % 7; // Days to go back to Monday
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToMonday);
  return format(monday, 'yyyy-MM-dd');
};