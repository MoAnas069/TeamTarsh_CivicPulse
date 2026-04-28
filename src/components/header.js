/* ============================================
   CivicPulse — Header Component
   ============================================ */

import { getStats, subscribe } from '../data/store.js';

export function createHeader({ onReportClick }) {
  const header = document.createElement('header');
  header.className = 'header';
  header.id = 'app-header';

  function render() {
    const stats = getStats();
    header.innerHTML = `
      <div class="container header-inner">
        <a href="#" class="header-logo" id="header-logo">
          <div class="header-logo-icon">🏛️</div>
          <span>Civic<span class="text-gradient">Pulse</span></span>
        </a>

        <nav class="header-nav">
          <div class="header-badge">
            <i data-lucide="alert-circle" style="width:14px;height:14px;"></i>
            <span class="header-badge-count" id="header-issue-count">${stats.total}</span>
            <span>issues</span>
          </div>

          <button class="btn btn-primary btn-sm btn-glow" id="header-report-btn">
            <i data-lucide="plus" style="width:16px;height:16px;"></i>
            Report Issue
          </button>

          <button class="btn-icon btn-ghost mobile-menu-btn" id="mobile-menu-toggle" aria-label="Menu">
            <i data-lucide="menu" style="width:20px;height:20px;"></i>
          </button>
        </nav>
      </div>
    `;

    // Initialize lucide icons
    if (window.lucide) {
      window.lucide.createIcons({ nodes: [header] });
    }

    // Event listeners
    const reportBtn = header.querySelector('#header-report-btn');
    if (reportBtn) {
      reportBtn.addEventListener('click', onReportClick);
    }

    const logo = header.querySelector('#header-logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  render();

  // Subscribe to store changes to update the badge count
  subscribe(() => {
    const countEl = header.querySelector('#header-issue-count');
    if (countEl) {
      const stats = getStats();
      countEl.textContent = stats.total;
    }
  });

  return header;
}
