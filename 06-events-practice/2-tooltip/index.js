class Tooltip {
  static instance;

  element;

  /* Функция, которая вызывается, когда указатель мыши находится над элементом. */
  onPointerOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  };

  /* Это функция, которая вызывается при перемещении указателя мыши. */
  onPointerMove = event => {
    this.moveTooltip(event);
  };

  /* Он удаляет всплывающую подсказку и удаляет прослушиватель событий для pointermove. */
  onPointerOut = () => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  };

  /**
   * Если экземпляр Tooltip уже существует, верните его. В противном случае создайте новый экземпляр и возвращает его.
   * @returns Экземпляр класса.
   */
  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  /**
   * Эта функция инициализирует прослушиватели событий.
   */
  initialize() {
    this.initEventListeners();
  }

  /**
   * Когда пользователь наводит курсор на документ, вызывается функция onPointerOver. Когда пользователь перестает наводить
   * курсор на документ, вызывается функция onPointerOut.
   */
  initEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  /**
   * Он создает элемент div, присваивает ему имя класса всплывающей подсказки, а затем добавляет HTML, переданный в
   * качестве аргумента, к свойству innerHTML элемента div.
   * @param html - HTML-код для отображения внутри всплывающей подсказки.
   */
  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;

    document.body.append(this.element);
  }

  /**
   * Он принимает объект события, вычисляет новую позицию всплывающей подсказки, а затем устанавливает свойства left и top
   * элемента всплывающей подсказки.
   * @param event - Объект события, который передается обработчику событий.
   */
  moveTooltip(event) {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  /**
   * Он удаляет элемент из DOM
   */
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  /**
   * Он удаляет все прослушиватели событий, а затем удаляет элемент из DOM.
   */
  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
