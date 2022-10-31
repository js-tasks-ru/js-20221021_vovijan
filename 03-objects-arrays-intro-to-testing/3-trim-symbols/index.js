/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }

  if (string === '') {
    return '';
  }

  const sizeStr = (a, b) => a.slice(0, b);

  const arrStr = [...string];

  const resultArr = [];
  let str = '';

  /* Перебор массива символов. */
  arrStr.forEach((item, index) => {
    /* Это условие, которое проверяет, является ли строка пустой или последний символ строки равен текущему символу. Если
    условие истинно, то в строку добавляется текущий символ. */
    if ((str.length === 0) || (str.slice(-1) === item)) {
      str = str.concat(item);
    }

    /* Это условие проверяет, не равен ли последний символ строки текущему символу. Если условие истинно, то в строку
    добавляется текущий символ. */
    if (str.slice(-1) !== item) {
      resultArr.push(sizeStr(str, size));
      str = item;
    }

    /* Это условие, которое проверяет, является ли текущий символ последним символом строки. Если условие истинно, то в
    строку добавляется текущий символ. */
    if (arrStr.length === index + 1) {
      resultArr.push(sizeStr(str, size));
    }
  });

  return resultArr.join('');
}
