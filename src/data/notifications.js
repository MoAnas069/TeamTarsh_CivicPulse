/* ============================================
   CivicPulse — Notifications Module
   ============================================ */

const NOTIFICATIONS_KEY = 'civicpulse_notifications';
const notifListeners = new Set();

/**
 * Get all notifications from localStorage
 */
function getAllNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save notifications
 */
function saveNotifications(notifications) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  notifyChange();
}

/**
 * Get notifications for a specific user, sorted newest first
 */
export function getNotifications(userId) {
  return getAllNotifications()
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get unread notification count for a user
 */
export function getUnreadCount(userId) {
  return getAllNotifications()
    .filter(n => n.userId === userId && !n.read)
    .length;
}

/**
 * Add a notification
 */
export function addNotification(userId, message, issueId = null) {
  const notifications = getAllNotifications();
  const newNotif = {
    id: crypto.randomUUID(),
    userId,
    message,
    issueId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.push(newNotif);
  saveNotifications(notifications);
  return newNotif;
}

/**
 * Mark a single notification as read
 */
export function markAsRead(notificationId) {
  const notifications = getAllNotifications();
  const notif = notifications.find(n => n.id === notificationId);
  if (!notif) return false;

  notif.read = true;
  saveNotifications(notifications);
  return true;
}

/**
 * Mark all notifications as read for a user
 */
export function markAllRead(userId) {
  const notifications = getAllNotifications();
  let changed = false;
  notifications.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      changed = true;
    }
  });
  if (changed) saveNotifications(notifications);
  return changed;
}

/**
 * Subscribe to notification changes
 */
export function onNotificationChange(fn) {
  notifListeners.add(fn);
  return () => notifListeners.delete(fn);
}

/**
 * Notify subscribers
 */
function notifyChange() {
  notifListeners.forEach(fn => fn());
}

/**
 * Seed demo notifications
 */
export function seedNotifications() {
  if (getAllNotifications().length > 0) return;

  const seeds = [
    {
      id: 'notif-1',
      userId: 'demo-user-1',
      message: 'Your report "Large pothole on Main Street" status changed to In Progress.',
      issueId: 'seed-1',
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'demo-user-1',
      message: 'Your report "Broken playground equipment" has been Resolved.',
      issueId: 'seed-5',
      read: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(seeds));
}
