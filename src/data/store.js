/* ============================================
   CivicPulse — Data Store (localStorage)
   ============================================ */

const STORE_KEY = 'civicpulse_issues';
const UPVOTES_KEY = 'civicpulse_upvoted';
const listeners = new Set();

/**
 * Get all issues from localStorage
 */
export function getIssues() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save issues array to localStorage
 */
function saveIssues(issues) {
  localStorage.setItem(STORE_KEY, JSON.stringify(issues));
  notify();
}

/**
 * Get a single issue by ID
 */
export function getIssueById(id) {
  return getIssues().find(i => i.id === id) || null;
}

/**
 * Add a new issue
 */
export function addIssue(issue) {
  const issues = getIssues();
  const newIssue = {
    id: issue.id || crypto.randomUUID(),
    description: issue.description,
    imageUrl: issue.imageUrl || '',
    location: issue.location || { lat: 0, lng: 0, address: 'Unknown' },
    category: issue.category || 'Other',
    categoryConfidence: issue.categoryConfidence || 0,
    upvotes: 0,
    status: 'reported',
    createdAt: new Date().toISOString(),
  };
  issues.unshift(newIssue);
  saveIssues(issues);
  return newIssue;
}

/**
 * Upvote an issue. Returns false if already upvoted.
 */
export function upvoteIssue(id) {
  if (hasUpvoted(id)) return false;

  const issues = getIssues();
  const issue = issues.find(i => i.id === id);
  if (!issue) return false;

  issue.upvotes = (issue.upvotes || 0) + 1;
  saveIssues(issues);

  // Track upvoted issues
  const upvoted = getUpvotedIds();
  upvoted.push(id);
  localStorage.setItem(UPVOTES_KEY, JSON.stringify(upvoted));

  return true;
}

/**
 * Remove an upvote from an issue
 */
export function removeUpvote(id) {
  if (!hasUpvoted(id)) return false;

  const issues = getIssues();
  const issue = issues.find(i => i.id === id);
  if (!issue) return false;

  issue.upvotes = Math.max(0, (issue.upvotes || 0) - 1);
  saveIssues(issues);

  const upvoted = getUpvotedIds().filter(uid => uid !== id);
  localStorage.setItem(UPVOTES_KEY, JSON.stringify(upvoted));

  return true;
}

/**
 * Check if user has already upvoted an issue
 */
export function hasUpvoted(id) {
  return getUpvotedIds().includes(id);
}

/**
 * Get list of upvoted issue IDs
 */
function getUpvotedIds() {
  try {
    const raw = localStorage.getItem(UPVOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Update issue status
 */
export function updateIssueStatus(id, status) {
  const validStatuses = ['reported', 'in_progress', 'resolved'];
  if (!validStatuses.includes(status)) return false;

  const issues = getIssues();
  const issue = issues.find(i => i.id === id);
  if (!issue) return false;

  issue.status = status;
  saveIssues(issues);
  return true;
}

/**
 * Get stats
 */
export function getStats() {
  const issues = getIssues();
  return {
    total: issues.length,
    reported: issues.filter(i => i.status === 'reported').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    totalUpvotes: issues.reduce((sum, i) => sum + (i.upvotes || 0), 0),
  };
}

/**
 * Subscribe to store changes
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Notify all subscribers
 */
function notify() {
  listeners.forEach(fn => fn());
}

/**
 * Seed initial data if store is empty
 */
export function seedIfEmpty() {
  if (getIssues().length > 0) return;

  const seeds = [
    {
      id: 'seed-1',
      description: 'Large pothole on Main Street near the intersection with Oak Avenue. Multiple vehicles have been damaged. This has been here for over two weeks and is getting worse with each rain.',
      imageUrl: '',
      location: { lat: 40.7128, lng: -74.006, address: 'Main St & Oak Ave, Downtown' },
      category: 'Road Damage',
      categoryConfidence: 0.95,
      upvotes: 24,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'seed-2',
      description: 'Street light has been out for the past 5 days on Elm Street. The entire block is very dark at night, making it unsafe for pedestrians.',
      imageUrl: '',
      location: { lat: 40.7148, lng: -74.008, address: '245 Elm Street' },
      category: 'Street Lighting',
      categoryConfidence: 0.92,
      upvotes: 18,
      status: 'reported',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'seed-3',
      description: 'Overflowing dumpster behind the community center. Trash is spilling out onto the sidewalk and attracting rodents. Needs immediate attention.',
      imageUrl: '',
      location: { lat: 40.7108, lng: -74.004, address: 'Community Center, Park Blvd' },
      category: 'Waste Management',
      categoryConfidence: 0.88,
      upvotes: 31,
      status: 'reported',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'seed-4',
      description: 'Blocked storm drain causing flooding during rain on Riverside Drive. Water accumulates and covers the entire road, forcing cars to detour.',
      imageUrl: '',
      location: { lat: 40.7168, lng: -74.01, address: 'Riverside Drive & 5th' },
      category: 'Water & Drainage',
      categoryConfidence: 0.91,
      upvotes: 42,
      status: 'reported',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'seed-5',
      description: 'Broken playground equipment in Central Park. The swing set has a snapped chain and the slide has sharp metal edges exposed. Children are at risk.',
      imageUrl: '',
      location: { lat: 40.7138, lng: -74.002, address: 'Central Park Playground' },
      category: 'Parks & Green Spaces',
      categoryConfidence: 0.85,
      upvotes: 56,
      status: 'resolved',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'seed-6',
      description: 'Traffic signal at Broadway and 3rd Avenue is stuck on red in all directions during rush hour. Causing major traffic jams and near-accidents.',
      imageUrl: '',
      location: { lat: 40.7118, lng: -74.007, address: 'Broadway & 3rd Avenue' },
      category: 'Traffic & Signals',
      categoryConfidence: 0.93,
      upvotes: 37,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  localStorage.setItem(STORE_KEY, JSON.stringify(seeds));
}
