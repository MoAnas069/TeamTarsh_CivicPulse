/* ============================================
   CivicPulse — Hero Component
   ============================================ */

import { getStats, subscribe } from '../data/store.js';
import { animateCount } from '../utils/helpers.js';

export function createHero({ onReportClick, onBrowseClick }) {
  const section = document.createElement('section');
  section.className = 'hero';
  section.id = 'hero-section';

  function render() {
    const stats = getStats();

    section.innerHTML = `
      <div class="container hero-content">
        <h1 class="animate-slide-up">
          Your City. <span class="text-gradient">Your Voice.</span>
        </h1>
        <p class="hero-subtitle animate-slide-up" style="animation-delay: 100ms">
          Report civic issues, track their resolution, and help build a better community. 
          Every report makes a difference.
        </p>
        <div class="hero-actions animate-slide-up" style="animation-delay: 200ms">
          <button class="btn btn-primary btn-lg btn-glow" id="hero-report-btn">
            <i data-lucide="camera" style="width:20px;height:20px;"></i>
            Report an Issue
          </button>
          <button class="btn btn-secondary btn-lg" id="hero-browse-btn">
            <i data-lucide="search" style="width:20px;height:20px;"></i>
            Browse Issues
          </button>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [section] });
    }

    section.querySelector('#hero-report-btn')?.addEventListener('click', onReportClick);
    section.querySelector('#hero-browse-btn')?.addEventListener('click', onBrowseClick);
  }

  render();
  return section;
}

export function createStatsBar() {
  const container = document.createElement('section');
  container.className = 'container';
  container.id = 'stats-section';

  function render() {
    const stats = getStats();

    container.innerHTML = `
      <div class="stats-bar stagger-children">
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.total}" id="stat-total">0</div>
          <div class="stat-label">Total Reports</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.reported}" id="stat-active" style="color: var(--red-400);">0</div>
          <div class="stat-label">Active Issues</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.inProgress}" id="stat-progress" style="color: var(--amber-400);">0</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.resolved}" id="stat-resolved" style="color: var(--emerald-400);">0</div>
          <div class="stat-label">Resolved</div>
        </div>
      </div>
    `;

    // Animate counts after a short delay
    setTimeout(() => {
      container.querySelectorAll('.stat-value').forEach(el => {
        const target = parseInt(el.dataset.target) || 0;
        animateCount(el, target, 800);
      });
    }, 300);
  }

  render();

  // Subscribe to updates
  subscribe(() => {
    const stats = getStats();
    const elements = {
      'stat-total': stats.total,
      'stat-active': stats.reported,
      'stat-progress': stats.inProgress,
      'stat-resolved': stats.resolved,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = container.querySelector(`#${id}`);
      if (el) {
        el.dataset.target = value;
        animateCount(el, value, 400);
      }
    });
  });

  return container;
}
