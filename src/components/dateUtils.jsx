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