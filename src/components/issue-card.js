/* ============================================
   CivicPulse — Issue Card Component
   Government Portal Theme
   ============================================ */

import { getCategoryByName } from '../data/categories.js';
import { hasUpvoted, upvoteIssue, removeUpvote } from '../data/store.js';
import { getCommentCount } from '../data/comments.js';
import { getDepartmentForCategory } from '../data/departments.js';
import { getUserById } from '../data/auth.js';
import { timeAgo, truncate, escapeHtml, formatStatus, getStatusClass } from '../utils/helpers.js';

/**
 * Create an issue card element
 * @param {object} issue - The issue data
 * @param {function} onSelect - Callback when card is clicked (receives issue id)
 */
export function createIssueCard(issue, onSelect) {
  const card = document.createElement('article');
  card.className = 'card issue-card';
  card.id = `issue-card-${issue.id}`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const cat = getCategoryByName(issue.category);
  const voted = hasUpvoted(issue.id);
  const commentCount = getCommentCount(issue.id);

  // Generate a placeholder gradient for issues without images
  const imageHtml = issue.imageUrl
    ? `<img class="issue-card-image" src="${issue.imageUrl}" alt="${escapeHtml(issue.description.substring(0, 50))}" loading="lazy" />`
    : `<div class="issue-card-image" style="background: ${cat.bgColor}; display: flex; align-items: center; justify-content: center;"><i data-lucide="${cat.icon}" style="width:48px;height:48px;color:${cat.color};opacity:0.6;"></i></div>`;

  const assignee = issue.assignedTo ? getUserById(issue.assignedTo) : null;
  const assignedHtml = assignee ? `<span style="font-size:var(--font-xs);color:var(--primary-500);background:var(--primary-50);padding:2px 8px;border-radius:12px;margin-left:auto;font-weight:600;border:1px solid var(--primary-200);"><i data-lucide="user-check" style="width:12px;display:inline;"></i> Assg: ${escapeHtml(assignee.name.split(' ')[0])}</span>` : '';

  let priorityHtml = '';
  if (issue.severityScore >= 80) {
    priorityHtml = `<span class="badge" style="background:var(--red-50);color:var(--red-600);border:1px solid rgba(239,68,68,0.25);"><i data-lucide="alert-triangle" style="width:12px;display:inline;"></i> CRITICAL</span>`;
  } else if (issue.severityScore >= 60) {
    priorityHtml = `<span class="badge" style="background:var(--amber-50);color:var(--amber-600);border:1px solid rgba(245,158,11,0.25);"><i data-lucide="alert-triangle" style="width:12px;display:inline;"></i> HIGH</span>`;
  }

  card.innerHTML = `
    ${imageHtml}
    <div class="issue-card-body">
      <div class="issue-card-top" style="display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center;">
        <span class="badge" style="background:${cat.bgColor};color:${cat.color};border:1px solid ${cat.borderColor};">
          <i data-lucide="${cat.icon}" style="width:12px;height:12px;display:inline;"></i> ${cat.name}
        </span>
        <span class="badge" style="background:var(--gray-50);color:var(--text-secondary);border:1px solid var(--border-color);">
          <i data-lucide="building-2" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
          ${getDepartmentForCategory(issue.category)}
        </span>
        ${priorityHtml}
        <span class="badge ${getStatusClass(issue.status)}">${formatStatus(issue.status)}</span>
        ${assignedHtml}
      </div>

      <p class="issue-card-description">${escapeHtml(truncate(issue.description, 140))}</p>

      <div class="issue-card-meta">
        <div class="issue-card-location" style="margin-bottom:var(--space-2);">
          <i data-lucide="map-pin" style="width:12px;height:12px;flex-shrink:0;"></i>
          <span>${escapeHtml(truncate(issue.location?.address || 'Unknown', 40))}</span>
        </div>

        <div style="font-size:var(--font-xs);color:var(--text-tertiary);margin-bottom:var(--space-3);">
          Reported by <strong>${escapeHtml(issue.userName || 'Anonymous')}</strong>
        </div>

        <div style="display:flex;align-items:center;gap:var(--space-3);justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <button class="upvote-btn ${voted ? 'upvoted' : ''}" id="upvote-${issue.id}" aria-label="Upvote">
              <i data-lucide="arrow-big-up" class="upvote-icon" style="width:16px;height:16px;"></i>
              <span class="upvote-count">${issue.upvotes || 0}</span>
            </button>
            <div style="font-size:var(--font-xs);color:var(--text-tertiary);display:flex;align-items:center;gap:4px;">
              <i data-lucide="message-circle" style="width:14px;height:14px;"></i>
              ${commentCount}
            </div>
          </div>
          <span class="issue-card-time">${timeAgo(issue.createdAt)}</span>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons({ nodes: [card] });
  }

  // Upvote handler (stop propagation so card click doesn't fire)
  const upvoteBtn = card.querySelector(`#upvote-${issue.id}`);
  upvoteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isUpvoted = hasUpvoted(issue.id);

    if (isUpvoted) {
      removeUpvote(issue.id);
      upvoteBtn.classList.remove('upvoted');
      const count = upvoteBtn.querySelector('.upvote-count');
      count.textContent = Math.max(0, parseInt(count.textContent) - 1);
    } else {
      upvoteIssue(issue.id);
      upvoteBtn.classList.add('upvoted');
      const count = upvoteBtn.querySelector('.upvote-count');
      count.textContent = parseInt(count.textContent) + 1;

      // Subtle animation
      const icon = upvoteBtn.querySelector('.upvote-icon');
      icon.style.animation = 'none';
      requestAnimationFrame(() => {
        icon.style.animation = 'bounce-up 300ms ease';
      });
    }
  });

  // Card click → open detail
  card.addEventListener('click', () => onSelect(issue.id));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(issue.id);
    }
  });

  return card;
}
