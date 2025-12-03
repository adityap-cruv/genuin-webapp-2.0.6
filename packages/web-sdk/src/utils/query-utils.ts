export const queryUtils = {
  _getParams: () => new URLSearchParams(window.location.search),

  getAll: () => Object.fromEntries(queryUtils._getParams()),
  get: (key: string) => queryUtils._getParams().get(key),
  has: (key: string) => queryUtils._getParams().has(key),
  getMultiple: (key: string) => queryUtils._getParams().getAll(key),
}
