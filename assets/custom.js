/* Aela Daily v7.0 — Custom JavaScript */

(function() {
  'use strict';

  // ===== Cart Drawer =====
  var cartToggle = document.querySelector('[data-cart-toggle]');
  var cartClose = document.querySelector('[data-cart-close]');
  var cartDrawer = document.querySelector('[data-cart-drawer]');
  var cartOverlay = document.querySelector('[data-cart-overlay]');

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) {
      closeCart();
    }
  });

  // ===== Sticky Header =====
  function handleScroll() {
    var header = document.querySelector('.aw-hdr');
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ===== Mobile Menu =====
  var mobBtn = document.querySelector('.aw-mob-btn');
  var mobMenu = document.querySelector('.aw-mob-menu');
  if (mobBtn && mobMenu) {
    mobBtn.addEventListener('click', function() {
      var open = mobMenu.classList.toggle('open');
      mobBtn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  // ===== Product Variant Selector =====
  function initProductForm() {
    var form = document.querySelector('[data-product-form]');
    if (!form) return;

    var select = form.querySelector('[data-product-select]');
    var opts = form.querySelectorAll('[data-option-value]');

    opts.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var index = parseInt(this.closest('[data-option-index]').getAttribute('data-option-index'));
        var value = this.getAttribute('data-option-value');

        // Update active state
        var siblings = this.parentElement.querySelectorAll('.aw-prod__opt');
        siblings.forEach(function(s) { s.classList.remove('active'); s.removeAttribute('aria-current'); });
        this.classList.add('active');
        this.setAttribute('aria-current', 'true');

        // Update display name
        var nameEl = this.closest('.aw-prod__variant').querySelector('[data-option-name]');
        if (nameEl) nameEl.textContent = value;

        // Find variant
        var selectedValues = [];
        var optionGroups = form.querySelectorAll('[data-option-index]');
        optionGroups.forEach(function(group) {
          var active = group.querySelector('.aw-prod__opt.active');
          if (active) selectedValues.push(active.getAttribute('data-option-value'));
          else selectedValues.push(group.querySelector('.aw-prod__opt').getAttribute('data-option-value'));
        });

        // Look up variant by options
        var variantData = document.querySelectorAll('[data-variant-id]');
        var found = false;
        variantData.forEach(function(el) {
          var match = selectedValues.every(function(v, i) {
            return el.getAttribute('data-option-' + (i + 1)) === v;
          });
          if (match) {
            select.value = el.getAttribute('data-variant-id');
            var price = document.querySelector('[data-price]');
            if (price) price.textContent = el.getAttribute('data-price');
            var compare = document.querySelector('[data-compare-price]');
            if (compare) compare.textContent = el.getAttribute('data-compare-price') || '';
            var atc = form.querySelector('[data-add-to-cart]');
            if (atc) {
              atc.disabled = el.getAttribute('data-available') !== 'true';
              atc.textContent = el.getAttribute('data-available') === 'true'
                ? (form.querySelector('[data-add-to-cart]').getAttribute('data-add-text') || 'Add to Cart')
                : 'Sold Out';
            }
            found = true;
          }
        });
      });
    });
  }

  // ===== Product Recommendations =====
  function loadRecommendations() {
    var el = document.querySelector('[data-section-type="product-recommendations"]');
    if (!el) return;
    var baseUrl = el.getAttribute('data-base-url');
    var productId = el.getAttribute('data-product-id');
    if (!baseUrl || !productId) return;

    var url = baseUrl + '?product_id=' + productId + '&limit=4&section_id=related-products';
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var container = el.querySelector('[data-recommendations-container]');
        if (container) container.innerHTML = html;
      })
      .catch(function() {});
  }

  // ===== Init on load =====
  document.addEventListener('DOMContentLoaded', function() {
    handleScroll();
    initProductForm();
    loadRecommendations();
  });

})();

// ===== Custom Element: Sticky Header =====
if (typeof customElements !== 'undefined') {
  customElements.define('sticky-header', class extends HTMLElement {
    constructor() { super(); }
  });
}
