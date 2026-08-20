import { escapeHtml } from '../foundation/Sanitizer.js';

export interface PreviewViewOptions {
  page: any;
  tenant: any;
  cssVariables: string;
  renderedContent: string;
  isRoot?: boolean;
}

export function renderPreviewView(options: PreviewViewOptions): string {
  const { page, tenant, cssVariables, renderedContent, isRoot } = options;

  const cartWidgetHtml = `
    <!-- FLOATING SHOPPING BAG TRIGGER -->
    <div id="cartFloatingTrigger" class="floating-cart-trigger" onclick="toggleStoreCart()" style="position:fixed; bottom:2rem; right:2rem; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,var(--color-primary,#6366f1),var(--color-secondary,#a855f7)); display:grid; place-content:center; color:#fff; font-size:1.4rem; cursor:pointer; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:9998;">
      🛍️
      <span id="cartCountBadge" style="position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:0.7rem; font-weight:800; border-radius:10px; padding:2px 6px; border:2px solid #0b0f19; display:none;">0</span>
    </div>

    <!-- BACKDROP & SLIDE-OVER CART DRAWER -->
    <div id="cartDrawerBackdrop" class="cart-drawer-backdrop" onclick="toggleStoreCart()"></div>
    <div id="cartDrawer" class="cart-drawer">
      <div style="padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.2rem;">🛍️</span>
          <h3 style="font-size:1.05rem; font-weight:800; color:#fff; margin:0;">Shopping Cart</h3>
          <span id="cartDrawerCount" style="font-size:0.75rem; color:#94a3b8; font-weight:600;">(0 items)</span>
        </div>
        <button onclick="toggleStoreCart()" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;">✕</button>
      </div>

      <div id="cartDrawerItems" style="flex:1; overflow-y:auto; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
        <div style="color:#64748b; font-size:0.85rem; text-align:center; padding:3rem 0;">Your cart is currently empty.</div>
      </div>

      <div style="padding:1.25rem 1.5rem; border-top:1px solid rgba(255,255,255,0.08); background:#070a14;">
        <div style="margin-bottom:0.75rem;">
          <div style="display:flex; gap:0.4rem;">
            <input id="cartPromoInput" placeholder="Promo Code (e.g. BLACKFRIDAY20)" style="flex:1; background:#101524; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:0.45rem 0.75rem; color:#fff; font-size:0.8rem; outline:none;" />
            <button onclick="applyCartPromo()" class="btn btn-secondary" style="padding:0.45rem 0.75rem; font-size:0.75rem; font-weight:700;">Apply</button>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#94a3b8; margin-bottom:0.4rem;">
          <span>Subtotal</span>
          <span id="cartSubtotalVal" style="color:#fff; font-weight:700;">$0</span>
        </div>

        <div id="cartDiscountRow" style="display:none; justify-content:space-between; align-items:center; font-size:0.85rem; color:#34d399; margin-bottom:0.4rem;">
          <span>Discount (Promo)</span>
          <span id="cartDiscountVal" style="font-weight:700;">-$0</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.1rem; color:#fff; font-weight:900; margin-bottom:1rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.6rem;">
          <span>Total</span>
          <span id="cartTotalVal" style="color:#34d399;">$0</span>
        </div>

        <button onclick="checkoutCart()" class="btn" style="width:100%; padding:0.75rem; font-weight:800; font-size:0.95rem; background:linear-gradient(135deg,var(--color-primary,#6366f1),var(--color-secondary,#a855f7));">
          Instant Checkout ↗
        </button>
      </div>
    </div>

    <script>
      let storeCart = { items: [], promoCode: '' };

      function toggleStoreCart() {
        const drawer = document.getElementById('cartDrawer');
        const backdrop = document.getElementById('cartDrawerBackdrop');
        if (drawer && backdrop) {
          drawer.classList.toggle('open');
          backdrop.classList.toggle('open');
        }
      }

      window.addToStoreCart = function(productName, price) {
        const existing = storeCart.items.find(i => i.name === productName);
        if (existing) {
          existing.quantity += 1;
        } else {
          storeCart.items.push({ id: 'item_' + Date.now(), name: productName, price: Number(price) || 49, quantity: 1 });
        }
        renderStoreCart();
        toggleStoreCart();
      };

      function updateCartQty(idx, delta) {
        if (!storeCart.items[idx]) return;
        storeCart.items[idx].quantity += delta;
        if (storeCart.items[idx].quantity <= 0) {
          storeCart.items.splice(idx, 1);
        }
        renderStoreCart();
      }

      function applyCartPromo() {
        const input = document.getElementById('cartPromoInput');
        storeCart.promoCode = (input?.value || '').trim();
        renderStoreCart();
      }

      function renderStoreCart() {
        const count = storeCart.items.reduce((s, i) => s + i.quantity, 0);
        const subtotal = storeCart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        let discount = 0;

        const promo = storeCart.promoCode.toUpperCase();
        if (promo === 'BLACKFRIDAY20' || promo === 'SALE20') discount = Math.round(subtotal * 0.2);
        else if (promo === 'SPECIAL10') discount = Math.round(subtotal * 0.1);

        const total = Math.max(0, subtotal - discount);

        const badge = document.getElementById('cartCountBadge');
        if (badge) {
          badge.style.display = count > 0 ? 'inline-block' : 'none';
          badge.innerText = count;
        }

        const drawerCount = document.getElementById('cartDrawerCount');
        if (drawerCount) drawerCount.innerText = count + (count === 1 ? ' item' : ' items');

        const itemsContainer = document.getElementById('cartDrawerItems');
        if (itemsContainer) {
          if (storeCart.items.length === 0) {
            itemsContainer.innerHTML = '<div style="color:#64748b; font-size:0.85rem; text-align:center; padding:3rem 0;">Your cart is currently empty.</div>';
          } else {
            itemsContainer.innerHTML = storeCart.items.map((item, idx) => \`
              <div style="background:#101524; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:0.88rem; color:#fff;">\${item.name}</div>
                  <div style="font-size:0.78rem; color:#34d399; font-weight:700; margin-top:2px;">$\${item.price}</div>
                </div>
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <button onclick="updateCartQty(\${idx}, -1)" class="btn btn-secondary" style="width:24px; height:24px; padding:0; display:grid; place-content:center; font-size:0.75rem;">-</button>
                  <span style="font-size:0.85rem; font-weight:700; color:#fff; min-width:18px; text-align:center;">\${item.quantity}</span>
                  <button onclick="updateCartQty(\${idx}, 1)" class="btn btn-secondary" style="width:24px; height:24px; padding:0; display:grid; place-content:center; font-size:0.75rem;">+</button>
                </div>
              </div>
            \`).join('');
          }
        }

        const subEl = document.getElementById('cartSubtotalVal');
        if (subEl) subEl.innerText = '$' + subtotal;

        const discRow = document.getElementById('cartDiscountRow');
        const discVal = document.getElementById('cartDiscountVal');
        if (discRow && discVal) {
          if (discount > 0) {
            discRow.style.display = 'flex';
            discVal.innerText = '-$' + discount + ' (' + promo + ')';
          } else {
            discRow.style.display = 'none';
          }
        }

        const totEl = document.getElementById('cartTotalVal');
        if (totEl) totEl.innerText = '$' + total;
      }

      async function checkoutCart() {
        if (storeCart.items.length === 0) {
          alert('Your cart is empty.');
          return;
        }
        alert('🎉 Order simulated and confirmed! Receipt generated for $' + document.getElementById('cartTotalVal')?.innerText.replace('$', ''));
        
        // Track analytics conversion
        fetch('/api/analytics/conversion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageSlug: ${JSON.stringify(page?.slug || 'home')}, goalType: 'cart_checkout', value: Number(document.getElementById('cartTotalVal')?.innerText.replace('$', '') || 49) })
        }).catch(() => {});

        storeCart.items = [];
        storeCart.promoCode = '';
        renderStoreCart();
        toggleStoreCart();
      }

      window.handleFormSubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerText : 'Submit';
        if (submitBtn) {
          submitBtn.innerText = 'Submitting...';
          submitBtn.disabled = true;
        }

        const formData = new FormData(form);
        const payload = {
          contactName: formData.get('contactName'),
          email: formData.get('email'),
          company: formData.get('company') || '',
          dealValue: Number(formData.get('dealValue') || 25000),
          notes: formData.get('notes') || '',
          pageSlug: ${JSON.stringify(page?.slug || 'home')}
        };

        try {
          const res = await fetch('/api/forms/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok) {
            alert('🎉 Thank you! Your inquiry has been received and logged in the enterprise CRM.');
            form.reset();
          } else {
            alert('Submission error: ' + (data.error || 'Failed to submit'));
          }
        } catch (err) {
          alert('Network error while submitting form.');
        } finally {
          if (submitBtn) {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
          }
        }
      };

      // Auto-track telemetry pageview
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug: ${JSON.stringify(page?.slug || 'home')}, variantId: 'A', referrer: document.referrer || '' })
      }).catch(() => {});
    </script>
  `;

  if (isRoot) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tenant.name)} — Enterprise Multi-Tenant Platform</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/blocks.css">
  <link rel="stylesheet" href="/animations.css">
  <style>
    ${cssVariables}
    html, body { background-color: var(--color-bg, #030712); color: var(--color-text, #f9fafb); margin: 0; min-height: 100vh; overflow-y: auto; overflow-x: hidden; font-family: var(--font-family, system-ui); }
    .navbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2.5rem; max-width: 1200px; margin: 0 auto; }
    .nav-logo { font-size: 1.3rem; font-weight: 800; color: var(--color-primary, #6366f1); text-decoration: none; display: flex; align-items: center; gap: 0.6rem; }
    .nav-links { display: flex; align-items: center; gap: 1.5rem; }
    .nav-link { color: #9ca3af; text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
    .nav-link:hover { color: #ffffff; }
    .btn-login { background: linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #4f46e5)); color: white; padding: 0.6rem 1.4rem; border-radius: var(--border-radius, 8px); font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px var(--color-primary, #6366f1)40; }
  </style>
</head>
<body>
  <nav class="navbar">
    <a href="/" class="nav-logo">
      <div style="background:linear-gradient(135deg, var(--color-primary, #6366f1), var(--color-secondary, #a855f7)); width:32px; height:32px; border-radius:var(--border-radius, 8px); display:grid; place-content:center; color:#fff; font-weight:900;">E</div>
      ${escapeHtml(tenant.name)}
    </a>
    <div class="nav-links">
      <a href="/admin?tenant=${escapeHtml(tenant.slug)}" class="nav-link">Admin Console</a>
      <a href="/editor?tenant=${escapeHtml(tenant.slug)}" class="nav-link">🎨 Studio Builder</a>
      <a href="/docs" target="_blank" class="nav-link">API Specs ↗</a>
      <a href="/login?tenant=${escapeHtml(tenant.slug)}" class="btn-login">🔑 Sign In / Login</a>
    </div>
  </nav>

  <main>
    ${renderedContent}
  </main>
  ${cartWidgetHtml}
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page?.seo?.title || page?.title || 'Page')} — ${escapeHtml(tenant.name)}</title>
  <meta name="description" content="${escapeHtml(page?.seo?.description || '')}">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/blocks.css">
  <link rel="stylesheet" href="/animations.css">
  <style>
    ${cssVariables}
    html, body { background-color: var(--color-bg, #070a12); color: var(--color-text, #f8fafc); margin: 0; min-height: 100vh; overflow-y: auto; overflow-x: hidden; }
  </style>
</head>
<body>
  ${renderedContent}
  ${cartWidgetHtml}
</body>
</html>`;
}
