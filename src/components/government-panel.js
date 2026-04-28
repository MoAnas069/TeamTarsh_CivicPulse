/* ============================================
   CivicPulse — Government Access Panel
   Government Portal Theme
   ============================================ */

import { getIssues, updateIssueStatus, assignIssue, subscribe } from '../data/store.js';
import { getCurrentUser } from '../data/auth.js';
import { getCategoryByName } from '../data/categories.js';
import { timeAgo, escapeHtml } from '../utils/helpers.js';

export function createGovernmentPanel(onBack, onNavigateToIssue) {
  const container = document.createElement('div');
  container.className = 'container profile-page animate-fade-in';
  const user = getCurrentUser();
  if (!user || user.role !== 'official') {
    container.innerHTML = '<div style="text-align:center;padding:100px;">Access Denied.</div>';
    return container;
  }

  function miniCard(issue, actions) {
    const cat = getCategoryByName(issue.category);
    let sev = '';
    if (issue.severityScore >= 80) sev = '<span class="badge badge-danger" style="font-size:10px;">CRITICAL</span>';
    else if (issue.severityScore >= 60) sev = '<span class="badge badge-warning" style="font-size:10px;">HIGH</span>';
    return `<div class="card" style="padding:var(--space-4);margin-bottom:var(--space-3);cursor:pointer;border-left:3px solid ${cat.color};" onclick="window.navToIssue('${issue.id}')">
      <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);"><div style="font-size:var(--font-xs);color:var(--text-tertiary);display:flex;align-items:center;gap:4px;"><i data-lucide="${cat.icon}" style="width:12px;height:12px;"></i> ${cat.name}</div>${sev}</div>
      <div style="font-weight:500;font-size:var(--font-sm);margin-bottom:var(--space-2);line-height:1.4;color:var(--text-primary);">${escapeHtml(issue.description.substring(0, 60))}...</div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:var(--font-xs);"><span style="color:var(--text-tertiary);"><i data-lucide="clock" style="width:12px;display:inline;"></i> ${timeAgo(issue.createdAt)}</span><div onclick="event.stopPropagation()">${actions}</div></div></div>`;
  }

  function render() {
    const all = getIssues();
    const unassigned = all.filter(i => !i.assignedTo && i.status !== 'resolved').sort((a, b) => b.severityScore - a.severityScore);
    const myQ = all.filter(i => i.assignedTo === user.id && i.status !== 'resolved').sort((a, b) => b.severityScore - a.severityScore);
    const resolved = all.filter(i => i.status === 'resolved' && i.assignedTo === user.id).slice(0, 5);

    container.innerHTML = `<div style="padding:var(--space-8) 0;">
      <button class="btn btn-ghost" id="gov-back" style="margin-bottom:var(--space-6);"><i data-lucide="arrow-left" style="width:18px;height:18px;"></i> Back to Feed</button>
      <div style="margin-bottom:var(--space-8);"><h2 style="font-size:var(--font-3xl);margin-bottom:var(--space-2);color:var(--primary-500);"><i data-lucide="shield" style="color:var(--teal-500);width:28px;height:28px;display:inline;vertical-align:middle;margin-right:8px;"></i>Government Access Panel</h2><p style="color:var(--text-secondary);">Welcome, ${user.name}. Manage community reports and triage assignments.</p></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--space-6);">
        <div style="background:var(--gray-50);padding:var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--border-color);"><h3 style="display:flex;justify-content:space-between;margin-bottom:var(--space-4);font-size:var(--font-lg);"><span><i data-lucide="inbox" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary-500);"></i> Triage Queue</span><span class="badge" style="background:var(--bg-surface);border:1px solid var(--border-color);">${unassigned.length}</span></h3><div style="max-height:600px;overflow-y:auto;">${unassigned.length === 0 ? '<div style="text-align:center;color:var(--text-tertiary);padding:var(--space-4);">All issues assigned!</div>' : unassigned.map(i => miniCard(i, `<button class="btn btn-primary btn-sm claim-btn" data-id="${i.id}">Claim</button>`)).join('')}</div></div>
        <div style="background:var(--primary-50);padding:var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--primary-200);"><h3 style="display:flex;justify-content:space-between;margin-bottom:var(--space-4);font-size:var(--font-lg);color:var(--primary-500);"><span><i data-lucide="briefcase" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:4px;"></i> My Workbench</span><span class="badge" style="background:var(--bg-surface);color:var(--primary-500);border:1px solid var(--primary-200);">${myQ.length}</span></h3><div style="max-height:600px;overflow-y:auto;">${myQ.length === 0 ? '<div style="text-align:center;color:var(--text-tertiary);padding:var(--space-4);">No active assignments.</div>' : myQ.map(i => miniCard(i, `<select class="input-field status-select" data-id="${i.id}" style="padding:4px 8px;font-size:12px;height:auto;"><option value="reported" ${i.status === 'reported' ? 'selected' : ''}>Reported</option><option value="in_progress" ${i.status === 'in_progress' ? 'selected' : ''}>In Progress</option><option value="resolved" ${i.status === 'resolved' ? 'selected' : ''}>Resolve</option></select>`)).join('')}</div></div>
        <div style="background:var(--gray-50);padding:var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--border-color);"><h3 style="display:flex;justify-content:space-between;margin-bottom:var(--space-4);font-size:var(--font-lg);"><span><i data-lucide="check-circle" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:4px;color:var(--emerald-600);"></i> Recently Resolved</span></h3><div style="max-height:600px;overflow-y:auto;">${resolved.length === 0 ? '<div style="text-align:center;color:var(--text-tertiary);padding:var(--space-4);">None yet.</div>' : resolved.map(i => miniCard(i, '<span style="color:var(--emerald-600);font-weight:600;">Resolved</span>')).join('')}</div></div>
      </div></div>`;

    window.navToIssue = (id) => onNavigateToIssue(id);
    if (window.lucide) window.lucide.createIcons({ nodes: [container] });
    container.querySelector('#gov-back')?.addEventListener('click', onBack);
    container.querySelectorAll('.claim-btn').forEach(btn => { btn.addEventListener('click', (e) => { assignIssue(e.target.dataset.id, user.id); render(); }); });
    container.querySelectorAll('.status-select').forEach(sel => { sel.addEventListener('change', (e) => { updateIssueStatus(e.target.dataset.id, e.target.value); render(); }); });
  }

  render();
  const unsub = subscribe(() => render());
  container.addEventListener('DOMNodeRemoved', (e) => { if (e.target === container) unsub(); });
  return container;
}
