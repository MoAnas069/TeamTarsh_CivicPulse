/* ============================================
   CivicPulse — Authentication Module
   localStorage-based auth with SHA-256 hashing
   ============================================ */

const USERS_KEY = 'civicpulse_users';
const SESSION_KEY = 'civicpulse_session';
const authListeners = new Set();

// ---- Avatar color palette ----
const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#3B82F6', '#14B8A6', '#F97316',
];

/**
 * Hash a password using SHA-256
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get all registered users
 */
function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save users array
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Generate a deterministic avatar color from a string
 */
function getAvatarColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Register a new user
 * Returns { success, user?, error? }
 */
export async function register(name, email, password, role = 'citizen') {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  // Validation
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Name must be at least 2 characters.' };
  }
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  // Validate role
  const validRoles = ['citizen', 'official'];
  const assignedRole = validRoles.includes(role) ? role : 'citizen';

  const users = getUsers();

  // Check if email already exists
  if (users.find(u => u.email === trimmedEmail)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    name: trimmedName,
    email: trimmedEmail,
    passwordHash,
    role: assignedRole,
    avatarColor: getAvatarColor(trimmedEmail),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  // Auto-login
  setSession(user);

  return { success: true, user: sanitizeUser(user) };
}

/**
 * Login with email and password
 * Returns { success, user?, error? }
 */
export async function login(email, password) {
  const trimmedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find(u => u.email === trimmedEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email.' };
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  setSession(user);
  return { success: true, user: sanitizeUser(user) };
}

/**
 * Logout the current user
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  notifyAuthChange();
}

/**
 * Get the currently logged-in user (or null)
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Verify the user still exists
    const users = getUsers();
    const user = users.find(u => u.id === session.userId);
    return user ? sanitizeUser(user) : null;
  } catch {
    return null;
  }
}

/**
 * Check if a user is logged in
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Get any user by ID (for displaying comments, etc.)
 */
export function getUserById(id) {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  return user ? sanitizeUser(user) : null;
}

/**
 * Update the current user's profile
 */
export function updateProfile(updates) {
  const current = getCurrentUser();
  if (!current) return false;

  const users = getUsers();
  const user = users.find(u => u.id === current.id);
  if (!user) return false;

  if (updates.name) user.name = updates.name.trim();
  saveUsers(users);
  setSession(user);
  return true;
}

/**
 * Set session in localStorage
 */
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId: user.id,
    loginAt: new Date().toISOString(),
  }));
  notifyAuthChange();
}

/**
 * Remove sensitive fields from user objects
 */
function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'citizen',
    avatarColor: user.avatarColor || getAvatarColor(user.email),
    createdAt: user.createdAt,
  };
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(fn) {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

/**
 * Notify subscribers of auth change
 */
function notifyAuthChange() {
  const user = getCurrentUser();
  authListeners.forEach(fn => fn(user));
}

/**
 * Seed a demo user if none exists
 */
export async function seedDemoUser() {
  const users = getUsers();
  let updated = false;

  // Seed citizen demo user
  if (!users.find(u => u.id === 'demo-user-1')) {
    const demoUser = {
      id: 'demo-user-1',
      name: 'Alex Rivera',
      email: 'alex@demo.com',
      passwordHash: await hashPassword('demo123'),
      role: 'citizen',
      avatarColor: '#6366F1',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    users.push(demoUser);
    updated = true;
  }

  // Seed or update official demo user
  const existingOfficial = users.find(u => u.id === 'official-1');
  if (existingOfficial) {
    // Update existing official to latest credentials and ensure role is set
    existingOfficial.name = 'Mayor Johnson';
    existingOfficial.email = 'mayor@cityhall.gov';
    existingOfficial.passwordHash = await hashPassword('gov2024');
    existingOfficial.role = 'official';
    updated = true;
  } else {
    const officialUser = {
      id: 'official-1',
      name: 'Mayor Johnson',
      email: 'mayor@cityhall.gov',
      passwordHash: await hashPassword('gov2024'),
      role: 'official',
      avatarColor: '#10B981',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    };
    users.push(officialUser);
    updated = true;
  }

  if (updated) {
    saveUsers(users);
  }
}
