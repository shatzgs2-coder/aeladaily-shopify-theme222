/**
 * Atelier Wabi Theme — Custom JavaScript
 * Handles: Sticky Header, Mobile Menu, Swatch Selection, Cart Drawer, Quantity Controls
 */

(function() {
  'use strict';

  /* ====== Sticky Header ====== */
  const header = document.getElementById('aw-header');
  if (header) {
    const onScroll = function() {
      window.scrollY > 20 ? header.classList.add('is-sticky') : header.classList.remove('is-sticky');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once
  }

  /* ====== Mobile Menu Toggle ====== */
  const menuToggle = document.getElementById('aw-menu-toggle');
  const mobileMenu = document.getElementById('aw-mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
      // animate hamburger → X
      const spans = this.querySelectorAll('span');
      if (mobileMenu.classList.contains('is-open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
  }

  /* ====== Variant Swatch Selection ====== */
  document.querySelectorAll('.aw-swatch').forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Deselect siblings in same group
      var parent = this.closest('.swatch-group');
      if (parent) parent.querySelectorAll('.aw-swatch').forEach(function(s) { s.classList.remove('selected'); });
      this.classList.add('selected');
    });
  });

  /* ====== Cart Drawer ====== */
  var drawer = document.getElementById('aw-cart-drawer');
  var overlay = document.getElementById('aw-drawer-overlay');
  var drawerClose = document.getElementById('aw-drawer-close');

  function openDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Open via cart icon / toggle buttons
  document.querySelectorAll('.aw-cart-toggle').forEach(function(el) {
    el.addEventListener('click', openDrawer);
  });

  // Close handlers
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // ESC key closes
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  /* ====== Quick Add (product card) ====== */
  document.querySelectorAll('.aw-product-card__quick-add').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // For now just open the product link — full quick-add requires Shopify AJAX API
      var cardLink = this.closest('.aw-product-card__link');
      if (cardLink) window.location.href = cardLink.getAttribute('href');
    });
  });

})();
