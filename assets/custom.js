/* ============================================================
   Atelier Wabi — Custom JavaScript
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {

  // ─── Sticky Header ─────────────────────────────
  const header = document.querySelector('.aw-header');
  if (header) {
    let lastScrollY = 0;
    const headerObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { header.classList.toggle('is-sticky', !e.isIntersecting); });
    }, { threshold: 0, rootMargin: '-72px 0px 0px 0px' });
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;pointer-events:none';
    document.body.prepend(sentinel);
    headerObserver.observe(sentinel);
  }

  // ─── Mobile Menu Toggle ────────────────────────
  var menuToggle = document.querySelector('.aw-header__menu-toggle');
  var mobileMenu = document.querySelector('.aw-mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
      this.classList.toggle('is-active');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mobileMenu.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Fade-Up Scroll Animation (Intersection Observer) ──
  var fadeEls = document.querySelectorAll('.aw-fade-up');
  if (fadeEls.length > 0) {
    var fadeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(function(el) { fadeObserver.observe(el); });
  }

  // ─── Variant Swatch Selection ───────────────────
  document.querySelectorAll('.aw-product-form').forEach(function(form) {
    var swatches = form.querySelectorAll('.aw-swatch');
    swatches.forEach(function(swatch) {
      swatch.addEventListener('click', function() {
        var group = this.closest('.aw-variant-group');
        if (!group) return;
        // Deselect siblings
        group.querySelectorAll('.aw-swatch').forEach(function(s) { s.classList.remove('selected'); });
        this.classList.add('selected');
        // Update hidden select
        updateVariantSelect(form);
      });
    });

    function updateVariantSelect(form) {
      var select = form.querySelector('[name="id"]');
      if (!select || select.tagName === 'INPUT') return; // only for select elements

      var selectedValues = [];
      form.querySelectorAll('.aw-variant-group').forEach(function(group) {
        var active = group.querySelector('.aw-swatch.selected');
        selectedValues.push(active ? active.dataset.value : '');
      });

      // Find matching variant option
      Array.from(select.options).forEach(function(opt, idx) {
        if (!opt.value) return;
        var optTitle = opt.textContent.split(' - ')[0].trim();
        if (optTitle === selectedValues.join(' / ') || selectedValues.filter(Boolean).length === 0) {
          select.selectedIndex = idx;
        }
      });

      // Sync hidden input & price
      var hiddenInput = form.querySelector('input[name="id"]');
      if (hiddenInput && select.value) hiddenInput.value = select.value;

      var selectedOpt = select.options[select.selectedIndex];
      var addBtn = form.querySelector('[type="submit"][name="add"]');
      if (addBtn && selectedOpt) {
        var isAvailable = !selectedOpt.disabled && selectedOpt.getAttribute('data-available') !== 'false';
        addBtn.disabled = !isAvailable;
        addBtn.textContent = isAvailable ? 'Add to Cart' : 'Sold Out';
      }

      var priceEl = form.querySelector('.aw-price-display');
      if (priceEl && selectedOpt) {
        var pText = selectedOpt.textContent.split(' - ')[1];
        if (pText) priceEl.textContent = pText;
      }
    }
  });

  // ─── Quick Add to Cart Drawer ──────────────────
  document.querySelectorAll('.aw-quick-add').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var variantId = this.dataset.variantId;
      if (!variantId) return;

      // Show loading state
      this.textContent = 'Adding...';
      this.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        // Refresh cart state and open drawer
        refreshCartDrawer();
        openCartDrawer();
        this.textContent = 'Added ✓';
        setTimeout(() => { this.textContent = 'Quick Add'; this.disabled = false; }, 1500);
      }.bind(this))
      .catch(function(err) {
        console.error('Add to cart error:', err);
        this.textContent = 'Try Again';
        this.disabled = false;
      }.bind(this));
    });
  });

  // ─── Cart Drawer Controls ──────────────────────
  window.openCartDrawer = function() {
    var drawer = document.querySelector('.aw-cart-drawer');
    var overlay = document.querySelector('.aw-cart-drawer__overlay');
    if (drawer) { drawer.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    if (overlay) overlay.classList.add('is-open');
  };

  window.closeCartDrawer = function() {
    var drawer = document.querySelector('.aw-cart-drawer');
    var overlay = document.querySelector('.aw-cart-drawer__overlay');
    if (drawer) { drawer.classList.remove('is-open'); document.body.style.overflow = ''; }
    if (overlay) overlay.classList.remove('is-open');
  };

  window.toggleCartDrawer = function() {
    var drawer = document.querySelector('.aw-cart-drawer');
    if (drawer && drawer.classList.contains('is-open')) closeCartDrawer();
    else openCartDrawer();
  };

  // Close on overlay click / escape key
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('aw-cart-drawer__overlay')) closeCartDrawer();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCartDrawer();
  });

  // Cart icon click opens drawer
  var cartBtns = document.querySelectorAll('[data-cart-toggle]');
  cartBtns.forEach(function(b) { b.addEventListener('click', toggleCartDrawer); });

  // ─── Quantity Selector (+/- buttons) ───────────
  document.querySelectorAll('.aw-qty').forEach(function(qty) {
    var input = qty.querySelector('input[type="number"]');
    if (!input) return;
    qty.querySelector('[data-action="minus"]')?.addEventListener('click', function() {
      if (input.value > 1) input.value = parseInt(input.value) - 1;
    });
    qty.querySelector('[data-action="plus"]')?.addEventListener('click', function() {
      input.value = parseInt(input.value) + 1;
    });
  });

  // ─── Accordion Details Animation ───────────────
  document.querySelectorAll('details.aw-details').forEach(function(details) {
    details.addEventListener('toggle', function() {
      var content = this.querySelector('.aw-details__content');
      if (content) {
        content.style.maxHeight = this.open ? content.scrollHeight + 'px' : '0';
      }
    });
    // Set initial state
    if (!details.open) {
      var initContent = details.querySelector('.aw-details__content');
      if (initContent) initContent.style.maxHeight = '0';
    }
  });

  // ─── Refresh Cart Drawer Content ───────────────
  window.refreshCartDrawer = function() {
    fetch('/cart.js')
      .then(function(r) { return r.json(); })
      .then(function(cart) {
        // Update cart count badges
        document.querySelectorAll('.aw-header__cart-count, .aw-cart-count').forEach(function(el) {
          el.textContent = cart.item_count;
          el.style.display = cart.item_count > 0 ? '' : 'none';
        });
        // Update drawer items
        var body = document.querySelector('.aw-cart-drawer__body');
        var footer = document.querySelector('.aw-cart-drawer__footer');
        if (body) renderCartItems(body, cart.items);
        if (footer) renderCartFooter(footer, cart);
      });
  };

  function renderCartItems(container, items) {
    if (items.length === 0) {
      container.innerHTML = '<div class="aw-cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><p>Your cart is empty</p></div>';
      return;
    }
    container.innerHTML = items.map(function(item) {
      return '<div style="display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #ede8e1" data-line-key="' + item.key + '">' +
        '<div style="width:80px;height:80px;border-radius:8px;overflow:hidden;background:#f5efe6;flex-shrink:0">' +
          (item.image ? '<img src="' + item.url + '.jpg?width=160&height=160" alt="" style="width:100%;height:100%;object-fit:cover" loading="lazy">' : '') +
        '</div>' +
        '<div style="flex:1;min-width:0"><h4 style="font-size:.9rem;margin-bottom:2px;line-height:1.35">' + item.product_title + '</h4>' +
          '<p style="font-size:.82rem;color:#9a938a;margin-bottom:8px">' + (item.variant_title || 'Default') + '</p>' +
          '<div style="display:flex;justify-content:space-between;align-items:center"><div class="aw-qty" style="--aw-clay:#e8e3d8">' +
            '<button type="button" class="aw-qty__btn" onclick="updateCartItem(\'' + item.key + '\',' + Math.max(1,item.quantity - 1) + ')" data-action="minus">&#8722;</button>' +
            '<input type="number" value="' + item.quantity + '" min="1" readonly class="aw-qty__input" onchange="updateCartItem(\'' + item.key + '\',this.value)">' +
            '<button type="button" class="aw-qty__btn" onclick="updateCartItem(\'' + item.key + '\',' + (item.quantity + 1) + ')" data-action="plus">+</button>' +
          '</div>' +
          '<strong style="font-family:\'Cormorant Garamond\',serif;color:#8b7355;font-size:1.05rem">' + Shopify.formatMoney(item.final_line_price, '{{ shop.money_format }}') + '</strong>' +
          '</div></div></div>';
    }).join('');
  }

  function renderCartFooter(container, cart) {
    container.innerHTML =
      '<div style="display:flex;justify-content:space-between;font-size:.92rem;margin-bottom:12px"><span>Subtotal</span>' +
        '<strong>' + Shopify.formatMoney(cart.total_price, '{{ shop.money_format }}') + '</strong></div>' +
      '<p style="font-size:.78rem;color:#9a938a;margin-bottom:16px">Shipping & taxes calculated at checkout.</p>' +
      '<a href="/checkout" class="aw-btn aw-btn--primary" style="width:100%">Checkout</a>' +
      '<a href="/cart" class="aw-btn aw-btn--outline" style="width:100%;margin-top:8px">View Cart</a>';
  }

  window.updateCartItem = function(key, qty) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: key, quantity: parseInt(qty) })
    }).then(function(r) { return r.json(); })
      .then(function() { refreshCartDrawer(); });
  };
});
