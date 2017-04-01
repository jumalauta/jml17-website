export default class MainNavigation {
  constructor(element) {
    console.log('new main navigation', element);

    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.toggleNavi = this.toggleNavi.bind(this);

    this.element = element;
    this.element.className += ' not-visible';
    this.toggleButton = element.querySelector('#mainNavigationToggle');
    this.links = this.element.querySelectorAll('a');

    this.links.forEach((link) => {
      link.addEventListener('click', this.handleLinkClick);
    });

    this.toggled = false;
    this.toggleButton.addEventListener('click', this.handleToggleClick);

  }

  handleLinkClick() {
    this.toggled = false;
    this.toggleNavi();
  }

  handleToggleClick(event) {
    event.preventDefault();
    this.toggled = !this.toggled;
    this.toggleNavi();
  }

  toggleNavi() {
    if (this.toggled) {
      console.log('show navi');
      this.toggleButton.className += ' is-active';
      this.element.className = this.element.className.replace(' not-visible', ' is-visible');
    } else {
      console.log('hide navi');
      this.toggleButton.className = this.toggleButton.className.replace(' is-active', '');
      this.element.className = this.element.className.replace(' is-visible', ' not-visible');
    }
  }
}
