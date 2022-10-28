/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} [arr=[]] arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr = [], param = 'asc') {
  const { compare } = new Intl.Collator('ru', { caseFirst: 'upper' });

  return [...arr].sort((first, second) => (param === 'desc' ? -1 : 1) * compare(first, second));
}
