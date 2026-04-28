/* ============================================
   CivicPulse — Comments Module
   ============================================ */

import { getCurrentUser } from './auth.js';
import { getIssueById } from './store.js';
import { addNotification } from './notifications.js';

const COMMENTS_KEY = 'civicpulse_comments';

/**
 * Get all comments from localStorage
 */
function getAllComments() {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save comments
 */
function saveComments(comments) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

/**
 * Get comments for a specific issue, sorted newest first
 */
export function getComments(issueId) {
  return getAllComments()
    .filter(c => c.issueId === issueId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get comment count for an issue
 */
export function getCommentCount(issueId) {
  return getAllComments().filter(c => c.issueId === issueId).length;
}

/**
 * Add a comment to an issue
 * Returns the new comment or null if not logged in
 */
export function addComment(issueId, text) {
  const user = getCurrentUser();
  if (!user) return null;

  const trimmedText = text.trim();
  if (!trimmedText) return null;

  const comments = getAllComments();
  const newComment = {
    id: crypto.randomUUID(),
    issueId,
    userId: user.id,
    userName: user.name,
    userAvatarColor: user.avatarColor,
    text: trimmedText,
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  saveComments(comments);

  // Send notification to issue author (if different from commenter)
  const issue = getIssueById(issueId);
  if (issue && issue.userId && issue.userId !== user.id) {
    addNotification(
      issue.userId,
      `${user.name} commented on your report: "${trimmedText.substring(0, 50)}${trimmedText.length > 50 ? '...' : ''}"`,
      issueId
    );
  }

  return newComment;
}

/**
 * Delete a comment (only if authored by current user)
 */
export function deleteComment(commentId) {
  const user = getCurrentUser();
  if (!user) return false;

  const comments = getAllComments();
  const idx = comments.findIndex(c => c.id === commentId && c.userId === user.id);
  if (idx === -1) return false;

  comments.splice(idx, 1);
  saveComments(comments);
  return true;
}

/**
 * Seed demo comments
 */
export function seedComments() {
  if (getAllComments().length > 0) return;

  const seeds = [
    {
      id: 'comment-1',
      issueId: 'seed-1',
      userId: 'demo-user-1',
      userName: 'Alex Rivera',
      userAvatarColor: '#6366F1',
      text: 'I drive past this pothole every day. It got even worse after last week\'s rain. Someone is going to get seriously hurt.',
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-2',
      issueId: 'seed-3',
      userId: 'demo-user-1',
      userName: 'Alex Rivera',
      userAvatarColor: '#6366F1',
      text: 'The smell from this dumpster is unbearable. We need the sanitation department on this ASAP.',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-3',
      issueId: 'seed-4',
      userId: 'demo-user-1',
      userName: 'Alex Rivera',
      userAvatarColor: '#6366F1',
      text: 'Every time it rains, this entire street floods. The drain has been clogged for months now.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-4',
      issueId: 'seed-6',
      userId: 'demo-user-1',
      userName: 'Alex Rivera',
      userAvatarColor: '#6366F1',
      text: 'Good to see this is being addressed! The traffic was chaotic during rush hour.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ];

  saveComments(seeds);
}
