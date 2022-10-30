/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arrString = path.split('.');

  return (obj) => {
    if (!obj[arrString[0]]) {
      return;
    }

    let newObj = {};

    arrString.forEach((item, index) => index > 0 ? newObj = newObj[item] : newObj = obj[item]);

    return newObj;
  };
}
