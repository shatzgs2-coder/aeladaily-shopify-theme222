/* ============================================
   AELA Daily — Vendor / Web Components
   Reusable UI components
   ============================================ */

class DetailsModal extends HTMLElement {
  constructor() { super(); this.details = null; }
  connectedCallback() {
    this.details = this.querySelector('details');
    if (!this.details) return;
    const summary = this.querySelector('summary');
    summary?.addEventListener('click', (e) => e.preventDefault());
    summary?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open = !this.open;
      }
    });
  }
  get open() { return this.details.hasAttribute('open'); }
  set open(val) {
    if (val) this.details.setAttribute('open', '');
    else this.details.removeAttribute('open');
  }
}
customElements.define('details-modal', DetailsModal);

class StickyHeader extends HTMLElement {
  constructor() { super(); }
  connectedCallback() {
    this.header = document.getElementById('site-header') || this.closest('.header-wrapper');
    if (!this.header) return;

    this.headerBounds = {};
    this.currentScrollY = 0;

    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    this.createObserver();
  }

  createObserver() {
    let observer = new IntersectionObserver((entries) => {
      this.headerBounds = entries[0].boundingClientRect;
      observer.disconnect();
    });
    observer.observe(this.header);
  }

  onScroll() {
    const scrollY = window.scrollY;
    if (Math.abs(scrollY - this.currentScrollY) < 10) return;
    this.header.classList.toggle('is-sticky', scrollY > (this.headerBounds?.bottom || 70));
    this.currentScrollY = scrollY;
  }
}
if (!customElements.get('sticky-header')) {
  customElements.define('sticky-header', StickyHeader);
}
