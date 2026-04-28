/* ============================================
   CivicPulse — Auth Modal Component
   Login / Register tabs
   ============================================ */

import { login, register } from '../data/auth.js';
import { escapeHtml } from '../utils/helpers.js';
import { showToast } from './toast.js';

/**
 * Open the authentication modal
 * @param {function} onSuccess - called after successful login/register
 * @param {'login'|'register'} initialTab
 */
export function openAuthModal(onSuccess, initialTab = 'login') {
  const modalRoot = document.getElementById('modal-root');
  let activeTab = initialTab;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'auth-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'auth-modal';
  modal.style.maxWidth = '440px';

  backdrop.appendChild(modal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', escHandler);

  function close() {
    backdrop.style.animation = 'fade-out 200ms ease-in forwards';
    modal.style.animation = 'slide-down 200ms ease-in forwards';
    setTimeout(() => {
      backdrop.remove();
      document.removeEventListener('keydown', escHandler);
    }, 200);
  }

  function render() {
    if (activeTab === 'login') {
      renderLogin();
    } else {
      renderRegister();
    }

    if (window.lucide) {
      window.lucide.createIcons({ nodes: [modal] });
    }
  }

  function renderLogin() {
    modal.innerHTML = `
      <div class="modal-header">
        <h2>👋 Welcome Back</h2>
        <button class="btn-icon btn-ghost" id="auth-close" aria-label="Close">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Sign In</button>
        <button class="auth-tab" data-tab="register">Create Account</button>
      </div>

      <div class="modal-body">
        <form id="login-form" class="auth-form">
          <div class="input-group">
            <label class="input-label">Email</label>
            <div class="input-with-icon">
              <i data-lucide="mail" style="width:16px;height:16px;color:var(--text-tertiary);position:absolute;left:12px;top:50%;transform:translateY(-50%);"></i>
              <input type="email" class="input-field" id="login-email" placeholder="you@example.com" required style="padding-left:36px;" />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Password</label>
            <div class="input-with-icon">
              <i data-lucide="lock" style="width:16px;height:16px;color:var(--text-tertiary);position:absolute;left:12px;top:50%;transform:translateY(-50%);"></i>
              <input type="password" class="input-field" id="login-password" placeholder="••••••••" required style="padding-left:36px;" />
            </div>
          </div>

          <div id="login-error" class="auth-error" style="display:none;"></div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:var(--space-2);">
            <i data-lucide="log-in" style="width:18px;height:18px;"></i>
            Sign In
          </button>
        </form>

        <div class="auth-footer">
          <span style="color:var(--text-tertiary);font-size:var(--font-sm);">Don't have an account?</span>
          <button class="btn btn-ghost btn-sm" id="switch-to-register" style="color:var(--primary-400);">Create one</button>
        </div>

        <div class="auth-demo-hint">
          <i data-lucide="info" style="width:14px;height:14px;flex-shrink:0;"></i>
          <span>Demo account: <strong>alex@demo.com</strong> / <strong>demo123</strong></span>
        </div>
      </div>
    `;

    modal.querySelector('#auth-close').addEventListener('click', close);

    // Tab switching
    modal.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        render();
      });
    });

    modal.querySelector('#switch-to-register').addEventListener('click', () => {
      activeTab = 'register';
      render();
    });

    // Login form
    modal.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = modal.querySelector('#login-email').value;
      const password = modal.querySelector('#login-password').value;
      const errorDiv = modal.querySelector('#login-error');

      const submitBtn = modal.querySelector('[type="submit"]');
      submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Signing in...';
      submitBtn.disabled = true;

      const result = await login(email, password);

      if (result.success) {
        close();
        showToast({ type: 'success', title: `Welcome back, ${result.user.name}!`, message: 'You are now signed in.' });
        if (onSuccess) onSuccess(result.user);
      } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
        submitBtn.innerHTML = '<i data-lucide="log-in" style="width:18px;height:18px;"></i> Sign In';
        submitBtn.disabled = false;
        if (window.lucide) window.lucide.createIcons({ nodes: [submitBtn] });
      }
    });

    setTimeout(() => modal.querySelector('#login-email')?.focus(), 100);
  }

  function renderRegister() {
    modal.innerHTML = `
      <div class="modal-header">
        <h2>🚀 Create Account</h2>
        <button class="btn-icon btn-ghost" id="auth-close" aria-label="Close">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab" data-tab="login">Sign In</button>
        <button class="auth-tab active" data-tab="register">Create Account</button>
      </div>

      <div class="modal-body">
        <form id="register-form" class="auth-form">
          <div class="input-group">
            <label class="input-label">Full Name</label>
            <div class="input-with-icon">
              <i data-lucide="user" style="width:16px;height:16px;color:var(--text-tertiary);position:absolute;left:12px;top:50%;transform:translateY(-50%);"></i>
              <input type="text" class="input-field" id="reg-name" placeholder="John Doe" required minlength="2" style="padding-left:36px;" />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Email</label>
            <div class="input-with-icon">
              <i data-lucide="mail" style="width:16px;height:16px;color:var(--text-tertiary);position:absolute;left:12px;top:50%;transform:translateY(-50%);"></i>
              <input type="email" class="input-field" id="reg-email" placeholder="you@example.com" required style="padding-left:36px;" />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Password</label>
            <div class="input-with-icon">
              <i data-lucide="lock" style="width:16px;height:16px;color:var(--text-tertiary);position:absolute;left:12px;top:50%;transform:translateY(-50%);"></i>
              <input type="password" class="input-field" id="reg-password" placeholder="Min. 6 characters" required minlength="6" style="padding-left:36px;" />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Confirm Password</label>
            <div class="input-with-icon">
              <i data-lucide="lock" style="width:16px;height:16px;color:var(--text-tertiary);position:absolute;left:12px;top:50%;transform:translateY(-50%);"></i>
              <input type="password" class="input-field" id="reg-confirm" placeholder="Re-enter password" required style="padding-left:36px;" />
            </div>
          </div>

          <div id="register-error" class="auth-error" style="display:none;"></div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:var(--space-2);">
            <i data-lucide="user-plus" style="width:18px;height:18px;"></i>
            Create Account
          </button>
        </form>

        <div class="auth-footer">
          <span style="color:var(--text-tertiary);font-size:var(--font-sm);">Already have an account?</span>
          <button class="btn btn-ghost btn-sm" id="switch-to-login" style="color:var(--primary-400);">Sign in</button>
        </div>
      </div>
    `;

    modal.querySelector('#auth-close').addEventListener('click', close);

    modal.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        render();
      });
    });

    modal.querySelector('#switch-to-login').addEventListener('click', () => {
      activeTab = 'login';
      render();
    });

    // Register form
    modal.querySelector('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = modal.querySelector('#reg-name').value;
      const email = modal.querySelector('#reg-email').value;
      const password = modal.querySelector('#reg-password').value;
      const confirm = modal.querySelector('#reg-confirm').value;
      const errorDiv = modal.querySelector('#register-error');

      if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.display = 'block';
        return;
      }

      const submitBtn = modal.querySelector('[type="submit"]');
      submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Creating account...';
      submitBtn.disabled = true;

      const result = await register(name, email, password);

      if (result.success) {
        close();
        showToast({ type: 'success', title: `Welcome, ${result.user.name}! 🎉`, message: 'Your account has been created.' });
        if (onSuccess) onSuccess(result.user);
      } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
        submitBtn.innerHTML = '<i data-lucide="user-plus" style="width:18px;height:18px;"></i> Create Account';
        submitBtn.disabled = false;
        if (window.lucide) window.lucide.createIcons({ nodes: [submitBtn] });
      }
    });

    setTimeout(() => modal.querySelector('#reg-name')?.focus(), 100);
  }

  render();
  modalRoot.appendChild(backdrop);
}
