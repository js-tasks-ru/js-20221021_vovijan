export default class SortableTable {
  element;
  subElements = {};

  /* Функция, которая вызывается, когда пользователь щелкает заголовок таблицы. */
  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc',
      };

      return orders[order];
    };

    if (column) {
      const {id, order} = column.dataset;
      const newOrder = toggleOrder(order);
      const sortedData = this.sortData(id, newOrder);
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  };

  /**
   * Функция-конструктор принимает два аргумента, первый из которых представляет собой массив объектов, содержащий
   * конфигурацию заголовка, а второй — объект, содержащий данные и отсортированный объект.
   * @param [headerConfig] - массив объектов, описывающих заголовок таблицы.
   * @param [] - headerConfig — массив объектов, описывающих заголовок таблицы. Каждый объект имеет следующие свойства:
   */
  constructor(headerConfig = [], {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }

  /**
   * Он возвращает строку, содержащую div с атрибутом элемента данных, равным заголовку, атрибут класса, равный
   * sortable-table__header sortable-table__row, и результат вызова функции getHeaderRow для каждого элемента в массиве
   * headerConfig.
   * @returns Заголовок таблицы.
   */
  get tableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
      </div>
    `;
  }

  /**
   * Возвращает строку, представляющую строку заголовка таблицы.
   * @returns Строка HTML-кода.
   */
  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  /**
   * Возвращает строку со стрелкой, если столбец отсортирован, иначе возвращает пустую строку.
   * @param id - идентификатор столбца
   */
  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  /**
   * Он возвращает строку, содержащую div с классом sortable-table__body и результат функции getTableRows.
   * @param data - массив объектов, содержащих данные для отображения в таблице.
   * @returns Строка кода HTML, которая будет использоваться для создания тела таблицы.
   */
  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>
    `;
  }

  /**
   * Он принимает массив объектов и возвращает строку HTML-кода.
   * @param data - массив объектов, содержащих данные для отображения в таблице.
   * @returns Строка HTML-кода.
   */
  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item)}
      </div>`
    ).join('');
  }

  /**
   * Он принимает элемент и возвращает строку HTML, представляющую строку таблицы.
   * @param item - объект, который содержит данные для текущей строки
   * @returns Строка HTML
   */
  getTableRow(item) {
    return this.headerConfig.map(({id, template}) => ({
      id,
      template
    })).map(({id, template}) =>
      template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`).join('');
  }

  /**
   * Возвращает строку, содержащую заголовок и тело таблицы.
   * @param data - массив объектов, которые будут использоваться для создания таблицы
   * @returns Строка HTML-кода.
   */
  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.tableHeader}
        ${this.getTableBody(data)}
      </div>`;
  }

  /**
   * Он создает новый элемент div, присваивает ему отсортированные данные, а затем присваивает первый элемент div свойству
   * element класса.
   */
  render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');
    const sortedData = this.sortData(id, order);

    wrapper.innerHTML = this.getTable(sortedData);

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();
  }

  /**
   * Он добавляет прослушиватель событий к элементу заголовка.
   */
  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  /**
   * Он сортирует массив данных по столбцу с заданным идентификатором в заданном порядке.
   * @param id - имя столбца для сортировки
   * @param order - «по возрастанию» или «по убыванию»
   */
  sortData(id, order) {
    const arr = [...this.data];
    const {sortType, customSorting} = this.headerConfig.find(item => item.id === id);
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      case 'custom':
        return direction * customSorting(a, b);
      default:
        throw new Error(`Unknown sort type ${sortType}`);
      }
    });
  }

  /**
   * Он принимает элемент и возвращает объект со всеми подэлементами этого элемента.
   * @param element - Элемент для поиска подэлементов.
   * @returns Объект с подэлементами элемента.
   */
  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
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
   * Он удаляет элемент из DOM и устанавливает для всех свойств значение null.
   */
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
