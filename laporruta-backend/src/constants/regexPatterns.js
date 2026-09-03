/**
 * Common regex patterns for input validation
 */
module.exports = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  PHONE: /^\+?[1-9]\d{1,14}$/,

  ALPHANUMERIC: /^[a-zA-Z0-9_]+$/,

  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,

  PASSWORD_STRONG:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};
