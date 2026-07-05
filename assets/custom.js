/* ============================================
   AELA Daily — Custom Interactions (v4)
   Atelier Wabi Design System
   ============================================ */

(function() {
  'use strict';

  // ── Sticky Header ─────────────────────
  const headerWrapper = document.querySelector('.header-wrapper');
  if (headerWrapper) {
    const observer = new IntersectionObserver(
      ([e]) => e.target.classList.toggle('is-sticky', e.intersectionRatio < 1),
      { threshold: [1], rootMargin: '-1px 0px 0px' }
    );
    observer.observe(headerWrapper);
  }

  // ── Mobile Menu Toggle ─────────────────
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const hidden = mobileNav.getAttribute('hidden') !== null;
      if (hidden) { mobileNav.removeAttribute('hidden'); }
      else { mobileNav.setAttribute('hidden', ''); }
      // Animate hamburger → X
      menuToggle.classList.toggle('active');
    });
  }

  // ── Variant Swatches (Product Page) ─────
  document.querySelectorAll('.variant-swatch-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const siblings = this.closest('.variant-btns-row').querySelectorAll('.variant-swatch-btn');
      siblings.forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // ── Quick Add (Collection Grid) ──────────
  document.querySelectorAll('.btn--quick-add').forEach(btn => {
    btn.addEventListener('click', async function() {
      const variantId = this.dataset.variantId;
      if (!variantId) return;

      const originalText = this.textContent;
      this.disabled = true;
      this.textContent = 'Adding...';

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: parseInt(variantId),
            quantity: 1
          })
        });
        if (res.ok) {
          this.textContent = 'Added ✓';
          setTimeout(() => { this.textContent = originalText; }, 1500);
          // Update cart count
          updateCartCount();
        } else {
          throw new Error('Failed to add');
        }
      } catch (err) {
        this.textContent = 'Error — Retry';
        this.disabled = false;
        setTimeout(() => { this.textContent = originalText; }, 2000);
      }
    });
  });

  // ── Cart Drawer Toggle ──────────────────
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOpenBtns = document.querySelectorAll('[data-cart-open]');
  const cartCloseBtn = document.querySelector('.cart-drawer__close');
  const cartOverlay = document.querySelector('.cart-drawer__overlay');

  function openCart() {
    if (cartDrawer) cartDrawer.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  cartOpenBtns.forEach(b => b.addEventListener('click', openCart));
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // ── Update Cart Count Badge ────────────
  async function updateCartCount() {
    try {
      const res = await fetch('/cart.js');
      const data = await res.json();
      const badges = document.querySelectorAll('.cart-count');
      badges.forEach(badge => {
        badge.textContent = data.item_count;
        badge.style.display = data.item_count > 0 ? '' : 'none';
      });
    } catch (e) {}
  }

  // ── Quantity Controls ───────────────────
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentElement.querySelector('.qty-input');
      if (!input) return;
      let val = parseInt(input.value) || 1;
      if (this.textContent.trim() === '-' && val > 1) input.value = val - 1;
      if (this.textContent.trim() === '+') input.value = val + 1;
    });
  });

  // ── Details Accordion Smooth Open ───────
  document.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        const content = detail.querySelector('.details-content');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // ── Color Swatch Filter Click ───────────
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', function() {
      const siblings = this.parentElement.querySelectorAll('.color-swatch');
      siblings.forEach(s => s.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // ── Gallery Thumbnail Switch (PDP) ─────
  window.switchMainImage = function(imgSrc, thumbEl) {
    const mainImg = document.getElementById('aw-main-img-tag');
    if (mainImg) mainImg.src = imgSrc;
    if (thumbEl) {
      document.querySelectorAll('.product-gallery__thumb').forEach(t => t.classList.remove('active'));
      thumbEl.classList.add('active');
    }
  };

})();
