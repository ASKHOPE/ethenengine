import { escapeHtml } from '../foundation/Sanitizer.js';

export function renderLoginView(tenantSlug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login — ETHENENGINE Enterprise Platform</title>
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/animations.css" />
  <style>
    :root {
      --bg-gradient: radial-gradient(circle at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%);
      --card-bg: rgba(15, 23, 42, 0.75);
      --card-border: rgba(255, 255, 255, 0.1);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --input-bg: rgba(2, 6, 23, 0.6);
      --input-border: rgba(255, 255, 255, 0.1);
      --input-color: #ffffff;
      --sso-bg: rgba(255, 255, 255, 0.05);
      --sso-border: rgba(255, 255, 255, 0.15);
      --sso-color: #e2e8f0;
      --toggle-bg: rgba(15, 23, 42, 0.6);
      --toggle-border: rgba(255, 255, 255, 0.15);
    }

    [data-theme="day"] {
      --bg-gradient: radial-gradient(circle at top left, #e0e7ff 0%, #f1f5f9 50%, #e2e8f0 100%);
      --card-bg: rgba(255, 255, 255, 0.9);
      --card-border: rgba(0, 0, 0, 0.08);
      --text-main: #0f172a;
      --text-muted: #64748b;
      --input-bg: #f8fafc;
      --input-border: #cbd5e1;
      --input-color: #0f172a;
      --sso-bg: #ffffff;
      --sso-border: #cbd5e1;
      --sso-color: #334155;
      --toggle-bg: rgba(255, 255, 255, 0.8);
      --toggle-border: #cbd5e1;
    }

    body {
      margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--bg-gradient);
      font-family: system-ui, -apple-system, sans-serif; color: var(--text-main);
      transition: background 0.3s, color 0.3s;
      position: relative;
    }
    .login-card {
      width: 100%; max-width: 440px; padding: 2.5rem; background: var(--card-bg);
      backdrop-filter: blur(16px); border: 1px solid var(--card-border); border-radius: 1.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .brand-header { text-align: center; margin-bottom: 2rem; }
    .brand-logo {
      width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.5rem; color: white; margin: 0 auto 1rem;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }
    .input-group { margin-bottom: 1.25rem; }
    .input-group label { display: block; font-size: 0.85rem; font-weight: 500; color: var(--text-muted); margin-bottom: 0.5rem; }
    .input-control {
      width: 100%; padding: 0.75rem 1rem; background: var(--input-bg);
      border: 1px solid var(--input-border); border-radius: 0.5rem; color: var(--input-color);
      font-size: 0.95rem; box-sizing: border-box; transition: all 0.2s;
    }
    .input-control:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
    .btn-submit {
      width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #6366f1, #4f46e5);
      border: none; border-radius: 0.5rem; color: white; font-weight: 600; font-size: 1rem;
      cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); transition: transform 0.1s, box-shadow 0.2s;
    }
    .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4); }
    .sso-divider { display: flex; align-items: center; margin: 1.5rem 0; color: var(--text-muted); font-size: 0.8rem; }
    .sso-divider::before, .sso-divider::after { content: ''; flex: 1; height: 1px; background: var(--input-border); }
    .sso-divider span { padding: 0 0.75rem; }
    .btn-keycloak {
      width: 100%; padding: 0.85rem; background: var(--sso-bg);
      border: 1px solid var(--sso-border); border-radius: 0.5rem; color: var(--sso-color);
      font-weight: 600; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 0.75rem; transition: background 0.2s; text-decoration: none; box-sizing: border-box;
    }
    .btn-keycloak:hover { opacity: 0.9; }
    .alert-msg { padding: 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; margin-bottom: 1.25rem; display: none; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }
    .alert-success { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #86efac; }
    .theme-corner-btn {
      position: absolute; top: 20px; right: 20px;
      background: var(--toggle-bg); border: 1px solid var(--toggle-border);
      color: var(--text-main); font-weight: 700; font-size: 0.8rem;
      padding: 0.5rem 0.9rem; border-radius: 8px; cursor: pointer;
      backdrop-filter: blur(8px);
    }
  </style>
</head>
<body>
  <button id="themeToggleBtn" onclick="toggleTheme()" class="theme-corner-btn">☀️ Day Mode</button>

  <div class="login-card animate-fade-in">
    <div class="brand-header">
      <div class="brand-logo">E</div>
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-main);">ETHENENGINE</h2>
      <p style="margin: 0.4rem 0 0; color: var(--text-muted); font-size: 0.85rem;">Enterprise Multi-Tenant Platform</p>
    </div>

    <div id="alertBox" class="alert-msg"></div>

    <form id="loginForm" onsubmit="handleLogin(event)">
      <div class="input-group">
        <label>Email Address</label>
        <input type="email" id="email" class="input-control" placeholder="john.doe@enterprise.com" required value="admin@lioramedia.com" />
      </div>

      <div class="input-group">
        <label>Password</label>
        <input type="password" id="password" class="input-control" placeholder="••••••••" required value="Password123!" />
      </div>

      <button type="submit" class="btn-submit">Sign In to Workspace</button>
    </form>

    <div class="sso-divider">
      <span>OR CONTINUE WITH</span>
    </div>

    <a href="/api/auth/oauth/keycloak/authorize?tenant=${escapeHtml(tenantSlug)}" class="btn-keycloak">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      Keycloak Enterprise SSO
    </a>
  </div>

  <script>
    function toggleTheme() {
      const isDay = document.documentElement.getAttribute('data-theme') === 'day';
      const target = isDay ? 'night' : 'day';
      if (target === 'day') {
        document.documentElement.setAttribute('data-theme', 'day');
        localStorage.setItem('login_theme', 'day');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('login_theme', 'night');
      }
      updateBtn();
    }
    function updateBtn() {
      const isDay = document.documentElement.getAttribute('data-theme') === 'day';
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = isDay ? '🌙 Night Mode' : '☀️ Day Mode';
    }
    (function() {
      if (localStorage.getItem('login_theme') === 'day') {
        document.documentElement.setAttribute('data-theme', 'day');
      }
      updateBtn();
    })();

    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const alertBox = document.getElementById('alertBox');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, tenantSlug: '${escapeHtml(tenantSlug)}' })
        });

        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem('auth_token', data.token);
          document.cookie = 'auth_token=' + data.token + '; path=/; SameSite=Lax';
          alertBox.className = 'alert-msg alert-success';
          alertBox.style.display = 'block';
          alertBox.innerText = 'Authentication successful! Redirecting...';
          setTimeout(() => { window.location.href = '/admin?tenant=${escapeHtml(tenantSlug)}'; }, 1000);
        } else {
          alertBox.className = 'alert-msg alert-error';
          alertBox.style.display = 'block';
          alertBox.innerText = data.error || 'Authentication failed';
        }
      } catch (err) {
        alertBox.className = 'alert-msg alert-error';
        alertBox.style.display = 'block';
        alertBox.innerText = 'Network error during login.';
      }
    }
  </script>
</body>
</html>`;
}
