/**
 * Supabase Storage Path Patterns - LaporRuta
 */
module.exports = {
  PATH_SEPARATOR: "/",

  // Report images
  REPORTS_PREFIX: "reports/",
  /** @param {string} reportId */
  /** @param {string} filename */
  REPORT_PATH: (reportId, filename) => `reports/${reportId}/${filename}`,

  // Temporary uploads (pre-report)
  TEMP_PREFIX: "temp/",
  TEMP_PATH: (filename) => `temp/${filename}`,

  // User avatars (future use)
  AVATAR_PREFIX: "avatars/",
  AVATAR_PATH: (userId, filename) => `avatars/${userId}/${filename}`,

  // After-fix images
  AFTER_PREFIX: (reportId) => `reports/${reportId}/after/`,
  AFTER_PATH: (reportId, filename) => `reports/${reportId}/after/${filename}`,
};
