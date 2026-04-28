/* ============================================
   CivicPulse — Main Application Entry
   ============================================ */

// Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/animations.css';

// Data
import { seedIfEmpty } from './data/store.js';

// Components
import { createHeader } from './components/header.js';
import { createHero, createStatsBar } from './components/hero.js';
import { createIssueFeed } from './components/issue-feed.js';
import { createIssueDetail } from './components/issue-detail.js';
import { openReportModal } from './components/report-modal.js';
import { createMapView } from './components/map-view.js';

// ---- Initialize ----
const app = document.getElementById('app');

// Seed demo data on first launch
seedIfEmpty();

// Current view state
let currentView = 'feed'; // 'feed' | 'detail' | 'map'
let currentIssueId = null;

// ---- Build App Shell ----
function renderApp() {
  app.innerHTML = '';

  // Header (always present)
  const header = createHeader({
    onReportClick: () => openReportModal(() => {
      // After successful submission, ensure feed is showing
      if (currentView !== 'feed') {
        navigateTo('feed');
      }
    }),
  });
  app.appendChild(header);

  // View-specific content
  switch (currentView) {
    case 'feed':
      renderFeedView();
      break;
    case 'detail':
      renderDetailView();
      break;
    case 'map':
      renderMapView();
      break;
  }

  // Re-init lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderFeedView() {
  // Hero
  const hero = createHero({
    onReportClick: () => openReportModal(() => {}),
    onBrowseClick: () => {
      const feed = document.getElementById('feed-section');
      if (feed) feed.scrollIntoView({ behavior: 'smooth' });
    },
  });
  app.appendChild(hero);

  // Stats
  const stats = createStatsBar();
  app.appendChild(stats);

  // Feed
  const feed = createIssueFeed({
    onSelectIssue: (id) => {
      currentIssueId = id;
      navigateTo('detail');
    },
    onViewToggle: (view) => {
      navigateTo(view);
    },
  });
  app.appendChild(feed);
}

function renderDetailView() {
  const detail = createIssueDetail(currentIssueId, () => {
    navigateTo('feed');
  });
  app.appendChild(detail);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderMapView() {
  const mapView = createMapView(
    (id) => {
      currentIssueId = id;
      navigateTo('detail');
    },
    () => navigateTo('feed'),
  );
  app.appendChild(mapView);
}

function navigateTo(view, issueId) {
  currentView = view;
  if (issueId) currentIssueId = issueId;
  renderApp();
}

// ---- Boot ----
renderApp();

// Add some polish — custom Leaflet popup styles
const style = document.createElement('style');
style.textContent = `
  .leaflet-popup-content-wrapper {
    background: #1E293B !important;
    color: #F8FAFC !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
    border: 1px solid rgba(148,163,184,0.1) !important;
  }
  .leaflet-popup-tip {
    background: #1E293B !important;
    border: 1px solid rgba(148,163,184,0.1) !important;
  }
  .leaflet-popup-content {
    margin: 12px 16px !important;
    color: #F8FAFC !important;
  }
  .leaflet-popup-content p {
    color: #94A3B8 !important;
  }
  .leaflet-popup-close-button {
    color: #94A3B8 !important;
  }
  .leaflet-popup-close-button:hover {
    color: #F8FAFC !important;
  }
  .leaflet-control-attribution {
    background: rgba(15,23,42,0.8) !important;
    color: #64748B !important;
    font-size: 10px !important;
  }
  .leaflet-control-attribution a {
    color: #818CF8 !important;
  }
`;
document.head.appendChild(style);

console.log('🏛️ CivicPulse initialized');
