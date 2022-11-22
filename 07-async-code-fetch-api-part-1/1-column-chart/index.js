import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.label = label;
    this.link = link;
    this.range = range;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  /**
   * Он принимает массив объектов и возвращает сумму значений каждого объекта.
   * @param data - Объект данных, который передается компоненту.
   * @returns Сумма всех значений в объекте.
   */
  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((acc, current) => acc + current), 0);
  }

  /**
   * Он берет объект данных, находит максимальное значение, а затем возвращает строку HTML-элементов, представляющих
   * данные.
   * @param data - Объект данных, содержащий данные для отображения.
   * @returns Массив строк.
   */
  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));

    return Object.entries(data).map(([key, value]) => {
      const scale = this.chartHeight / maxValue;
      const percent = (value / maxValue * 100).toFixed(0);
      const tooltip = `
        <span>
          <strong>${key}${percent}</strong>
        </span>
      `;

      return `
        <div
         style="--value: ${Math.floor(value * scale)}"
         data-tooltip="${tooltip}%"
        ></div>
      `;
    }).join('');
  }

  /**
   * Если свойство ссылки определено, верните тег привязки со свойством ссылки в качестве атрибута href и текстом
   * «Просмотреть все» внутри тега. В противном случае вернуть пустую строку
   * @returns Свойство ссылки объекта.
   */
  getLink() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  /**
   * Возвращает строку, содержащую HTML-код диаграммы.
   * @returns Строка HTML-кода.
   */
  get bodyDocument() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
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

  remove () {
    return this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

  /**
   * Он принимает две даты, устанавливает их в качестве параметров URL, извлекает данные с сервера, обновляет заголовок и
   * тело диаграммы и возвращает данные.
   * @param from - дата начала периода
   * @param to - Дата окончания диапазона.
   * @returns Данные возвращаются.
   */
  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    this.range.from = from;
    this.range.to = to;

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumnProps(data);

      this.element.classList.remove('column-chart_loading');
    }

    this.data = data;

    return this.data;
  }

  /**
   * Он создает новый элемент div, присваивает его innerHTML значение свойства bodyDocument, а затем присваивает свойству
   * element значение первого дочернего элемента только что созданного элемента div.
   */
  render() {
    const element = document.createElement('div');

    element.innerHTML = this.bodyDocument;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }
}
