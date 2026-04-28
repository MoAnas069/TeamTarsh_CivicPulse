/* ============================================
   CivicPulse — Toast Notification System
   ============================================ */

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-root');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-root';
      document.body.appendChild(toastContainer);
    }
    toastContainer.className = 'toast-container';
  }
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {object} options
 * @param {'success'|'error'|'info'} options.type
 * @param {string} options.title
 * @param {string} options.message
 * @param {number} options.duration - ms (default 4000)
 */
export function showToast({ type = 'info', title, message, duration = 4000 }) {
  const container = ensureContainer();

  const icons = {
    success: 'check-circle',
    error: 'alert-triangle',
    info: 'info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type]}" class="toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close">
      <i data-lucide="x" style="width:14px;height:14px;"></i>
    </button>
    <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
  `;

  container.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons({ nodes: [toast] });
  }

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => dismiss(toast));

  const timer = setTimeout(() => dismiss(toast), duration);

  toast.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'paused';
  });

  toast.addEventListener('mouseleave', () => {
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'running';
    setTimeout(() => dismiss(toast), 2000);
  });
}

function dismiss(toast) {
  toast.style.animation = 'slide-out-right 300ms ease-in forwards';
  setTimeout(() => toast.remove(), 300);
}
