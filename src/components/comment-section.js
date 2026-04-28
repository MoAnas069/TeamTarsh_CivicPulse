/* ============================================
   CivicPulse — Comment Section Component
   ============================================ */

import { getComments, addComment, deleteComment, getCommentCount } from '../data/comments.js';
import { getCurrentUser, getInitials } from '../data/auth.js';
import { timeAgo, escapeHtml } from '../utils/helpers.js';
import { showToast } from './toast.js';

/**
 * Create the comment section for an issue detail view
 * @param {string} issueId
 * @param {function} onAuthRequired - called when user needs to login
 */
export function createCommentSection(issueId, onAuthRequired) {
  const section = document.createElement('div');
  section.className = 'comment-section';
  section.id = 'comment-section';

  function render() {
    const user = getCurrentUser();
    const comments = getComments(issueId);
    const count = comments.length;

    section.innerHTML = `
      <div class="comment-header">
        <h3>
          <i data-lucide="message-circle" style="width:18px;height:18px;display:inline;vertical-align:middle;margin-right:6px;"></i>
          Discussion
          <span class="comment-count-badge">${count}</span>
        </h3>
      </div>

      <!-- Comment Input -->
      ${user ? `
        <div class="comment-input-area">
          <div class="comment-avatar" style="background:${user.avatarColor};">
            ${getInitials(user.name)}
          </div>
          <div class="comment-input-wrapper">
            <textarea class="input-field comment-textarea" id="comment-input" placeholder="Share your thoughts on this issue..." rows="2"></textarea>
            <button class="btn btn-primary btn-sm" id="comment-submit" disabled style="opacity:0.5;">
              <i data-lucide="send" style="width:14px;height:14px;"></i>
              Post
            </button>
          </div>
        </div>
      ` : `
        <div class="comment-login-prompt">
          <i data-lucide="log-in" style="width:16px;height:16px;"></i>
          <span><a href="#" id="comment-login-link">Sign in</a> to join the discussion</span>
        </div>
      `}

      <!-- Comment List -->
      <div class="comment-list" id="comment-list">
        ${comments.length === 0 ? `
          <div class="comment-empty">
            <i data-lucide="message-square" style="width:24px;height:24px;color:var(--text-tertiary);opacity:0.5;"></i>
            <p>No comments yet — be the first to share your thoughts.</p>
          </div>
        ` : comments.map(c => renderComment(c, user)).join('')}
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [section] });
    }

    // Events: Comment input
    if (user) {
      const input = section.querySelector('#comment-input');
      const submitBtn = section.querySelector('#comment-submit');

      input.addEventListener('input', () => {
        const hasText = input.value.trim().length > 0;
        submitBtn.disabled = !hasText;
        submitBtn.style.opacity = hasText ? '1' : '0.5';
      });

      submitBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;

        const comment = addComment(issueId, text);
        if (comment) {
          input.value = '';
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
          render(); // Re-render to show new comment
        }
      });

      // Submit on Ctrl+Enter
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          submitBtn.click();
        }
      });
    } else {
      const loginLink = section.querySelector('#comment-login-link');
      if (loginLink) {
        loginLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (onAuthRequired) onAuthRequired();
        });
      }
    }

    // Events: Delete buttons
    section.querySelectorAll('.comment-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.commentId;
        if (deleteComment(commentId)) {
          showToast({ type: 'info', title: 'Comment Deleted', message: 'Your comment has been removed.' });
          render();
        }
      });
    });
  }

  function renderComment(comment, currentUser) {
    const isOwn = currentUser && currentUser.id === comment.userId;
    const initials = getInitials(comment.userName);

    return `
      <div class="comment-item animate-slide-up">
        <div class="comment-avatar" style="background:${comment.userAvatarColor || 'var(--primary-500)'};">
          ${initials}
        </div>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-author">${escapeHtml(comment.userName)}</span>
            <span class="comment-time">${timeAgo(comment.createdAt)}</span>
            ${isOwn ? `
              <button class="comment-delete-btn" data-comment-id="${comment.id}" title="Delete comment">
                <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
              </button>
            ` : ''}
          </div>
          <p class="comment-text">${escapeHtml(comment.text)}</p>
        </div>
      </div>
    `;
  }

  render();
  return section;
}
