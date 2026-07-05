/* ============================================================
   Atelier Wabi v6.1 — Custom JavaScript
   Enhanced: Robust variant matching, color swatches,
            stock status sync, smooth animations
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {

  // ─── Sticky Header (IntersectionObserver) ────────
  var header = document.querySelector('.aw-header');
  if (header) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { header.classList.toggle('is-sticky', !e.isIntersecting); });
    }, { threshold: 0, rootMargin: '-72px 0px 0px 0px' }).observe(sentinel);
  }

  // ─── Mobile Menu Toggle ─────────────────────────
  var menuToggle = document.querySelector('.aw-header__menu-toggle');
  var mobileMenu = document.querySelector('.aw-mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
      this.classList.toggle('is-active');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mobileMenu.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Fade-Up Scroll Animation ────────────────────
  var fadeEls = document.querySelectorAll('.aw-fade-up');
  if (fadeEls.length > 0) {
    var fadeObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0 -40px 0px' });
    fadeEls.forEach(function(el) { fadeObs.observe(el); });
  }

  // ══════════════════════════════════════════════
  // VARIANT SWATCH SELECTION (Enhanced)
  // Uses data-option1/2/3 attributes on <option> elements
  // for robust matching regardless of display format
  // ══════════════════════════════════════════════
  document.querySelectorAll('.aw-product-form').forEach(function(form) {
    var selectEl = form.querySelector('#ProductSelect-' + form.closest('section')?.id);
    if (!selectEl || selectEl.options.length === 0) return;

    var swatches = form.querySelectorAll('.aw-swatch');

    swatches.forEach(function(swatch) {
      swatch.addEventListener('click', function() {
        var group = this.closest('.aw-variant-group');
        if (!group) return;

        // Deselect siblings in this group only
        group.querySelectorAll('.aw-swatch').forEach(function(s) { s.classList.remove('selected'); });
        this.classList.add('selected');

        // Find matching variant using data-option attributes
        findAndSelectVariant(form, selectEl);
      });
    });

    /**
     * Find the correct variant by collecting all selected swatch values
     * and matching against option data attributes on <option> tags.
     */
    function findAndSelectVariant(form, select) {
      var selectedValues = [];
      form.querySelectorAll('.aw-variant-group').forEach(function(group) {
        var active = group.querySelector('.aw-swatch.selected');
        selectedValues.push(active ? active.dataset.value : '');
      });

      var matchedIdx = -1;
      var options = select.options;

      for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (!opt.value) continue;

        var optVals = [
          (opt.dataset.option1 || '').toLowerCase(),
          (opt.dataset.option2 || '').toLowerCase(),
          (opt.dataset.option3 || '').toLowerCase()
        ];

        var selVals = selectedValues.map(function(v) { return (v || '').toLowerCase(); });

        // Filter out empty values for comparison
        var nonEmptySel = selVals.filter(Boolean);
        var nonEmptyOpt = optVals.filter(Boolean);

        // Check if all non-empty selected values match corresponding options
        var matches = true;
        for (var j = 0; j < nonEmptySel.length; j++) {
          if (nonEmptyOpt[j] !== undefined && nonEmptyOpt[j] !== '' && nonEmptyOpt[j] !== nonEmptySel[j]) {
            matches = false;
            break;
          }
        }

        if (matches && nonEmptySel.length === nonEmptyOpt.filter(Boolean).length) {
          matchedIdx = i;
          break;
        }
      }

      // Fallback: try exact title match
      if (matchedIdx === -1 && selectedValues.filter(Boolean).length > 0) {
        var targetTitle = selectedValues.join(' / ').trim();
        for (var k = 0; k < options.length; k++) {
          if (options[k].textContent.trim() === targetTitle ||
              options[k].value === targetTitle) {
            matchedIdx = k;
            break;
          }
        }
      }

      if (matchedIdx >= 0) {
        select.selectedIndex = matchedIdx;

        // Update hidden input
        var hiddenInput = form.querySelector('input[name="id"]');
        if (hiddenInput) hiddenInput.value = select.value;

        // Update UI elements
        var selectedOpt = select.options[select.selectedIndex];

        // Price update
        var priceEl = document.getElementById('pdp-price');
        var btnPriceEl = document.getElementById('pdp-btn-price');
        if (priceEl && selectedOpt) {
          priceEl.innerHTML = '';
          // Try to get price from variant data or parse text
          var priceText = selectedOpt.textContent.trim();
          // If option has price in text like "S / Black - €49.00"
          var dashIdx = priceText.lastIndexOf(' - ');
          if (dashIdx > 0) {
            priceText = priceText.substring(dashIdx + 3).trim();
          } else {
            // Use current_variant price as fallback
            priceText = '{{ current_variant.price | money }}';
          }
          priceEl.textContent = priceText;
          if (btnPriceEl) btnPriceEl.textContent = priceText;
        }

        // Stock status
        var stockEl = document.getElementById('pdp-stock');
        var isAvailable = selectedOpt.getAttribute('data-available') !== 'false';
        if (stockEl) {
          stockEl.className = 'aw-stock-status ' + (isAvailable ? 'aw-stock-status--in' : 'aw-stock-status--out');
          stockEl.innerHTML = isAvailable
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>In stock'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Sold Out';
        }

        // Add to Cart button state
        var addBtn = form.querySelector('[type="submit"][name="add"]');
        if (addBtn) {
          addBtn.disabled = !isAvailable;
          addBtn.textContent = isAvailable
            ? 'Add to Cart — ' + (document.getElementById('pdp-btn-price')?.textContent || '')
            : 'Sold Out';
        }

        // SKU update
        var skuEl = document.getElementById('pdp-sku');
        if (skuEl) skuEl.textContent = 'SKU: ' + (selectedOpt.getAttribute('data-sku') || '—');
      }
    } // end findAndSelectVariant
  }); // end each product form

  // ─── Quick Add to Cart Drawer ───────────────────
  document.querySelectorAll('.aw-quick-add').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var variantId = this.dataset.variantId;
      if (!variantId) return;

      var self = this;
      self.textContent = 'Adding...';
      self.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        refreshCartDrawer();
        openCartDrawer();
        self.textContent = 'Added ✓';
        setTimeout(function() { self.textContent = 'Quick Add'; self.disabled = false; }, 1500);
      })
      .catch(function(err) {
        console.error('Add to cart error:', err);
        self.textContent = 'Try Again';
        self.disabled = false;
      });
    });
  });

  // ─── Cart Drawer Controls ────────────────────────
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

  // Close on overlay click / Escape key
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('aw-cart-drawer__overlay')) closeCartDrawer();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCartDrawer();
  });

  // Cart icon click opens drawer
  document.querySelectorAll('[data-cart-toggle]').forEach(function(b) {
    b.addEventListener('click', toggleCartDrawer);
  });

  // ─── Quantity Selector (+/- buttons) ──────────────
  document.querySelectorAll('.aw-qty').forEach(function(qty) {
    var input = qty.querySelector('input[type="number"]');
    if (!input) return;
    qty.querySelector('[data-action="minus"]')?.addEventListener('click', function() {
      if (input.value > 1) { input.value = parseInt(input.value) - 1; input.dispatchEvent(new Event('change')); }
    });
    qty.querySelector('[data-action="plus"]')?.addEventListener('click', function() {
      var max = parseInt(input.max) || 99;
      if (parseInt(input.value) < max) { input.value = parseInt(input.value) + 1; input.dispatchEvent(new Event('change')); }
    });
  });

  // ─── Accordion Details Animation ─────────────────
  document.querySelectorAll('details.aw-details').forEach(function(details) {
    details.addEventListener('toggle', function() {
      var content = this.querySelector('.aw-details__content');
      if (content) {
        content.style.maxHeight = this.open ? content.scrollHeight + 'px' : '0';
        content.style.transition = 'max-height 0.35s ease';
      }
    });
    // Set initial closed state height
    if (!details.open) {
      var initC = details.querySelector('.aw-details__content');
      if (initC) initC.style.maxHeight = '0';
    }
  });

  // ─── Smooth Scroll for Anchor Links ─────────────
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── Refresh Cart Drawer Content ─────────────────
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
      container.innerHTML = '<div class="aw-cart-empty" style="text-align:center;padding:48px 20px;color:#9a938a"><svg style="width:48px;height:48px;margin-bottom:16px;opacity:.4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><p>Your cart is empty</p><a href="/collections/all" class="aw-btn aw-btn--outline" style="margin-top:16px">Browse Products</a></div>';
      return;
    }
    container.innerHTML = items.map(function(item) {
      return '<div style="display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #ede8e1" data-line-key="' + item.key + '">' +
        '<div style="width:80px;height:80px;border-radius:8px;overflow:hidden;background:#f5efe6;flex-shrink:0">' +
          (item.image ? '<img src="' + item.image.replace('.jpg', '_160x160.jpg') + '" alt="" style="width:100%;height:100%;object-fit:cover" loading="lazy">' :
          '<div style="width:100%;height:100%;background:linear-gradient(135deg,#ede8e1,#d4c4b0);display:flex;align-items:center;justify-content:center"><span style="font-size:1.5rem;color:#c17f59">AW</span></div>') +
        '</div>' +
        '<div style="flex:1;min-width:0"><h4 style="font-size:.9rem;margin-bottom:2px;line-height:1.35;color:#2c2825">' + item.product_title + '</h4>' +
          '<p style="font-size:.82rem;color:#9a938a;margin-bottom:8px">' + (item.variant_title || 'Default') + '</p>' +
          '<div style="display:flex;justify-content:space-between;align-items:center"><div class="aw-qty" style="--aw-clay:#e8e3d8">' +
            '<button type="button" class="aw-qty__btn" onclick="updateCartItem(\'' + item.key + '\',' + Math.max(1,item.quantity - 1) + ')" data-action="minus">&#8722;</button>' +
            '<input type="number" value="' + item.quantity + '" min="1" readonly class="aw-qty__input" onchange="updateCartItem(\'' + item.key + '\',this.value)">' +
            '<button type="button" class="aw-qty__btn" onclick="updateCartItem(\'' + item.key + '\',' + (item.quantity + 1) + ')" data-action="plus">+</button>' +
          '</div>' +
          '<strong style="font-family:\'Cormorant Garamond\',serif;color:#8b7355;font-size:1.05rem">' + formatMoney(item.final_line_price) + '</strong>' +
          '</div></div></div>';
    }).join('');
  }

  function renderCartFooter(container, cart) {
    container.innerHTML =
      '<div style="display:flex;justify-content:space-between;font-size:.92rem;margin-bottom:12px"><span>Subtotal</span>' +
        '<strong>' + formatMoney(cart.total_price) + '</strong></div>' +
      '<p style="font-size:.78rem;color:#9a938a;margin-bottom:16px">Shipping & taxes calculated at checkout.</p>' +
      '<a href="/checkout" class="aw-btn aw-btn--primary" style="width:100%">Checkout</a>' +
      '<a href="/cart" class="aw-btn aw-btn--outline" style="width:100%;margin-top:8px">View Full Cart</a>';
  }

  // Simple money formatter fallback (used when Shopify.formatMoney unavailable)
  function formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, '{{ shop.money_format }}');
    }
    var eur = (cents / 100).toFixed(2);
    return '€' + eur.replace('.', ',');
  }

  window.updateCartItem = function(key, qty) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: key, quantity: parseInt(qty) || 1 })
    }).then(function(r) { return r.json(); })
      .then(function() { refreshCartDrawer(); });
  };

}); // end DOMContentLoaded
