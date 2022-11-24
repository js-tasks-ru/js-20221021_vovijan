export default class RangePicker {
  element = null;
  subElements = {};
  selectingFrom = true;
  selected = {
    from: new Date(),
    to: new Date()
  };

  /**
   * Он принимает объект даты и возвращает строку с датой, отформатированной в соответствии с региональными настройками
   * пользователя.
   * @param date - Дата для форматирования.
   * @returns Дата в формате дд.мм.гггг
   */
  static formatDate(date) {
    return date.toLocaleString('ru', {dateStyle: 'short'});
  }

  /* Обработчик события щелчка по документу. */
  onDocumentClick = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.close();
    }
  };

  /**
   * Функция-конструктор принимает объект в качестве аргумента, и если у этого объекта есть свойство, вызываемое из, она
   * установит значение this.showDateFrom в значение этого свойства. Если у объекта нет свойства, вызываемого из, он
   * установит значение this.showDateFrom в новый объект Date.
   * @param [] - from - дата, с которой начинается календарь
   */
  constructor({from = new Date(), to = new Date()} = {}) {
    this.showDateFrom = new Date(from);
    this.selected = {from, to};

    this.render();
  }

  /**
   * Он возвращает строку, содержащую HTML-код средства выбора диапазона.
   * @returns Строка HTML-кода.
   */
  get template() {
    const from = RangePicker.formatDate(this.selected.from);
    const to = RangePicker.formatDate(this.selected.to);

    return `<div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${from}</span> -
        <span data-element="to">${to}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }

  /**
   * Он создает элемент div, помещает в него шаблон, берет первый дочерний элемент элемента div и присваивает его свойству
   * элемента, а затем вызывает функцию getSubElements для присвоения свойства subElements.
   */
  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  /**
   * Он принимает элемент и возвращает объект со всеми подэлементами этого элемента.
   * @param element - Элемент, содержащий подэлементы.
   * @returns Объект с подэлементами в качестве ключей и подэлементом в качестве значения.
   */
  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-element]')) {
      subElements[subElement.dataset.element] = subElement;
    }

    return subElements;
  }

  /**
   * Мы добавляем прослушиватели событий к вводу, селектору и документу.
   */
  initEventListeners() {
    const {input, selector} = this.subElements;

    document.addEventListener('click', this.onDocumentClick, true);
    input.addEventListener('click', () => this.toggle());
    selector.addEventListener('click', event => this.onSelectorClick(event));
  }

  /**
   * Функция toggle() переключает класс rangepicker_open для элемента, а затем вызывает функцию renderDateRangePicker().
   */
  toggle() {
    this.element.classList.toggle('rangepicker_open');
    this.renderDateRangePicker();
  }

  /**
   * Если цель события щелчка имеет класс rangepicker__cell, то вызовите функцию onRangePickerCellClick и передайте ей цель
   */
  onSelectorClick({target}) {
    if (target.classList.contains('rangepicker__cell')) {
      this.onRangePickerCellClick(target);
    }
  }

  /**
   * Удаляет класс rangepicker_open из элемента
   */
  close() {
    this.element.classList.remove('rangepicker_open');
  }

  /**
   * Он отображает средство выбора диапазона дат
   */
  renderDateRangePicker() {
    const showDate1 = new Date(this.showDateFrom);
    const showDate2 = new Date(this.showDateFrom);
    const { selector } = this.subElements;

    showDate2.setMonth(showDate2.getMonth() + 1);

    selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderCalendar(showDate1)}
      ${this.renderCalendar(showDate2)}
    `;

    const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight = selector.querySelector('.rangepicker__selector-control-right');

    controlLeft.addEventListener('click', () => this.prev());
    controlRight.addEventListener('click', () => this.next());

    this.renderHighlight();
  }

  /**
   * Функция устанавливает месяц переменной showDateFrom на предыдущий месяц, а затем вызывает функцию
   * renderDateRangePicker().
   */
  prev() {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
    this.renderDateRangePicker();
  }

  /**
   * Функция next() увеличивает месяц переменной showDateFrom на единицу, а затем вызывает функцию renderDateRangePicker().
   */
  next() {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
    this.renderDateRangePicker();
  }

  /**
   * Он добавляет соответствующие классы CSS в ячейки календаря.
   */
  renderHighlight() {
    const { from, to } = this.selected;

    for (const cell of this.element.querySelectorAll('.rangepicker__cell')) {
      const { value } = cell.dataset;
      const cellDate = new Date(value);

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');

      if (from && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from && to && cellDate >= from && cellDate <= to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }

    if (from) {
      const selectedFromElem = this.element.querySelector(`[data-value="${from.toISOString()}"]`);
      if (selectedFromElem) {
        selectedFromElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }

    if (to) {
      const selectedToElem = this.element.querySelector(`[data-value="${to.toISOString()}"]`);
      if (selectedToElem) {
        selectedToElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  /**
   * Отрисовывает календарь на заданную дату
   * @param showDate - дата для отображения в календаре
   * @returns Строка HTML-кода.
   */
  renderCalendar(showDate) {
    const date = new Date(showDate);
    const getGridStartIndex = dayIndex => {
      const index = dayIndex === 0 ? 6 : (dayIndex - 1); // make Sunday (0) the last day
      return index + 1;
    };

    date.setDate(1);

    // text-transform: capitalize
    const monthStr = date.toLocaleString('ru', {month: 'long'});

    let table = `<div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime=${monthStr}>${monthStr}</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">
    `;

    // first day of month starts after a space
    // * * * 1 2 3 4
    table += `
      <button type="button"
        class="rangepicker__cell"
        data-value="${date.toISOString()}"
        style="--start-from: ${getGridStartIndex(date.getDay())}">
          ${date.getDate()}
      </button>`;

    date.setDate(2);

    while (date.getMonth() === showDate.getMonth()) {
      table += `
        <button type="button"
          class="rangepicker__cell"
          data-value="${date.toISOString()}">
            ${date.getDate()}
        </button>`;

      date.setDate(date.getDate() + 1);
    }

    // close the table
    table += '</div></div>';

    return table;
  }

  /**
   * Если пользователь нажимает на ячейку, мы проверяем, выбирает ли пользователь первую или вторую дату. Если пользователь
   * выбирает первую дату, мы устанавливаем для свойства `selectingFrom` значение `false` и отображаем выделение. Если
   * пользователь выбирает вторую дату, мы проверяем, больше ли вторая дата, чем первая дата. Если это так, мы
   * устанавливаем свойство `to` выбранного объекта на вторую дату. Если это не так, мы устанавливаем свойство `to` на
   * первую дату, а свойство `from` на вторую дату. Затем мы устанавливаем для свойства `selectingFrom` значение `true` и
   * визуализируем выделение.
   * @param target - Элемент, который был нажат.
   */
  onRangePickerCellClick(target) {
    const { value } = target.dataset;

    if (value) {
      const dateValue = new Date(value);

      if (this.selectingFrom) {
        this.selected = {
          from: dateValue,
          to: null
        };
        this.selectingFrom = false;
        this.renderHighlight();
      } else {
        if (dateValue > this.selected.from) {
          this.selected.to = dateValue;
        } else {
          this.selected.to = this.selected.from;
          this.selected.from = dateValue;
        }

        this.selectingFrom = true;
        this.renderHighlight();
      }

      if (this.selected.from && this.selected.to) {
        this.dispatchEvent();
        this.close();
        this.subElements.from.innerHTML = RangePicker.formatDate(this.selected.from);
        this.subElements.to.innerHTML = RangePicker.formatDate(this.selected.to);
      }
    }
  }

  /**
   * Он создает новое событие, устанавливает для свойства детали выбранную дату, а затем отправляет событие.
   */
  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected,
    }));
  }

  /**
   * Функция удаляет элемент из DOM и удаляет прослушиватель событий из документа.
   */
  remove() {
    this.element.remove();
    document.removeEventListener('click', this.onDocumentClick, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selectingFrom = true;
    this.selected = {
      from: new Date(),
      to: new Date()
    };

    return this;
  }
}
