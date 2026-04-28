/* ============================================
   CivicPulse — Notification Panel Component
   ============================================ */

import { getCurrentUser } from '../data/auth.js';
import { getNotifications, getUnreadCount, markAsRead, markAllRead, onNotificationChange } from '../data/notifications.js';
import { timeAgo, escapeHtml } from '../utils/helpers.js';

/**
 * Create the notification bell button + dropdown panel
 * @param {function} onNavigateToIssue - called with issueId when a notification is clicked
 */
export function createNotificationPanel(onNavigateToIssue) {
  const container = document.createElement('div');
  container.className = 'notif-wrapper';
  container.id = 'notification-panel';

  let isOpen = false;

  function render() {
    const user = getCurrentUser();
    if (!user) {
      container.innerHTML = '';
      return;
    }

    const unread = getUnreadCount(user.id);

    container.innerHTML = `
      <button class="btn-icon btn-ghost notif-bell-btn" id="notif-bell" aria-label="Notifications">
        <i data-lucide="bell" style="width:20px;height:20px;"></i>
        ${unread > 0 ? `<span class="notif-badge">${unread > 9 ? '9+' : unread}</span>` : ''}
      </button>

      <div class="notif-dropdown ${isOpen ? 'open' : ''}" id="notif-dropdown">
        <div class="notif-dropdown-header">
          <h4>Notifications</h4>
          ${unread > 0 ? `<button class="btn btn-ghost btn-sm" id="mark-all-read" style="font-size:var(--font-xs);color:var(--primary-400);">Mark all read</button>` : ''}
        </div>
        <div class="notif-list" id="notif-list">
          ${renderNotifList(user.id)}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [container] });
    }

    // Toggle dropdown
    container.querySelector('#notif-bell')?.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      const dropdown = container.querySelector('#notif-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('open', isOpen);
      }
    });

    // Mark all read
    container.querySelector('#mark-all-read')?.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllRead(user.id);
      render();
    });

    // Notification item clicks
    container.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const notifId = item.dataset.notifId;
        const issueId = item.dataset.issueId;
        markAsRead(notifId);
        isOpen = false;
        render();
        if (issueId && onNavigateToIssue) {
          onNavigateToIssue(issueId);
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isOpen && !container.contains(e.target)) {
        isOpen = false;
        const dropdown = container.querySelector('#notif-dropdown');
        if (dropdown) dropdown.classList.remove('open');
      }
    });
  }

  function renderNotifList(userId) {
    const notifications = getNotifications(userId);

    if (notifications.length === 0) {
      return `
        <div class="notif-empty">
          <span style="font-size:1.5rem;">🎉</span>
          <p>You're all caught up!</p>
        </div>
      `;
    }

    return notifications.slice(0, 20).map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" data-issue-id="${n.issueId || ''}">
        <div class="notif-dot ${n.read ? '' : 'active'}"></div>
        <div class="notif-content">
          <p class="notif-message">${escapeHtml(n.message)}</p>
          <span class="notif-time">${timeAgo(n.createdAt)}</span>
        </div>
      </div>
    `).join('');
  }

  render();

  // Subscribe to notification changes
  onNotificationChange(() => render());

  return { element: container, refresh: render };
}
