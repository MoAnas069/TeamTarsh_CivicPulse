/* ============================================
   CivicPulse — Analytics & Metrics
   Aggregation functions for dashboards
   ============================================ */

import { getIssues } from './store.js';
import { getDepartmentForCategory } from './departments.js';

export function extractWard(address) {
  if (!address) return 'Central Ward';
  
  const lower = address.toLowerCase();
  if (lower.includes('downtown')) return 'Downtown';
  if (lower.includes('riverside')) return 'Riverside';
  if (lower.includes('central')) return 'Central Ward';
  if (lower.includes('uptown')) return 'Uptown';
  if (lower.includes('westside')) return 'Westside';
  if (lower.includes('north')) return 'North District';
  if (lower.includes('south')) return 'South District';
  
  return 'Central Ward'; // Default fallback
}

export function getHoursDiff(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const ms = new Date(endStr) - new Date(startStr);
  return ms / (1000 * 60 * 60);
}

export function getAllWards() {
  const issues = getIssues();
  const wards = new Set();
  issues.forEach(i => wards.add(extractWard(i.location?.address)));
  return Array.from(wards).sort();
}

/**
 * Get core metrics for a specific ward (or citywide if wardName is null)
 */
export function getWardMetrics(wardName = null) {
  let issues = getIssues();
  if (wardName) {
    issues = issues.filter(i => extractWard(i.location?.address) === wardName);
  }

  const total = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved');
  const resolved = resolvedIssues.length;
  
  const resolutionRate = total === 0 ? 0 : (resolved / total) * 100;
  
  // Avg time in hours
  let totalHours = 0;
  let countWithTime = 0;
  resolvedIssues.forEach(i => {
    if (i.resolvedAt) {
      totalHours += getHoursDiff(i.createdAt, i.resolvedAt);
      countWithTime++;
    } else {
      // simulate 48 hours for legacy resolved issues without resolvedAt
      totalHours += 48;
      countWithTime++;
    }
  });
  
  const avgResolutionTime = countWithTime === 0 ? 0 : (totalHours / countWithTime);

  return {
    total,
    resolved,
    resolutionRate,
    avgResolutionTime // in hours
  };
}

/**
 * Get issue breakdown by department
 */
export function getDepartmentMetrics(wardName = null) {
  let issues = getIssues();
  if (wardName) {
    issues = issues.filter(i => extractWard(i.location?.address) === wardName);
  }

  const deptStats = {};
  
  issues.forEach(i => {
    const dept = getDepartmentForCategory(i.category);
    if (!deptStats[dept]) {
      deptStats[dept] = { total: 0, resolved: 0 };
    }
    deptStats[dept].total++;
    if (i.status === 'resolved') deptStats[dept].resolved++;
  });

  return Object.keys(deptStats).map(name => {
    const stats = deptStats[name];
    return {
      name,
      total: stats.total,
      resolved: stats.resolved,
      rate: stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0
    };
  }).sort((a, b) => b.total - a.total);
}

/**
 * Rank wards by efficiency
 */
export function getLeaderboard() {
  const wards = getAllWards();
  const board = wards.map(ward => {
    const metrics = getWardMetrics(ward);
    return {
      ward,
      ...metrics
    };
  });

  // Sort by resolution rate (desc), then total issues (desc)
  return board.sort((a, b) => {
    if (Math.abs(b.resolutionRate - a.resolutionRate) > 0.1) {
      return b.resolutionRate - a.resolutionRate;
    }
    return b.total - a.total;
  });
}
