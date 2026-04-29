/* ============================================
   CivicPulse — Analytics Dashboard Component
   Government Portal Theme
   ============================================ */

import { getAllWards, getWardMetrics, getDepartmentMetrics, getLeaderboard } from '../data/metrics.js';
import { getCurrentUser } from '../data/auth.js';

export function createAnalyticsDashboard(onBack) {
  const container = document.createElement('div');
  container.className = 'container analytics-dashboard animate-fade-in';
  container.id = 'analytics-dashboard';
  
  let currentWard = null; // null means 'Citywide'

  function render() {
    const user = getCurrentUser();
    if (!user || user.role !== 'official') {
      container.innerHTML = `
        <div style="padding:var(--space-12) 0;text-align:center;max-width:600px;margin:0 auto;">
          <button class="btn btn-ghost btn-sm" id="analytics-back-btn-unauth" style="margin-bottom:var(--space-8);">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Back to Feed
          </button>
          <div style="background:var(--primary-50);width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-6);border:2px solid var(--primary-200);">
            <i data-lucide="lock" style="width:36px;height:36px;color:var(--primary-500);"></i>
          </div>
          <h2 style="font-size:var(--font-3xl);margin-bottom:var(--space-4);color:var(--text-primary);">Government Pro Required</h2>
          <p style="color:var(--text-secondary);font-size:var(--font-lg);margin-bottom:var(--space-8);line-height:1.6;">
            The Analytics Hub is an enterprise tool built to help municipal officials triage issues, measure accountability, and generate reports.
          </p>
          <button class="btn btn-primary" style="font-size:var(--font-lg);padding:var(--space-3) var(--space-6);">
            Contact Sales
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ nodes: [container] });
      container.querySelector('#analytics-back-btn-unauth')?.addEventListener('click', () => {
        if (onBack) onBack();
      });
      return;
    }

    const wards = getAllWards();
    const metrics = getWardMetrics(currentWard);
    const deptStats = getDepartmentMetrics(currentWard);
    const leaderboard = getLeaderboard();
    
    // Header & Ward Selector
    let html = `
      <div style="padding:var(--space-8) 0;">
        <button class="btn btn-ghost btn-sm" id="analytics-back-btn" style="margin-bottom:var(--space-4);padding-left:0;">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Back to Feed
        </button>
        <div class="analytics-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-8);flex-wrap:wrap;gap:var(--space-4);">
          <div>
            <h2 style="font-size:var(--font-3xl);margin-bottom:var(--space-2);color:var(--primary-500);"><i data-lucide="bar-chart-2" style="width:28px;height:28px;display:inline;vertical-align:middle;color:var(--primary-500);margin-right:8px;"></i>Analytics Hub</h2>
            <p style="color:var(--text-secondary);">Tracking civic performance and accountability.</p>
          </div>
          <div>
            <div style="display:flex;gap:var(--space-3);align-items:center;">
              <select class="input-field" id="ward-selector" style="min-width:200px;cursor:pointer;background:var(--bg-surface);border:1px solid var(--border-color);padding:var(--space-2) var(--space-4);border-radius:var(--radius-md);color:var(--text-primary);">
                <option value="">Citywide Overview</option>
                ${wards.map(w => `<option value="${w}" ${currentWard === w ? 'selected' : ''}>${w}</option>`).join('')}
              </select>
              <button class="btn btn-secondary btn-sm" id="export-csv-btn">
                <i data-lucide="download" style="width:16px;height:16px;"></i> Export
              </button>
            </div>
          </div>
        </div>

        <!-- KPI Grid -->
        <div class="kpi-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:var(--space-4);margin-bottom:var(--space-8);">
          <div class="card kpi-card" style="padding:var(--space-6) var(--space-4);display:flex;flex-direction:column;gap:var(--space-2);text-align:center;">
            <i data-lucide="target" style="width:24px;height:24px;color:var(--emerald-600);margin:0 auto var(--space-2);"></i>
            <div style="font-size:var(--font-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;font-weight:600;">Resolution Rate</div>
            <div style="font-size:3rem;font-weight:700;color:var(--text-primary);line-height:1;">${Math.round(metrics.resolutionRate)}<span style="font-size:1.5rem;color:var(--text-secondary);">%</span></div>
            <div style="font-size:var(--font-xs);color:var(--text-secondary);margin-top:auto;">${metrics.resolved} of ${metrics.total} issues resolved</div>
          </div>
          <div class="card kpi-card" style="padding:var(--space-6) var(--space-4);display:flex;flex-direction:column;gap:var(--space-2);text-align:center;">
            <i data-lucide="clock" style="width:24px;height:24px;color:var(--amber-600);margin:0 auto var(--space-2);"></i>
            <div style="font-size:var(--font-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;font-weight:600;">Avg Resolution Time</div>
            <div style="font-size:3rem;font-weight:700;color:var(--text-primary);line-height:1;">
              ${metrics.avgResolutionTime > 24 ? Math.round(metrics.avgResolutionTime/24) : Math.round(metrics.avgResolutionTime)}<span style="font-size:1.5rem;color:var(--text-secondary);">${metrics.avgResolutionTime > 24 ? 'd' : 'h'}</span>
            </div>
            <div style="font-size:var(--font-xs);color:var(--text-secondary);margin-top:auto;">Average time to final fix</div>
          </div>
          <div class="card kpi-card" style="padding:var(--space-6) var(--space-4);display:flex;flex-direction:column;gap:var(--space-2);text-align:center;">
            <i data-lucide="activity" style="width:24px;height:24px;color:var(--primary-500);margin:0 auto var(--space-2);"></i>
            <div style="font-size:var(--font-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;font-weight:600;">Issue Density</div>
            <div style="font-size:3rem;font-weight:700;color:var(--text-primary);line-height:1;">${metrics.total}</div>
            <div style="font-size:var(--font-xs);color:var(--text-secondary);margin-top:auto;">Total reports filed</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-6);align-items:start;" class="analytics-split">
          
          <!-- Department Breakdown -->
          <div class="card">
            <div class="card-header" style="border-bottom:1px solid var(--border-color);padding:var(--space-4) var(--space-6);">
              <h3 style="margin:0;color:var(--text-primary);"><i data-lucide="building" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:8px;color:var(--primary-500);"></i> Department Performance</h3>
            </div>
            <div class="card-body" style="padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-5);">
              ${deptStats.length === 0 ? '<p style="color:var(--text-tertiary);text-align:center;">No data available.</p>' : ''}
              ${deptStats.map(d => `
                <div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);font-size:var(--font-sm);">
                    <span style="font-weight:500;color:var(--text-primary);">${d.name}</span>
                    <span style="color:var(--text-tertiary);font-size:var(--font-xs);">${d.resolved}/${d.total} (${Math.round(d.rate)}%)</span>
                  </div>
                  <div style="width:100%;height:8px;background:var(--gray-100);border-radius:999px;overflow:hidden;">
                    <div style="width:${d.rate}%;height:100%;background:linear-gradient(90deg, var(--primary-500), var(--teal-500));border-radius:999px;transition:width 1s ease;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="card">
            <div class="card-header" style="border-bottom:1px solid var(--border-color);padding:var(--space-4) var(--space-6);">
              <h3 style="margin:0;color:var(--text-primary);"><i data-lucide="award" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:8px;color:var(--amber-600);"></i> Accountability Leaderboard</h3>
            </div>
            <div class="card-body" style="padding:0;">
              <ul style="list-style:none;padding:0;margin:0;">
                ${leaderboard.length === 0 ? '<li style="padding:var(--space-6);color:var(--text-tertiary);text-align:center;">No data available.</li>' : ''}
                ${leaderboard.map((lb, idx) => {
                  let badgeStyle = '';
                  if (idx === 0) badgeStyle = 'background:var(--amber-50);color:var(--amber-600);border:1px solid rgba(245,158,11,0.3);';
                  else if (idx === 1) badgeStyle = 'background:var(--gray-100);color:var(--gray-600);border:1px solid var(--gray-300);';
                  else if (idx === 2) badgeStyle = 'background:#FDF2E9;color:#B45309;border:1px solid rgba(180,83,9,0.2);';
                  else badgeStyle = 'background:var(--gray-50);color:var(--text-tertiary);border:1px solid var(--border-color);';

                  return `
                    <li style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-3) var(--space-6);border-bottom:1px solid var(--border-color);transition:background 0.15s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='transparent'">
                      <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--font-xs);font-weight:700;${badgeStyle}">${idx + 1}</div>
                      <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${lb.ward}</div>
                        <div style="font-size:var(--font-xs);color:var(--text-tertiary);">${lb.total} total reports</div>
                      </div>
                      <div style="text-align:right;">
                        <div style="font-weight:700;color:var(--emerald-600);font-size:var(--font-lg);">${Math.round(lb.resolutionRate)}%</div>
                        <div style="font-size:var(--font-xs);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;">Resolved</div>
                      </div>
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          </div>

        </div>
      </div>
    `;

    container.innerHTML = html;

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [container] });
    }

    // Ward Selector Event
    container.querySelector('#ward-selector')?.addEventListener('change', (e) => {
      currentWard = e.target.value || null;
      render();
    });

    container.querySelector('#export-csv-btn')?.addEventListener('click', () => {
      alert('Downloaded: civicpulse_report.csv');
    });

    container.querySelector('#analytics-back-btn')?.addEventListener('click', () => {
      if (onBack) onBack();
    });
  }

  // Initial render
  render();

  return container;
}
