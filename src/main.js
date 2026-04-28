/* ============================================
   CivicPulse — Main Application Entry
   Government Portal Theme
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
import { openAuthModal } from './components/auth-modal.js';
import { createProfilePage } from './components/profile-page.js';
import { createAnalyticsDashboard } from './components/analytics-dashboard.js';
import { createGovernmentPanel } from './components/government-panel.js';

import { isLoggedIn, getCurrentUser, seedDemoUser } from './data/auth.js';
import { seedComments } from './data/comments.js';
import { seedNotifications } from './data/notifications.js';

// ---- Initialize ----
const app = document.getElementById('app');

// Boot sequence (async because seedDemoUser hashes passwords)
async function boot() {
  seedIfEmpty();
  await seedDemoUser();
  seedComments();
  seedNotifications();
  renderApp();
}

// Auth barrier wrapper
function requireAuth(action) {
  if (isLoggedIn()) {
    action();
  } else {
    openAuthModal(() => {
      renderApp(); // Re-render to update header
      action();
    });
  }
}

// Current view state
let currentView = 'feed'; // 'feed' | 'detail' | 'map'
let currentIssueId = null;

// ---- Build App Shell ----
function renderApp() {
  app.innerHTML = '';

  // Header (always present)
  const header = createHeader({
    onReportClick: () => requireAuth(() => {
      openReportModal(() => {
        if (currentView !== 'feed') {
          navigateTo('feed');
        }
      });
    }),
    onLoginClick: () => openAuthModal(() => renderApp()),
    onProfileClick: () => navigateTo('profile'),
    onGovPanelClick: () => navigateTo('gov-panel'),
    onAnalyticsClick: () => navigateTo('analytics'),
    onNavigateToIssue: (id) => navigateTo('detail', id),
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
    case 'profile':
      renderProfileView();
      break;
    case 'gov-panel':
      renderGovPanelView();
      break;
    case 'analytics':
      renderAnalyticsView();
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
    onReportClick: () => requireAuth(() => openReportModal(() => {})),
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
  const detail = createIssueDetail(
    currentIssueId,
    () => navigateTo('feed'),
    () => openAuthModal(() => renderApp())
  );
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

function renderProfileView() {
  const profile = createProfilePage(
    () => navigateTo('feed'),
    (id) => navigateTo('detail', id),
    () => navigateTo('feed')
  );
  app.appendChild(profile);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderGovPanelView() {
  const user = getCurrentUser();
  if (!user || user.role !== 'official') {
    navigateTo('feed');
    return;
  }
  const govPanel = createGovernmentPanel(
    () => navigateTo('feed'),
    (id) => navigateTo('detail', id)
  );
  app.appendChild(govPanel);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAnalyticsView() {
  const dashboard = createAnalyticsDashboard();
  app.appendChild(dashboard);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateTo(view, issueId) {
  currentView = view;
  if (issueId) currentIssueId = issueId;
  renderApp();
}

// ---- Boot ----
boot();

// Leaflet popup styles for light theme
const style = document.createElement('style');
style.textContent = `
  .leaflet-popup-content-wrapper {
    background: #FFFFFF !important;
    color: #1A1A2E !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
    border: 1px solid #D9DEE5 !important;
  }
  .leaflet-popup-tip {
    background: #FFFFFF !important;
    border: 1px solid #D9DEE5 !important;
  }
  .leaflet-popup-content {
    margin: 12px 16px !important;
    color: #1A1A2E !important;
  }
  .leaflet-popup-content p {
    color: #5A6474 !important;
  }
  .leaflet-popup-close-button {
    color: #8B95A5 !important;
  }
  .leaflet-popup-close-button:hover {
    color: #1A1A2E !important;
  }
  .leaflet-control-attribution {
    background: rgba(255,255,255,0.9) !important;
    color: #8B95A5 !important;
    font-size: 10px !important;
  }
  .leaflet-control-attribution a {
    color: #1B3A5C !important;
  }
`;
document.head.appendChild(style);

console.log('CivicPulse initialized');
