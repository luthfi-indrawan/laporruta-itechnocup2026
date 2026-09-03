/**
 * Pagination defaults and limits
 */
module.exports = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,

  SORT_ASC: "ASC",
  SORT_DESC: "DESC",
  DEFAULT_SORT_FIELD: "created_at",
  DEFAULT_SORT_ORDER: "DESC",

  // Cursor pagination
  DEFAULT_CURSOR_FIELD: "id",
  DEFAULT_CURSOR_ORDER: "DESC",
};
