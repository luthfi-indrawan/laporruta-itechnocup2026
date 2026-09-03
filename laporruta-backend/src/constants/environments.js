/**
 * Environment constants and helper functions
 */
const ENV = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
  TEST: "test",
};

module.exports = {
  ...ENV,

  isDev: () => process.env.NODE_ENV === ENV.DEVELOPMENT,
  isStaging: () => process.env.NODE_ENV === ENV.STAGING,
  isProd: () => process.env.NODE_ENV === ENV.PRODUCTION,
  isTest: () => process.env.NODE_ENV === ENV.TEST,

  getCurrent: () => process.env.NODE_ENV || ENV.DEVELOPMENT,
};
