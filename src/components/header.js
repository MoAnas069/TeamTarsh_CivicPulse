/* ============================================
   CivicPulse — Header Component
   Government Portal Theme
   ============================================ */

import { getStats, subscribe } from '../data/store.js';
import { getCurrentUser, getInitials, onAuthChange, logout } from '../data/auth.js';
import { createNotificationPanel } from './notification-panel.js';

export function createHeader({ onReportClick, onLoginClick, onProfileClick, onGovPanelClick, onNavigateToIssue, onAnalyticsClick }) {
  const header = document.createElement('header');
  header.className = 'header';
  header.id = 'app-header';

  const notifPanel = createNotificationPanel(onNavigateToIssue);

  function render() {
    const stats = getStats();
    const user = getCurrentUser();

    let authHtml = '';
    if (user) {
      authHtml = `
        <div class="header-actions" style="display:flex;align-items:center;gap:var(--space-4);">
          <div id="notif-mount"></div>
          <div class="profile-dropdown-container" style="position:relative;">
            <button class="profile-avatar-btn" id="header-avatar" style="background:${user.avatarColor};width:32px;height:32px;border-radius:50%;border:${user.role === 'official' ? '2px solid var(--teal-500)' : 'none'};color:white;font-weight:600;font-size:12px;cursor:pointer;">
              ${getInitials(user.name)}
            </button>
            <div class="profile-dropdown" id="profile-dropdown" style="display:none;position:absolute;top:100%;right:0;margin-top:8px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);min-width:220px;z-index:100;">
              <div style="padding:var(--space-3);border-bottom:1px solid var(--border-color);">
                <div style="font-weight:600;color:var(--text-primary);">${user.name}</div>
                <div style="font-size:var(--font-xs);color:var(--text-tertiary);">${user.email}</div>
                ${user.role === 'official' ? '<div style="margin-top:4px;"><span style="font-size:10px;background:var(--teal-50);color:var(--teal-600);padding:2px 8px;border-radius:10px;border:1px solid rgba(15,123,108,0.2);font-weight:600;display:inline-flex;align-items:center;gap:4px;"><i data-lucide="shield-check" style="width:10px;height:10px;"></i> Government Official</span></div>' : ''}
              </div>
              ${user.role === 'official' ? `
                <button class="dropdown-item" id="nav-gov-panel" style="width:100%;text-align:left;padding:var(--space-2) var(--space-3);background:transparent;border:none;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;gap:var(--space-2);transition:background 0.15s;">
                  <i data-lucide="shield" style="width:16px;height:16px;color:var(--teal-500);"></i> Gov Panel
                </button>
              ` : ''}
              <button class="dropdown-item" id="nav-profile" style="width:100%;text-align:left;padding:var(--space-2) var(--space-3);background:transparent;border:none;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;gap:var(--space-2);transition:background 0.15s;">
                <i data-lucide="user" style="width:16px;height:16px;"></i> My Profile
              </button>
              <button class="dropdown-item" id="nav-logout" style="width:100%;text-align:left;padding:var(--space-2) var(--space-3);background:transparent;border:none;color:var(--red-500);cursor:pointer;display:flex;align-items:center;gap:var(--space-2);transition:background 0.15s;">
                <i data-lucide="log-out" style="width:16px;height:16px;"></i> Sign Out
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      authHtml = `
        <button class="btn btn-ghost" id="header-login-btn">Sign In</button>
      `;
    }

    header.innerHTML = `
      <div class="container header-inner">
        <a href="#" class="header-logo" id="header-logo">
          <div class="header-logo-icon">
            <img src="/images/logo-emblem.png" alt="CivicPulse" />
          </div>
          <span>Civic<span class="text-gradient">Pulse</span></span>
        </a>

        <div class="header-nav-links" style="display:flex;align-items:center;gap:var(--space-6);margin-left:var(--space-4);flex:1;">
          <button class="btn btn-ghost btn-sm" id="nav-analytics">
            <i data-lucide="bar-chart-2" style="width:16px;height:16px;"></i>
            Analytics
          </button>
        </div>

        <nav class="header-nav">
          <div class="header-badge">
            <i data-lucide="alert-circle" style="width:14px;height:14px;"></i>
            <span class="header-badge-count" id="header-issue-count">${stats.total}</span>
            <span>issues</span>
          </div>

          ${authHtml}

          <button class="btn btn-primary btn-sm" id="header-report-btn">
            <i data-lucide="plus" style="width:16px;height:16px;"></i>
            Report Issue
          </button>

          <button class="btn-icon btn-ghost mobile-menu-btn" id="mobile-menu-toggle" aria-label="Menu">
            <i data-lucide="menu" style="width:20px;height:20px;"></i>
          </button>
        </nav>
      </div>
    `;

    // Mount notification panel
    const notifMount = header.querySelector('#notif-mount');
    if (notifMount && notifPanel) {
      notifMount.appendChild(notifPanel.element);
    }

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [header] });
    }

    // Handlers
    header.querySelector('#header-report-btn')?.addEventListener('click', onReportClick);
    
    header.querySelector('#header-logo')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    header.querySelector('#nav-analytics')?.addEventListener('click', () => {
      if (onAnalyticsClick) onAnalyticsClick();
    });

    header.querySelector('#header-login-btn')?.addEventListener('click', () => {
      if (onLoginClick) onLoginClick();
    });

    // Profile Dropdown
    const avatarBtn = header.querySelector('#header-avatar');
    const dropdown = header.querySelector('#profile-dropdown');
    
    if (avatarBtn && dropdown) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
      });

      document.addEventListener('click', (e) => {
        if (!avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      });
    }

    header.querySelector('#nav-gov-panel')?.addEventListener('click', () => {
      if (dropdown) dropdown.style.display = 'none';
      if (onGovPanelClick) onGovPanelClick();
    });

    header.querySelector('#nav-profile')?.addEventListener('click', () => {
      if (dropdown) dropdown.style.display = 'none';
      if (onProfileClick) onProfileClick();
    });

    header.querySelector('#nav-logout')?.addEventListener('click', () => {
      logout();
    });
  }

  render();

  subscribe(() => {
    const countEl = header.querySelector('#header-issue-count');
    if (countEl) countEl.textContent = getStats().total;
  });

  onAuthChange(() => render());

  return header;
}
