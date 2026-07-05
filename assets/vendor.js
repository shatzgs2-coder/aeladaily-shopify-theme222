/**
 * Atelier Wabi — Web Components (Vendor)
 * Minimal polyfills for quantity input & details animation
 */

/* ====== Quantity Input Component ====== */
class QuantityInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input[type="number"]') || this.querySelector('input:not([type])');
    this.decBtn = this.querySelector('button:first-of-type');
    this.incBtn = this.querySelector('button:last-of-type');
    if (!this.input) return;

    if (this.decBtn) this.decBtn.addEventListener('click', () => this.change(-1));
    if (this.incBtn) this.incBtn.addEventListener('click', () => this.change(1));

    // Validate input range
    this.input.addEventListener('change', () => {
      var min = parseInt(this.input.min) || 1;
      var val = parseInt(this.input.value) || min;
      if (val < min) this.input.value = min;
    });
  }
  change(delta) {
    var min = parseInt(this.input.min) || 1;
    var max = parseInt(this.input.max) || 9999;
    var val = parseInt(this.input.value) || min;
    val += delta;
    if (val < min) val = min;
    if (val > max) val = max;
    this.input.value = val;
  }
}
if (!customElements.get('quantity-input')) customElements.define('quantity-input', QuantityInput);

/* ====== Details Modal (Accordion Animation) ====== */
class DetailsModal extends HTMLElement {
  constructor() {
    super();
    if (this.hasAttribute('open')) this.open = true;
  }
  get open() { return this.hasAttribute('open'); }
  set open(val) {
    if (val) this.setAttribute('open', ''); else this.removeAttribute('open');
  }
}
if (!customElements.get('details-modal')) customElements.define('details-modal', DetailsModal);

/* ====== Sticky Header Component ====== */
class StickyHeader extends HTMLElement {
  connectedCallback() {
    this.header = document.getElementById('aw-header');
    if (!this.header) return;
    this.headerBounds = this.header.getBoundingClientRect();

    this.onScrollHandler = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });
  }
  onScroll() {
    if (window.scrollY > this.headerBounds.bottom) {
      this.header.classList.add('is-sticky');
    } else {
      this.header.classList.remove('is-sticky');
    }
  }
  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScrollHandler);
  }
}
if (!customElements.get('sticky-header')) customElements.define('sticky-header', StickyHeader);
