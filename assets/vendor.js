/* ============================================================
   Atelier Wabi — Vendor / Web Components
   ============================================================ */

// ─── Quantity Input Web Component ───────────────
class QuantityInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input[type="number"]');
    if (!this.input) return;
    this.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let val = parseInt(this.input.value) || 1;
        if (action === 'plus') val++;
        else if (action === 'minus' && val > 1) val--;
        this.input.value = val;
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }
}
customElements.define('quantity-input', QuantityInput);

// ─── Details Modal (Accordion) Web Component ────
class DetailsModal extends HTMLElement {
  constructor() { super(); this.details = this.querySelector('details'); }
  connectedCallback() {
    if (!this.details) return;
    this.summary = this.details.querySelector('summary');
    this.content = this.details.querySelector('.aw-details__content');
    if (this.content && !this.details.open) this.content.style.maxHeight = '0';
    if (this.summary) this.summary.addEventListener('click', (e) => this.toggle(e));
  }
  toggle(e) {
    e.preventDefault();
    const isOpen = this.details.open;
    if (this.content) {
      this.content.style.maxHeight = isOpen ? '0' : this.content.scrollHeight + 'px';
      // Allow collapse after animation
      if (!isOpen) setTimeout(() => { if (!this.details.open) this.content.style.maxHeight = '0'; }, 300);
    }
    this.details.open = !isOpen;
  }
}
customElements.define('details-modal', DetailsModal);

// ─── Sticky Header Web Component ─────────────────
class StickyHeader extends HTMLElement {
  constructor() { super(); }
  connectedCallback() {
    this.header = document.querySelector('.aw-header');
    if (!this.header) return;
    this.headerBounds = this.header.getBoundingClientRect();
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.createObserver();
  }
  createObserver() {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) this.header.classList.add('is-sticky');
        else this.header.classList.remove('is-sticky');
      });
    }, { threshold: 0, rootMargin: '-72px 0px 0px 0px' }).observe(this);
  }
  onScroll() {
    const scrollTop = window.scrollY;
    // Optional: hide/show header based on scroll direction
  }
}
if (!customElements.get('sticky-header')) customElements.define('sticky-header', StickyHeader);
