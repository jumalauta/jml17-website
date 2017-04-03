// i don't even, fuck this shit, gotta configure rollup to import modules properly or something
import {tween} from 'shifty/src/main';

const offset = -80; // eslint-disable-line no-mixed-operators

export default class ScrollSpy {
  constructor(element) {
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);

    this.noHashScroll = false;

    this.mainNavigation = element;
    this.anchorLinks = window.document.querySelectorAll('a[href^="#"]');
    this.anchorLinks.forEach((link) => {
      link.addEventListener('click', this.handleLinkClick);
    });
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('hashchange', this.handleHashChange);
    this.handleScroll();

    if (window.location.hash) {
      const target = window.document.getElementById(window.location.hash.toString().substr(1));
      if (target) {
        this.scrollToTarget(target);
      }
    }
  }

  handleHashChange(event) {
    event.preventDefault();
    if(this.noHashScroll) {
      return;
    }
    let href = window.location.hash;
    if(href === '') {
      href = '#top';
    }
    const target = window.document.getElementById(href.substr(1));
    if(target !== this.currentTarget) {
      this.scrollToTarget(target, false);
    }
  }

  handleLinkClick(event) {
    const href = event.currentTarget.getAttribute('href');
    const target = window.document.getElementById(href.substr(1));
    this.scrollToTarget(target);
  }

  scrollToTarget(target, changeHash = true) {
    const bodyRect = document.getElementsByTagName('body')[0].getBoundingClientRect();
    if (target) {
      event.preventDefault();
      this.currentTarget = target;
      const targetRect = target.getBoundingClientRect();
      const dy = targetRect.top + offset;
      const scrollY = (targetRect.top - bodyRect.top) + offset;
      let from = { scrollY: window.scrollY };
      let to = { scrollY: scrollY };
      tween({
        from,
        to,
        duration: 500,
        easing: 'easeInOutQuad',
        step: (state) => {
          window.scrollTo(0, state.scrollY);
        }
      }).then(
        () => {
          // window.location.hash = href;
          if(changeHash) {
            history.pushState({}, document.title, `#${target.getAttribute('id')}`);
          }
        }
      );
    }
  }

  handleScroll() {
    const bodyRect = document.getElementsByTagName('body')[0].getBoundingClientRect();
    const items = [];
    let currentItem;

    const maxScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );

    // get ids for sorting by top
    this.anchorLinks.forEach((link) => {
      const target = window.document.getElementById(link.getAttribute('href').substr(1));
      const rect = target.getBoundingClientRect();
      // use bodyrect to detect when item is about 3rd of the screen from top
      items.push({
        href: link.getAttribute('href'),
        top: (rect.top + offset) - (bodyRect.height / 3),
        bottom: rect.bottom
      });
    });

    const sortedItems = items.sort((a, b) => {
      return a.top > b.top ? 1 : -1;
    });
    if(window.scrollY + bodyRect.height >= maxScroll) {
      // mark last item as active on bottom
      currentItem = sortedItems[sortedItems.length - 1];
    } else {
      // get closest item
      sortedItems.forEach((item) => {
          if (item.top < 0 && item.bottom > 0) {
            currentItem = item;
          }
        });
    }

    if(currentItem && currentItem.href !== window.document.location.hash) {
      this.noHashScroll = true;
      history.replaceState({}, document.title, currentItem.href);
      this.noHashScroll = false;
    }

    // mark active
    this.anchorLinks.forEach((link) => {
      link.className = link.className.replace(' active', '');
      if (currentItem && link.getAttribute('href') === currentItem.href) {
        link.className += ' active';
      }
    });
  }
}
