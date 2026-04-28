/* ============================================
   CivicPulse — Issue Feed Component
   Government Portal Theme
   ============================================ */

import { getIssues, subscribe } from '../data/store.js';
import { CATEGORIES } from '../data/categories.js';
import { createIssueCard } from './issue-card.js';

/**
 * Create the issue feed section
 * @param {object} options
 * @param {function} options.onSelectIssue - Callback when an issue is selected
 * @param {function} options.onViewToggle - Callback to toggle map view
 */
export function createIssueFeed({ onSelectIssue, onViewToggle }) {
  const section = document.createElement('section');
  section.className = 'feed-section';
  section.id = 'feed-section';

  let currentSort = 'latest';
  let currentCategory = 'all';
  let currentStatus = 'all';

  function getFilteredIssues() {
    let issues = getIssues();

    // Filter by category
    if (currentCategory !== 'all') {
      issues = issues.filter(i => i.category === currentCategory);
    }

    // Filter by status
    if (currentStatus !== 'all') {
      issues = issues.filter(i => i.status === currentStatus);
    }

    // Sort
    if (currentSort === 'latest') {
      issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'upvoted') {
      issues.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    return issues;
  }

  function render() {
    const issues = getFilteredIssues();

    section.innerHTML = `
      <div class="container">
        <div class="feed-header">
          <h2 class="feed-title">
            <i data-lucide="list" style="width:24px;height:24px;display:inline;vertical-align:middle;margin-right:8px;"></i>
            Community Reports
          </h2>

          <div class="feed-controls">
            <div class="filter-tabs" id="sort-tabs">
              <button class="filter-tab ${currentSort === 'latest' ? 'active' : ''}" data-sort="latest">Latest</button>
              <button class="filter-tab ${currentSort === 'upvoted' ? 'active' : ''}" data-sort="upvoted">Most Upvoted</button>
            </div>

            <div class="view-toggle" id="view-toggle">
              <button class="view-toggle-btn active" id="view-list-btn" data-tooltip="List View" aria-label="List View">
                <i data-lucide="layout-grid" style="width:16px;height:16px;"></i>
              </button>
              <button class="view-toggle-btn" id="view-map-btn" data-tooltip="Map View" aria-label="Map View">
                <i data-lucide="map" style="width:16px;height:16px;"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Category Filters -->
        <div class="feed-categories">
          <div class="category-pills" id="category-pills">
            <button class="category-pill ${currentCategory === 'all' ? 'active' : ''}" data-category="all">
              <i data-lucide="tag" style="width:12px;height:12px;"></i> All
            </button>
            ${CATEGORIES.map(cat => `
              <button class="category-pill ${currentCategory === cat.name ? 'active' : ''}" data-category="${cat.name}">
                <i data-lucide="${cat.icon}" style="width:12px;height:12px;"></i> ${cat.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Status Filters -->
        <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-6);flex-wrap:wrap;">
          <button class="category-pill ${currentStatus === 'all' ? 'active' : ''}" data-status="all">All Status</button>
          <button class="category-pill ${currentStatus === 'reported' ? 'active' : ''}" data-status="reported" style="${currentStatus === 'reported' ? 'background:var(--red-50);color:var(--red-600);border-color:rgba(239,68,68,0.3);' : ''}">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--red-500);"></span> Reported
          </button>
          <button class="category-pill ${currentStatus === 'in_progress' ? 'active' : ''}" data-status="in_progress" style="${currentStatus === 'in_progress' ? 'background:var(--amber-50);color:var(--amber-600);border-color:rgba(245,158,11,0.3);' : ''}">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--amber-500);"></span> In Progress
          </button>
          <button class="category-pill ${currentStatus === 'resolved' ? 'active' : ''}" data-status="resolved" style="${currentStatus === 'resolved' ? 'background:var(--emerald-50);color:var(--emerald-600);border-color:rgba(16,185,129,0.3);' : ''}">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--emerald-500);"></span> Resolved
          </button>
        </div>

        <!-- Issue Grid -->
        <div class="feed-grid stagger-children" id="feed-grid">
          ${issues.length === 0 ? `
            <div class="empty-state" style="grid-column:1/-1;">
              <div class="empty-state-icon">
                <i data-lucide="search-x" style="width:28px;height:28px;"></i>
              </div>
              <h3>No issues found</h3>
              <p>Try adjusting your filters or be the first to report an issue in this category.</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Render issue cards
    const grid = section.querySelector('#feed-grid');
    if (issues.length > 0) {
      issues.forEach(issue => {
        const card = createIssueCard(issue, onSelectIssue);
        grid.appendChild(card);
      });
    }

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [section] });
    }

    // Event: Sort tabs
    section.querySelectorAll('#sort-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentSort = tab.dataset.sort;
        render();
      });
    });

    // Event: Category pills
    section.querySelectorAll('#category-pills .category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        currentCategory = pill.dataset.category;
        render();
      });
    });

    // Event: Status filters
    section.querySelectorAll('[data-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentStatus = btn.dataset.status;
        render();
      });
    });

    // Event: View toggle
    const mapBtn = section.querySelector('#view-map-btn');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => {
        if (onViewToggle) onViewToggle('map');
      });
    }
  }

  render();

  // Subscribe to store changes
  subscribe(() => render());

  return section;
}
