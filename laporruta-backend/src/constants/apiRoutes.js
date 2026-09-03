/**
 * API Route Constants - LaporRuta
 * Base prefix /api/v1 applied at app level
 */
module.exports = {
  // Health
  HEALTH: "/health",

  // Authentication
  AUTH: {
    BASE: "/auth",
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    ACCEPT_INVITATION: "/auth/invitations/accept",
  },

  // Master Data
  MASTER: {
    CATEGORIES: "/master/categories",
    WILAYAH: "/master/wilayah",
  },

  // Public Reports
  REPORTS_PUBLIC: {
    BASE: "/reports/public",
    BY_ID: "/reports/public/:id",
    NEARBY: "/reports/public/nearby",
  },

  // Authenticated Reports (Warga)
  REPORTS: {
    BASE: "/reports",
    MY: "/reports/my",
    MY_BY_ID: "/reports/my/:id",
    DISPUTE: "/reports/:id/dispute",
  },

  // Upvotes
  UPVOTES: {
    BASE: "/reports/:id/upvotes",
    COUNT: "/reports/:id/upvotes/count",
  },

  // Comments
  COMMENTS: {
    BASE: "/reports/:id/comments",
  },

  // Activity Logs
  ACTIVITY_LOGS: {
    BASE: "/reports/:id/activity-logs",
  },

  // Uploads
  UPLOADS: {
    IMAGES: "/uploads/images",
    DELETE_IMAGE: "/uploads/images",
  },

  // Admin Wilayah
  ADMIN_WILAYAH: {
    BASE: "/admin/wilayah",
    REPORTS: "/admin/wilayah/reports",
    PENDING: "/admin/wilayah/reports/pending",
    REPORT_BY_ID: "/admin/wilayah/reports/:id",
    VERIFY: "/admin/wilayah/reports/:id/verify",
    REJECT: "/admin/wilayah/reports/:id/reject",
    STATUS: "/admin/wilayah/reports/:id/status",
    AFTER_IMAGES: "/admin/wilayah/reports/:id/after-images",
    NOTES: "/admin/wilayah/reports/:id/notes",
  },

  // Admin Pusat
  ADMIN_PUSAT: {
    BASE: "/admin/pusat",
    REPORTS: "/admin/pusat/reports",
    ZONELESS: "/admin/pusat/reports/zoneless",
    REPORT_BY_ID: "/admin/pusat/reports/:id",
    OVERRIDE_STATUS: "/admin/pusat/reports/:id/status",
    REASSIGN_ZONE: "/admin/pusat/reports/:id/zone",
    EDIT_REPORT: "/admin/pusat/reports/:id",
    STATS: "/admin/pusat/stats",
    HEATMAP: "/admin/pusat/heatmap",
    EXPORT_CSV: "/admin/pusat/exports/csv",
  },

  // User Management (Admin Pusat)
  USER_MGMT: {
    ADMINS: "/admin/users/admins",
    INVITATIONS: "/admin/users/invitations",
    TOGGLE_STATUS: "/admin/users/:id/status",
    REASSIGN_ZONE: "/admin/users/:id/zone",
    DELETE_ADMIN: "/admin/users/:id",
  },

  // User Presence
  USER_PRESENCE: {
    LAST_SEEN: "/users/last-seen",
  },
};
