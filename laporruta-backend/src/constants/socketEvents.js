/**
 * WebSocket Event Constants - LaporRuta
 */
module.exports = {
  // ─── Room Names ───
  ROOMS: {
    PUBLIC_REPORTS: "public:reports",
    ADMIN_PUSAT: "admin:pusat",
    /** @param {string} wilayahId */
    ADMIN_WILAYAH: (wilayahId) => `admin:${wilayahId}`,
    /** @param {string} reportId */
    REPORT: (reportId) => `report:${reportId}`,
  },

  // ─── Client → Server Events ───
  CLIENT: {
    JOIN_PUBLIC: "join:public",
    JOIN_ADMIN: "join:admin",
    LEAVE_ROOM: "leave:room",
    PING: "ping",
  },

  // ─── Server → Client Events ───
  SERVER: {
    // Connection
    CONNECTED: "connected",
    PONG: "pong",
    CONNECTION_STATUS: "connection:status",

    // Report lifecycle
    REPORT_VERIFIED: "report:verified",
    REPORT_STATUS_CHANGED: "report:status_changed",
    REPORT_NEW: "report:new",
    REPORT_UPVOTE_CHANGED: "report:upvote_changed",
    REPORT_ZONE_REASSIGNED: "report:zone_reassigned",

    // Admin notifications
    ADMIN_REPORT_ASSIGNED: "admin:report_assigned",
    ADMIN_OVERRIDE_PERFORMED: "admin:override_performed",
  },

  // ─── Internal / System ───
  SYSTEM: {
    DISCONNECT: "disconnect",
    HEARTBEAT: "heartbeat",
    RECONNECT: "reconnect",
    CONNECTION_ERROR: "connection_error",
  },
};
