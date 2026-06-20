export const normalizeQueryParams = (params = {}) => Object.fromEntries(
  Object.entries(params).map(([key, value]) => [
    key,
    typeof value === 'boolean' ? (value ? 1 : 0) : value,
  ]),
)
