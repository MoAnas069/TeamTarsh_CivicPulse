/* ============================================
   CivicPulse — Map View Component
   Full-screen Leaflet map with issue markers
   ============================================ */

import { getIssues } from '../data/store.js';
import { getCategoryByName } from '../data/categories.js';
import { truncate, escapeHtml } from '../utils/helpers.js';

/**
 * Create the full map view
 * @param {function} onSelectIssue - callback when issue marker is clicked
 * @param {function} onBackToFeed - callback to return to feed view
 */
export function createMapView(onSelectIssue, onBackToFeed) {
  const container = document.createElement('div');
  container.className = 'map-view-container';
  container.id = 'map-view';

  container.innerHTML = `
    <div id="full-map" class="map-full"></div>
    <button class="btn btn-primary map-toggle-btn" id="map-back-btn" style="position:absolute;bottom:var(--space-6);left:50%;transform:translateX(-50%);z-index:500;">
      <i data-lucide="layout-grid" style="width:16px;height:16px;"></i>
      Back to Feed
    </button>
  `;

  if (window.lucide) {
    window.lucide.createIcons({ nodes: [container] });
  }

  container.querySelector('#map-back-btn').addEventListener('click', onBackToFeed);

  // Init map after mount
  requestAnimationFrame(() => {
    setTimeout(() => initFullMap(container, onSelectIssue), 100);
  });

  return container;
}

function initFullMap(container, onSelectIssue) {
  const mapEl = container.querySelector('#full-map');
  if (!mapEl || !window.L) return;

  try {
    const issues = getIssues();

    // Center on first issue or default
    const defaultCenter = issues.length > 0
      ? [issues[0].location?.lat || 40.7128, issues[0].location?.lng || -74.006]
      : [40.7128, -74.006];

    const map = L.map(mapEl).setView(defaultCenter, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    issues.forEach(issue => {
      if (!issue.location?.lat || !issue.location?.lng) return;

      const cat = getCategoryByName(issue.category);

      const marker = L.circleMarker([issue.location.lat, issue.location.lng], {
        radius: 10,
        fillColor: cat.color,
        color: cat.color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5,
      }).addTo(map);

      // Popup
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:200px;max-width:280px;">
          <div style="font-size:12px;font-weight:600;margin-bottom:4px;">
            ${cat.emoji} ${escapeHtml(cat.name)}
          </div>
          <p style="font-size:13px;color:#475569;line-height:1.4;margin:0 0 8px 0;">
            ${escapeHtml(truncate(issue.description, 100))}
          </p>
          <div style="font-size:11px;color:#94A3B8;">
            📍 ${escapeHtml(truncate(issue.location?.address || '', 50))}
          </div>
          <div style="font-size:11px;color:#94A3B8;margin-top:4px;">
            👍 ${issue.upvotes || 0} upvotes
          </div>
        </div>
      `, {
        className: 'civic-popup',
      });

      marker.on('click', () => {
        if (onSelectIssue) {
          // Open popup first, allow user to click through
          marker.openPopup();
        }
      });
    });

    // Fit bounds if multiple issues
    if (issues.length > 1) {
      const validIssues = issues.filter(i => i.location?.lat && i.location?.lng);
      if (validIssues.length > 1) {
        const bounds = L.latLngBounds(validIssues.map(i => [i.location.lat, i.location.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  } catch (e) {
    console.warn('Full map init error:', e);
  }
}
