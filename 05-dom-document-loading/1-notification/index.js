export default class NotificationMessage {
  constructor(text = '', { duration = 1000, type = 'success' } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;

    this.render();

    NotificationMessage.allInstances = [];
    NotificationMessage.allInstances.push(this);
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
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
    if (NotificationMessage.allInstances) {
      NotificationMessage.allInstances.forEach(instances => instances.remove());
    }

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

    document.body.append(element);

    setTimeout(() => this.remove(), this.duration);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.allInstances = [];
  }
}
