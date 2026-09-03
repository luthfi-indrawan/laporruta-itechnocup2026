/**
 * Time-related Constants - LaporRuta
 * Semua dalam seconds dan milliseconds
 */
module.exports = {
  // Seconds
  SECONDS: {
    ONE_MINUTE: 60,
    FIVE_MINUTES: 300,
    FIFTEEN_MINUTES: 900,
    ONE_HOUR: 3600,
    SIX_HOURS: 21600,
    ONE_DAY: 86400,
    ONE_WEEK: 604800,
    THIRTY_DAYS: 2592000,
  },

  // Milliseconds
  MILLISECONDS: {
    ONE_SECOND: 1000,
    ONE_MINUTE: 60000,
    FIVE_MINUTES: 300000,
    FIFTEEN_MINUTES: 900000,
    ONE_HOUR: 3600000,
    ONE_DAY: 86400000,
    ONE_WEEK: 604800000,
  },

  // Application-specific TTLs
  TTL: {
    JWT_ACCESS: "15m", // Access token: 15 menit
    JWT_ACCESS_MS: 900000, // 15 menit dalam ms
    JWT_REFRESH: "7d", // Refresh token: 7 hari
    JWT_REFRESH_MS: 604800000, // 7 hari dalam ms
    INVITATION: "24h", // Undangan admin: 24 jam
    INVITATION_MS: 86400000, // 24 jam dalam ms
    SIGNED_URL: 3600, // Supabase signed URL: 1 jam
    PASSWORD_RESET: 900, // Reset password: 15 menit
    EMAIL_VERIFICATION: 86400, // Verifikasi email: 24 jam
    CACHE_DEFAULT: 300, // Cache default: 5 menit
    SESSION: 86400, // Session: 24 jam
  },

  // Cron expressions (for reference / node-cron)
  CRON: {
    EVERY_MINUTE: "* * * * *",
    EVERY_5_MINUTES: "*/5 * * * *",
    EVERY_HOUR: "0 * * * *",
    EVERY_DAY_AT_MIDNIGHT: "0 0 * * *",
    EVERY_WEEK: "0 0 * * 0",
    CLEANUP_EXPIRED_TOKENS: "0 2 * * *", // Jam 2 pagi
  },
};
