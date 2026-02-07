/**
 * Request notification permission from the browser
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

/**
 * Check if current time is within quiet hours
 */
export const isInQuietHours = (quietHoursEnabled, quietHoursStart, quietHoursEnd) => {
  if (!quietHoursEnabled) return false;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startHours, startMins] = quietHoursStart.split(':').map(Number);
  const startMinutes = startHours * 60 + startMins;
  
  const [endHours, endMins] = quietHoursEnd.split(':').map(Number);
  const endMinutes = endHours * 60 + endMins;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

/**
 * Schedule a notification at a specific time
 */
export const scheduleNotification = (time, title, body, tag) => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, skip
  if (scheduledTime <= now) {
    return null;
  }
  
  const delay = scheduledTime - now;
  
  const timeoutId = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        tag,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }, delay);
  
  return timeoutId;
};

/**
 * Check and schedule habit reminders
 */
export const checkAndScheduleReminders = async (habits, logs, userProfile) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;
  
  const today = new Date().toISOString().split('T')[0];
  const activeReminders = [];
  
  for (const habit of habits) {
    if (!habit.reminderEnabled || !habit.isActive) continue;
    
    // Check if already logged today
    const todayLog = logs.find(log => log.habitId === habit.id && log.date === today);
    if (todayLog) continue;
    
    // Check quiet hours at reminder time
    const reminderHour = parseInt(habit.reminderTime.split(':')[0]);
    const currentHour = new Date().getHours();
    
    // Only schedule if reminder time hasn't passed yet
    if (reminderHour <= currentHour) continue;
    
    const timeoutId = scheduleNotification(
      habit.reminderTime,
      'Habit Reminder',
      `${habit.name} needs attention`,
      `habit-${habit.id}`
    );
    
    if (timeoutId) {
      activeReminders.push({ habitId: habit.id, timeoutId });
    }
  }
  
  return activeReminders;
};