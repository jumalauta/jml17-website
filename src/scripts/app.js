import Parallax from './parallax';
import MainNavigation from './mainnavigation';
import ScrollSpy from './scrollspy';

class App {
  constructor() {
    console.log('Jumalauta 17, September 1st - 3rd, 2017');

    this.html = document.getElementsByTagName('html')[0];
    this.body = document.getElementsByTagName('body')[0];

    // bind methods
    this.handleScroll = this.handleScroll.bind(this);

    // main navigation
    let mainNavigationElement = window.document.getElementById('mainNavigation');
    this.mainNavigation = new MainNavigation(mainNavigationElement);
    this.scrollSpy = new ScrollSpy(mainNavigationElement);

    // init parallax elements
    this.parallaxElements = window.document.querySelectorAll('[data-parallax]');
    this.parallax = [];
    this.parallaxElements.forEach((element) => {
      this.parallax.push(new Parallax(element));
    });

    window.addEventListener('scroll', this.handleScroll);
    this.handleScroll();

    // set html class name to loaded
    this.html.className = this.html.className.replace('app-loading', 'app-loaded');
  }

  /**
   * Update body class on window scroll event
   */
  handleScroll() {
    if (window.scrollY <= 0 && this.body.className.indexOf('scroll-top') < 0) {
      this.body.className += ' scroll-top';
    } else if (window.scrollY > 0 && this.body.className.indexOf('scroll-top') >= 0) {
      this.body.className = this.body.className.replace('scroll-top', '');
    }
  }
}

window.addEventListener('load', () => {
  window.app = new App();
});
