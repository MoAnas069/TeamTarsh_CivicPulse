/* ============================================
   CivicPulse — Profile Page Component
   ============================================ */

import { getCurrentUser, getInitials, logout } from '../data/auth.js';
import { getIssuesByUser, getIssues } from '../data/store.js';
import { getCategoryByName } from '../data/categories.js';
import { getCommentCount } from '../data/comments.js';
import { timeAgo, escapeHtml, truncate, formatStatus, getStatusClass, animateCount } from '../utils/helpers.js';
import { showToast } from './toast.js';

/**
 * Create the profile / activity dashboard page
 * @param {function} onBack - navigate back to feed
 * @param {function} onSelectIssue - navigate to issue detail
 * @param {function} onLogout - called after logout
 */
export function createProfilePage(onBack, onSelectIssue, onLogout) {
  const user = getCurrentUser();
  if (!user) {
    const el = document.createElement('div');
    el.innerHTML = '<div class="container" style="padding:var(--space-16) 0;text-align:center;"><p>Please sign in to view your profile.</p></div>';
    return el;
  }

  const container = document.createElement('div');
  container.className = 'container profile-page animate-fade-in';
  container.id = 'profile-page';

  let activeTab = 'reports';

  function render() {
    const myIssues = getIssuesByUser(user.id);
    const allIssues = getIssues();
    const upvotedIssues = allIssues.filter(i => {
      try {
        const raw = localStorage.getItem('civicpulse_upvoted');
        const upvoted = raw ? JSON.parse(raw) : [];
        return upvoted.includes(i.id);
      } catch { return false; }
    });

    const totalUpvotesReceived = myIssues.reduce((sum, i) => sum + (i.upvotes || 0), 0);
    const resolvedCount = myIssues.filter(i => i.status === 'resolved').length;

    const displayIssues = activeTab === 'reports' ? myIssues : upvotedIssues;

    container.innerHTML = `
      <div style="padding:var(--space-8) 0 var(--space-16);">
        <!-- Back Button -->
        <button class="btn btn-ghost" id="profile-back" style="margin-bottom:var(--space-6);">
          <i data-lucide="arrow-left" style="width:18px;height:18px;"></i>
          Back to Feed
        </button>

        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-avatar-lg" style="background:${user.avatarColor};">
            ${getInitials(user.name)}
          </div>
          <div class="profile-info">
            <h2 class="profile-name">${escapeHtml(user.name)}</h2>
            <p class="profile-email">
              <i data-lucide="mail" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i>
              ${escapeHtml(user.email)}
            </p>
            <p class="profile-joined">
              <i data-lucide="calendar" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i>
              Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button class="btn btn-ghost btn-sm profile-logout" id="profile-logout" style="color:var(--red-400);">
            <i data-lucide="log-out" style="width:16px;height:16px;"></i>
            Sign Out
          </button>
        </div>

        <!-- Stats -->
        <div class="profile-stats stagger-children">
          <div class="stat-card">
            <div class="stat-value" style="color:var(--primary-400);" id="ps-reported" data-target="${myIssues.length}">0</div>
            <div class="stat-label">Issues Reported</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--amber-400);" id="ps-upvotes" data-target="${totalUpvotesReceived}">0</div>
            <div class="stat-label">Upvotes Received</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--emerald-400);" id="ps-resolved" data-target="${resolvedCount}">0</div>
            <div class="stat-label">Resolved</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="filter-tabs" id="profile-tabs" style="margin-bottom:var(--space-6);align-self:flex-start;">
          <button class="filter-tab ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">
            <i data-lucide="file-text" style="width:14px;height:14px;"></i>
            My Reports (${myIssues.length})
          </button>
          <button class="filter-tab ${activeTab === 'upvoted' ? 'active' : ''}" data-tab="upvoted">
            <i data-lucide="arrow-big-up" style="width:14px;height:14px;"></i>
            Upvoted (${upvotedIssues.length})
          </button>
        </div>

        <!-- Issue List -->
        <div class="profile-issue-list">
          ${displayIssues.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon animate-float">
                <i data-lucide="${activeTab === 'reports' ? 'file-plus' : 'heart'}" style="width:36px;height:36px;"></i>
              </div>
              <h3>${activeTab === 'reports' ? 'No reports yet' : 'No upvoted issues'}</h3>
              <p>${activeTab === 'reports' ? 'Start making a difference by reporting your first civic issue.' : 'Browse the feed and upvote issues that matter to you.'}</p>
            </div>
          ` : displayIssues.map(issue => renderProfileIssueCard(issue)).join('')}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [container] });
    }

    // Animate stats
    setTimeout(() => {
      container.querySelectorAll('.stat-value[data-target]').forEach(el => {
        animateCount(el, parseInt(el.dataset.target) || 0, 600);
      });
    }, 200);

    // Events
    container.querySelector('#profile-back').addEventListener('click', onBack);

    container.querySelector('#profile-logout').addEventListener('click', () => {
      logout();
      showToast({ type: 'info', title: 'Signed Out', message: 'You have been signed out successfully.' });
      if (onLogout) onLogout();
    });

    container.querySelectorAll('#profile-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        render();
      });
    });

    container.querySelectorAll('.profile-issue-item').forEach(item => {
      item.addEventListener('click', () => {
        const issueId = item.dataset.issueId;
        if (issueId && onSelectIssue) onSelectIssue(issueId);
      });
    });
  }

  function renderProfileIssueCard(issue) {
    const cat = getCategoryByName(issue.category);
    const comments = getCommentCount(issue.id);

    return `
      <div class="profile-issue-item card" data-issue-id="${issue.id}" style="cursor:pointer;">
        <div class="card-body" style="display:flex;gap:var(--space-4);align-items:flex-start;">
          <div class="profile-issue-icon" style="background:${cat.bgColor};color:${cat.color};border:1px solid ${cat.borderColor};">
            ${cat.emoji}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);flex-wrap:wrap;">
              <span class="badge" style="background:${cat.bgColor};color:${cat.color};border:1px solid ${cat.borderColor};">${cat.name}</span>
              <span class="badge ${getStatusClass(issue.status)}">${formatStatus(issue.status)}</span>
            </div>
            <p style="font-size:var(--font-sm);color:var(--text-secondary);line-height:var(--leading-relaxed);margin-bottom:var(--space-2);">
              ${escapeHtml(truncate(issue.description, 100))}
            </p>
            <div style="display:flex;align-items:center;gap:var(--space-4);font-size:var(--font-xs);color:var(--text-tertiary);">
              <span>👍 ${issue.upvotes || 0}</span>
              <span>💬 ${comments}</span>
              <span>${timeAgo(issue.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render();
  return container;
}
