export default class NotificationMessage {
  constructor(text, { duration, type } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `
      <div class="notification success" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.text}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.show(this.element);
  }

  show(element) {
    if (element) {
      element.innerHTML = this.getTemplate();
      this.element = element.firstElementChild;
    }

    if (this.type === 'error') {
      this.element.classList.remove('success');
      this.element.classList.add('error');
    }

    document.body.append(element);

    setTimeout(() => this.remove(), this.duration);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
