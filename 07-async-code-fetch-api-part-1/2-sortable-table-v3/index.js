import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  /* Функция, которая вызывается, когда пользователь щелкает заголовок таблицы. */
  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };


  /* Это функция, которая загружает данные, когда пользователь прокручивает страницу вниз. */
  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);

      this.update(data);

      this.loading = false;
    }
  }

  /**
   * Функция-конструктор принимает два аргумента: первый — массив объектов, содержащий конфигурацию заголовков, а второй —
   * объект, содержащий URL-адрес, отсортированный, isSortLocally, шаг, начало и конец.
   * @param [headersConfig] - массив объектов, описывающих заголовки таблицы. Каждый объект имеет следующие свойства:
   * @param [] - headersConfig — массив объектов, описывающих заголовки таблицы. Каждый объект имеет следующие свойства:
   */
  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }

  /**
   * Он создает элемент таблицы, загружает данные и отображает строки.
   */
  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.table;

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  /**
   * Он принимает идентификатор, порядок, начало и конец, устанавливает параметры поиска URL, добавляет класс к элементу,
   * извлекает данные и удаляет класс из элемента.
   * @param id - имя столбца для сортировки
   * @param order - по возрастанию или по убыванию
   * @param [start] - первый элемент данных для отображения
   * @param [end] - количество элементов, которые будут отображаться на странице
   * @returns Данные возвращаются.
   */
  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url); // 10s, 20s...

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  /**
   * Он принимает массив данных и устанавливает innerHTML тела таблицы в результат вызова функции getTableRows с этими
   * данными.
   * @param data - Данные, которые необходимо добавить в таблицу.
   */
  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  /**
   * Он берет массив данных, добавляет его к существующим данным, а затем добавляет новые строки в тело таблицы.
   * @param data - массив объектов, которые будут добавлены в таблицу.
   */
  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  /**
   * Он возвращает строку, содержащую div с атрибутом элемента данных, равным заголовку, атрибутом класса, равным
   * sortable-table__header sortable-table__row, и строку, содержащую результат вызова функции getHeaderRow для каждого
   * элемента в массиве headersConfig.
   * @returns Заголовок таблицы.
   */
  get tableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  /**
   * Он возвращает строку, представляющую строку заголовка таблицы.
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
      </div>`;
  }

  /**
   * Он принимает массив объектов и возвращает строку HTML-кода.
   * @param data - массив объектов, которые мы хотим отобразить в таблице
   */
  getTableRows(data) {
    return data.map(item => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getTableRow(item)}
      </a>`
    ).join('');
  }

  /**
   * Он принимает элемент и возвращает строку HTML, представляющую строку таблицы.
   * @param item - объект, который содержит данные для текущей строки
   * @returns Строка HTML
   */
  getTableRow(item) {
    return this.headersConfig.map(({id, template}) => ({
      id,
      template
    })).map(({id, template}) =>
      template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`).join('');
  }

  /**
   * Он возвращает строку, содержащую заголовок таблицы, тело таблицы, строку загрузки и пустой заполнитель.
   * @returns Стол возвращается.
   */
  get table() {
    return `
      <div class="sortable-table">
        ${this.tableHeader}
        ${this.getTableBody(this.data)}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }

  /**
   * «Когда пользователь щелкает заголовок, вызывайте функцию onSortClick. Когда пользователь прокручивает окно, вызывайте
   * функцию onWindowScroll».
   *
   * Первая строка функции такова:
   */
  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);

    window.addEventListener('scroll', this.onWindowScroll);
  }

  /**
   * Он сортирует данные, а затем обновляет тело таблицы новыми данными.
   * @param id - идентификатор столбца, на который нажали
   * @param order - «по возрастанию» или «по убыванию»
   */
  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  /**
   * «Отсортируйте данные на сервере и отобразите первую страницу результатов».
   *
   * Функция начинается с вычисления начального и конечного значений для первой страницы результатов. Затем он вызывает
   * функцию loadData() для загрузки данных с сервера. Наконец, он вызывает функцию renderRows() для отображения первой
   * страницы результатов.
   * @param id - идентификатор столбца для сортировки
   * @param order - порядок сортировки (по возрастанию или убыванию)
   */
  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  /**
   * Если массив данных не пустой, удалите класс sortable-table_empty из элемента table и добавьте строки в таблицу, иначе
   * добавьте класс sortable-table_empty в элемент table
   * @param data - массив объектов, содержащих данные для отображения в таблице.
   */
  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  /**
   * Он сортирует массив данных по идентификатору столбца в порядке, указанном параметром порядка.
   * @param id - имя столбца для сортировки
   * @param order - «по возрастанию» или «по убыванию»
   * @returns возврат arr.sort((a, b) => {
   *     переключатель (sortType) {
   *     номер дела':
   *       направление возврата * (a[id] - b[id]);
   *     случай 'строка':
   *       направление возврата * a[id].localeCompare(b[id], 'ru');
   *     случай «на заказ»:
   *       обратное направление *
   */
  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);

    const {sortType, customSorting} = column;
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
        return direction * (a[id] - b[id]);
      }
    });
  }

  /**
   * Он принимает элемент и возвращает объект со всеми подэлементами этого элемента.
   * @param element - Элемент, подэлементы которого мы будем искать.
   * @returns Объект с ключами, являющимися атрибутом элемента данных, и значениями, являющимися элементами.
   */
  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;

    document.removeEventListener('scroll', this.onWindowScroll);
  }
}
