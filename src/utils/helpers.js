/* ============================================
   CivicPulse — Helper Utilities
   ============================================ */

/**
 * Generate a UUID v4
 */
export function generateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format a date as relative time ("2 hours ago", "3 days ago")
 */
export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}

/**
 * Debounce a function
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Animate a number counting up
 */
export function animateCount(element, target, duration = 1000) {
  const start = parseInt(element.textContent) || 0;
  const range = target - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + range * easedProgress);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Format status text for display
 */
export function formatStatus(status) {
  const map = {
    'reported': 'Reported',
    'in_progress': 'In Progress',
    'resolved': 'Resolved',
  };
  return map[status] || status;
}

/**
 * Get status CSS class
 */
export function getStatusClass(status) {
  return `status-${status}`;
}

/**
 * Create confetti animation (disabled for government portal)
 */
export function createConfetti() {
  // Confetti disabled in government portal theme
}
