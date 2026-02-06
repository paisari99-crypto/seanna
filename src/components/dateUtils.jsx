import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { base44 } from '@/api/base44Client';

let cachedTimezone = null;

/**
 * Get the user's timezone from their profile
 */
export const getUserTimezone = async () => {
  if (cachedTimezone) return cachedTimezone;
  
  try {
    const currentUser = await base44.auth.me();
    const userProfiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
    
    if (userProfiles.length > 0 && userProfiles[0].timezone) {
      cachedTimezone = userProfiles[0].timezone;
      return cachedTimezone;
    }
  } catch (error) {
    console.error('Error fetching user timezone:', error);
  }
  
  // Fallback to Europe/London (default in UserProfile schema)
  return 'Europe/London';
};

/**
 * Get today's date in the user's timezone as YYYY-MM-DD
 */
export const getUserToday = async () => {
  const timezone = await getUserTimezone();
  const now = new Date();
  const zonedDate = utcToZonedTime(now, timezone);
  return format(zonedDate, 'yyyy-MM-dd');
};

/**
 * Get a date relative to today in the user's timezone
 * @param {number} daysOffset - positive for future, negative for past
 */
export const getUserDate = async (daysOffset = 0) => {
  const timezone = await getUserTimezone();
  const now = new Date();
  const zonedDate = utcToZonedTime(now, timezone);
  zonedDate.setDate(zonedDate.getDate() + daysOffset);
  return format(zonedDate, 'yyyy-MM-dd');
};

/**
 * Reset cached timezone (call when user profile changes)
 */
export const resetTimezoneCache = () => {
  cachedTimezone = null;
};