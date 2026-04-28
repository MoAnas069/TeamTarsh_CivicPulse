/* ============================================
   CivicPulse — Issue Detail Component
   Government Portal Theme
   ============================================ */

import { getIssueById, hasUpvoted, upvoteIssue, removeUpvote, updateIssueStatus } from '../data/store.js';
import { getCategoryByName } from '../data/categories.js';
import { getCurrentUser, getUserById } from '../data/auth.js';
import { getDepartmentForCategory } from '../data/departments.js';
import { createCommentSection } from './comment-section.js';
import { timeAgo, escapeHtml, formatStatus, getStatusClass } from '../utils/helpers.js';
import { showToast } from './toast.js';

/**
 * Create the issue detail view
 * @param {string} issueId
 * @param {function} onBack - callback to return to feed
 * @param {function} onAuthRequired - callback to trigger login
 */
export function createIssueDetail(issueId, onBack, onAuthRequired) {
  const issue = getIssueById(issueId);
  if (!issue) {
    const el = document.createElement('div');
    el.innerHTML = '<div class="container"><p>Issue not found.</p></div>';
    return el;
  }

  const container = document.createElement('div');
  container.className = 'detail-view container';
  container.id = 'issue-detail-view';

  const cat = getCategoryByName(issue.category);
  const voted = hasUpvoted(issue.id);
  const user = getCurrentUser();
  const isAuthor = user && user.id === issue.userId;
  const isOfficial = user && user.role === 'official';
  const canUpdate = isAuthor || isOfficial;

  const assignee = issue.assignedTo ? getUserById(issue.assignedTo) : null;
  const assignedHtml = assignee ? `
    <div style="background:var(--primary-50);border:1px solid var(--primary-200);padding:var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-4);display:flex;align-items:center;gap:var(--space-3);">
      <i data-lucide="shield-check" style="width:20px;height:20px;color:var(--primary-500);"></i>
      <div>
        <div style="font-size:var(--font-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Assigned Official</div>
        <div style="font-weight:500;color:var(--text-primary);">${assignee.name}</div>
      </div>
    </div>
  ` : '';

  let priorityHtml = '';
  if (issue.severityScore >= 80) {
    priorityHtml = `<span class="badge" style="background:var(--red-50);color:var(--red-600);border:1px solid rgba(239,68,68,0.25);"><i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i> CRITICAL SEVERITY</span>`;
  } else if (issue.severityScore >= 60) {
    priorityHtml = `<span class="badge" style="background:var(--amber-50);color:var(--amber-600);border:1px solid rgba(245,158,11,0.25);"><i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i> HIGH SEVERITY</span>`;
  }

  const imageHtml = issue.imageUrl
    ? `<img class="detail-image" src="${issue.imageUrl}" alt="${escapeHtml(issue.description.substring(0, 50))}" />`
    : `<div class="detail-image" style="background: ${cat.bgColor}; height: 300px; display: flex; align-items: center; justify-content: center;"><i data-lucide="${cat.icon}" style="width:64px;height:64px;color:${cat.color};opacity:0.5;"></i></div>`;

  container.innerHTML = `
    <div style="padding: var(--space-8) 0;">
      <!-- Back Button -->
      <button class="btn btn-ghost" id="detail-back" style="margin-bottom: var(--space-6);">
        <i data-lucide="arrow-left" style="width:18px;height:18px;"></i>
        Back to Feed
      </button>

      <!-- Image -->
      <div class="detail-image-wrapper">
        ${imageHtml}
      </div>

      <!-- Content Grid -->
      <div class="detail-content">
        <!-- Main Content -->
        <div class="detail-main">
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;">
            <span class="badge" style="background:${cat.bgColor};color:${cat.color};border:1px solid ${cat.borderColor};font-size:var(--font-sm);padding:var(--space-2) var(--space-4);">
              <i data-lucide="${cat.icon}" style="width:14px;height:14px;display:inline;"></i> ${cat.name}
            </span>
            <span class="badge" style="background:var(--gray-50);color:var(--text-secondary);border:1px solid var(--border-color);font-size:var(--font-sm);padding:var(--space-2) var(--space-4);">
              <i data-lucide="building-2" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i>
              ${getDepartmentForCategory(issue.category)}
            </span>
            <span class="badge ${getStatusClass(issue.status)}" style="font-size:var(--font-sm);padding:var(--space-2) var(--space-4);">
              ${formatStatus(issue.status)}
            </span>
            ${priorityHtml}
            ${issue.categoryConfidence ? `
              <span class="badge badge-primary" style="font-size:var(--font-xs);">
                <i data-lucide="cpu" style="width:12px;height:12px;display:inline;"></i> AI: ${Math.round(issue.categoryConfidence * 100)}% confidence
              </span>
            ` : ''}
          </div>

          ${assignedHtml}

          <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-4);">
            Reported by <strong style="color:var(--text-secondary);">${escapeHtml(issue.userName || 'Anonymous')}</strong>
          </div>

          <p class="detail-description">${escapeHtml(issue.description)}</p>

          <!-- Actions -->
          <div class="detail-actions">
            <button class="upvote-btn ${voted ? 'upvoted' : ''}" id="detail-upvote" style="padding:var(--space-3) var(--space-5);font-size:var(--font-base);">
              <i data-lucide="arrow-big-up" class="upvote-icon" style="width:22px;height:22px;"></i>
              <span class="upvote-count">${issue.upvotes || 0}</span>
              <span style="color:var(--text-tertiary);font-weight:400;">upvotes</span>
            </button>

            <button class="btn btn-secondary" id="detail-share">
              <i data-lucide="share-2" style="width:16px;height:16px;"></i>
              Share
            </button>
          </div>
          
          <div id="comment-section-mount" style="margin-top:var(--space-8);"></div>
        </div>

        <!-- Sidebar -->
        <div class="detail-sidebar">
          <!-- Location Card -->
          <div class="detail-info-card">
            <h3><i data-lucide="map-pin" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i> Location</h3>
            <p style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-3);">
              ${escapeHtml(issue.location?.address || 'Unknown location')}
            </p>
            <div class="detail-map" id="detail-map-container"></div>
          </div>

          <!-- Info Card -->
          <div class="detail-info-card">
            <h3><i data-lucide="clock" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i> Timeline</h3>
            <div style="display:flex;flex-direction:column;gap:var(--space-3);">
              <div style="display:flex;align-items:center;gap:var(--space-3);">
                <div style="width:8px;height:8px;border-radius:50%;background:var(--primary-500);flex-shrink:0;"></div>
                <div>
                  <div style="font-size:var(--font-sm);font-weight:500;">Reported</div>
                  <div style="font-size:var(--font-xs);color:var(--text-tertiary);">${timeAgo(issue.createdAt)} · ${new Date(issue.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              ${issue.status === 'in_progress' || issue.status === 'resolved' ? `
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                  <div style="width:8px;height:8px;border-radius:50%;background:var(--amber-500);flex-shrink:0;"></div>
                  <div>
                    <div style="font-size:var(--font-sm);font-weight:500;">In Progress</div>
                    <div style="font-size:var(--font-xs);color:var(--text-tertiary);">Being addressed</div>
                  </div>
                </div>
              `: ''}
              ${issue.status === 'resolved' ? `
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                  <div style="width:8px;height:8px;border-radius:50%;background:var(--emerald-500);flex-shrink:0;"></div>
                  <div>
                    <div style="font-size:var(--font-sm);font-weight:500;">Resolved</div>
                    <div style="font-size:var(--font-xs);color:var(--text-tertiary);">Issue has been fixed</div>
                  </div>
                </div>
              `: ''}
            </div>
          </div>

          <!-- Status Update (only for author or official) -->
          ${canUpdate ? `
            <div class="detail-info-card">
              <h3><i data-lucide="settings" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i> Update Status</h3>
              <select class="input-field" id="detail-status-select" style="cursor:pointer;">
                <option value="reported" ${issue.status === 'reported' ? 'selected' : ''}>Reported</option>
                <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              </select>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons({ nodes: [container] });
  }

  // Event: Back button
  container.querySelector('#detail-back').addEventListener('click', onBack);

  // Event: Upvote
  const upvoteBtn = container.querySelector('#detail-upvote');
  upvoteBtn.addEventListener('click', () => {
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

      const icon = upvoteBtn.querySelector('.upvote-icon');
      icon.style.animation = 'none';
      requestAnimationFrame(() => {
        icon.style.animation = 'bounce-up 300ms ease';
      });
    }
  });

  // Event: Share
  container.querySelector('#detail-share').addEventListener('click', async () => {
    const shareData = {
      title: `CivicPulse: ${issue.category}`,
      text: issue.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${issue.description}\n\n${issue.location?.address || ''}`);
        showToast({ type: 'success', title: 'Copied', message: 'Issue details copied to clipboard.' });
      }
    } catch {
      // User cancelled share
    }
  });

  // Event: Status update
  const statusSelect = container.querySelector('#detail-status-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      updateIssueStatus(issue.id, e.target.value);
      showToast({ type: 'success', title: 'Status Updated', message: `Issue status changed to "${formatStatus(e.target.value)}".` });
    });
  }

  // Mount comment section
  const commentMount = container.querySelector('#comment-section-mount');
  if (commentMount) {
    const commentSection = createCommentSection(issue.id, onAuthRequired);
    commentMount.appendChild(commentSection);
  }

  // Initialize map after mount
  requestAnimationFrame(() => {
    setTimeout(() => initDetailMap(container, issue), 100);
  });

  return container;
}

function initDetailMap(container, issue) {
  const mapEl = container.querySelector('#detail-map-container');
  if (!mapEl || !window.L) return;

  try {
    const lat = issue.location?.lat || 40.7128;
    const lng = issue.location?.lng || -74.006;

    const map = L.map(mapEl, {
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#1B3A5C',
      color: '#4777A7',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(map);
  } catch (e) {
    console.warn('Map init failed:', e);
  }
}
