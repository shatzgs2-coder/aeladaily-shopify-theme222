/* ============================================
   AELA Daily — Main Custom JS
   Interactive behaviors for Shopify theme
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Sticky Header ---
  const header = document.getElementById('site-header');
  if (header) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle('is-sticky', !entry.isIntersected);
      },
      { threshold: [0], rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(header);
  }

  // --- Mobile Menu Toggle ---
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = !mobileNav.hidden;
      mobileNav.hidden = isOpen;
      mobileToggle.classList.toggle('open', !isOpen);
    });
  }

  // --- Product Gallery Thumbnails ---
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    document.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mainImage.src = btn.dataset.imageUrl;
        mainImage.srcset = '';
      });
    });
  }

  // --- Swatch / Size Selection ---
  document.querySelectorAll('.product-option').forEach(optionGroup => {
    optionGroup.querySelectorAll('.swatch, .size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.parentElement;
        parent.querySelectorAll('.is-active').forEach(el => el.classList.remove('is-active'));
        btn.classList.add('is-active');
        const label = optionGroup.querySelector('[data-selected-value]');
        if (label) label.textContent = btn.dataset.value;

        // Update hidden variant input
        const variantInput = document.querySelector('[data-selected-variant]');
        if (variantInput && window.productVariants) {
          const selected = getSelectedOptions();
          const variant = findVariant(selected);
          if (variant) variantInput.value = variant.id;
        }
      });
    });
  });

  function getSelectedOptions() {
    const options = {};
    document.querySelectorAll('.product-option').forEach(group => {
      const name = group.dataset.optionName;
      const active = group.querySelector('.is-active');
      if (name && active) options[name] = active.dataset.value;
    });
    return options;
  }

  function findVariant(selected) {
    if (!window.productVariants || !Array.isArray(window.productVariants)) return null;
    return window.productVariants.find(v =>
      v.options.every((opt, i) => opt === Object.values(selected)[i])
    );
  }

  // --- Quantity Input Component ---
  class QuantityInput extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('.qty-input');
      const decBtn = this.querySelector('[data-decrease]');
      const incBtn = this.querySelector('[data-increase]');
      if (decBtn) decBtn.addEventListener('click', () => this.step(-1));
      if (incBtn) incBtn.addEventListener('click', () => this.step(1));
    }
    step(delta) {
      let val = parseInt(this.input.value, 10) + delta;
      val = Math.max(1, val);
      this.input.value = val;
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  customElements.define('quantity-input', QuantityInput);

  // --- Cart Drawer Toggle ---
  const cartDrawer = document.getElementById('cart-drawer');
  if (cartDrawer) {
    cartDrawer.querySelectorAll('[data-cart-close]').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        cartDrawer.hidden = true;
      });
    });

    // Open on add-to-cart
    document.querySelectorAll('[name="add"]').forEach(addBtn => {
      addBtn.closest('form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        try {
          const resp = await fetch(routes.cart_add_url, {
            method: 'POST',
            body: new FormData(form)
          });
          if (resp.ok) {
            cartDrawer.hidden = false;
            // Update cart count
            const countEl = document.querySelector('[data-cart-count]');
            if (countEl) countEl.textContent = parseInt(countEl.textContent, 10) + 1;
          }
        } catch (err) {
          console.error('Add to cart error:', err);
        }
      });
    });
  }

  // --- Collection Sort ---
  const sortSelect = document.getElementById('sort-by');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const params = new URLSearchParams(window.location.search);
      params.set('sort_by', sortSelect.value);
      window.location.search = params.toString();
    });
  }

  // --- Price Slider ---
  const priceSlider = document.getElementById('price-slider');
  const priceMaxLabel = document.getElementById('price-max');
  if (priceSlider && priceMaxLabel) {
    priceSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      priceMaxLabel.textContent = val >= 100 ? '€100+' : `€${val}`;
    });
  }

  // --- Color Filter Swatches ---
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatch.closest('.color-filter-swatches')
        .querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

});
