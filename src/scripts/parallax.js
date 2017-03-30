/* global Modernizr,$ */

export default class Parallax {
  constructor(element) {
    this.element = element;
    this.item = element.querySelector('[data-parallax-item]');
    this.element.className += ' parallax-container';
    this.anchor = element.dataset.parallaxAnchor || 'center';
    this.amount = parseInt(element.dataset.parallaxAmount || 0, 10);
    this.offset = parseInt(element.dataset.parallaxOffset || 0, 10);
    this.autoSize = (element.dataset.parallaxAutosize || true) === true;
    this.unit = element.dataset.parallaxUnit || 'px';
    this.breakpoint = element.dataset.parallaxBreakpoint;

    // set initial transform
    if (Modernizr.csstransforms3d) {
      this.item.style.transform = 'translate3d(0, 0, 0)';
    } else {
      this.item.style.transform = 'translateY(0)';
    }

    this.render = this.render.bind(this);
    window.addEventListener('scroll', this.render);
    this.render();
  }

  render() {
    // get window size
    const bodyRect = document.getElementsByTagName('body')[0].getBoundingClientRect();
    if (bodyRect.width < this.breakpoint) {
      this.item.style.transform = 'none';
      return;
    }

    // get container size & position
    const containerRect = this.element.getBoundingClientRect();

    if (this.autoSize) {
      // set parallax item height if autosize is set
      if (this.unit === '%') {
        this.item.style.height =
          `${containerRect.height + (containerRect.height * ((this.amount * 2) / 100))}px`;
      } else {
        this.item.style.height =
          `calc(${containerRect.height}px + ${this.amount * 2}${this.unit})`;
      }
    }

    // check that element is visible
    if (
      (containerRect.top >= 0 && containerRect.top <= bodyRect.height) ||
      (containerRect.bottom >= 0 && containerRect.bottom <= bodyRect.height)
    ) {
      let ratio = 0;
      let transform = 0;

      if (this.anchor === 'center') {
        const containerMiddle = containerRect.top + (containerRect.height / 2);
        const screenMiddle = bodyRect.height / 2;
        const middleDiff = screenMiddle - containerMiddle;
        const max = containerRect.height;
        const min = -max;
        ratio = (middleDiff - min) / (max - min);
        transform = (ratio * (this.amount * 2)) - this.amount
      } else if (this.anchor === 'top') {
        const diff = containerRect.height - Math.abs(containerRect.top);
        ratio = 1 - (diff / containerRect.height);
        transform = ratio * this.amount;
      }

      if (Modernizr.csstransforms3d) {
        this.item.style.transform = `translate3d(0, ${transform}${this.unit}, 0)`;
      } else {
        this.item.style.transform = `translateY(${transform}${this.unit})`;
      }
    }
  }
}
