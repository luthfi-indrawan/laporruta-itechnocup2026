const socketManager = require("../config/socket");
const { SOCKET_EVENTS } = require("../constants");

/**
 * Socket Broadcast Helper - LaporRuta
 * Wrapper agar service layer tidak import socket manager secara langsung.
 * Semua broadcast real-time dilakukan via helper ini.
 */

/**
 * Broadcast: Laporan baru terverifikasi → publik & admin
 * @param {Object} reportData
 */
const broadcastReportVerified = (reportData) => {
  socketManager.emitReportVerified(reportData);
};

/**
 * Broadcast: Status laporan berubah
 * @param {Object} payload { report_id, status, old_status, updated_at, wilayah_id, is_override }
 */
const broadcastReportStatusChanged = (payload) => {
  const additionalRooms = [];
  if (payload.wilayah_id) {
    additionalRooms.push(SOCKET_EVENTS.ROOMS.ADMIN_WILAYAH(payload.wilayah_id));
  }
  additionalRooms.push(SOCKET_EVENTS.ROOMS.ADMIN_PUSAT);

  socketManager.emitReportStatusChanged(payload, additionalRooms);
};

/**
 * Broadcast: Laporan baru masuk antrian admin
 * Trigger: Setelah create report (auto-assignment)
 * @param {string} wilayahId
 * @param {Object} reportData
 * @param {boolean} isZoneless - true jika tidak ada admin wilayah aktif
 */
const broadcastNewReportAssigned = (
  wilayahId,
  reportData,
  isZoneless = false,
) => {
  if (isZoneless) {
    socketManager.emitAdminPusatReportAssigned(reportData);
  } else {
    socketManager.emitAdminReportAssigned(wilayahId, reportData);
  }
};

/**
 * Broadcast: Upvote toggle
 * @param {string} reportId
 * @param {number} upvoteCount
 * @param {boolean} hasUpvoted
 */
const broadcastUpvoteChanged = (reportId, upvoteCount, hasUpvoted) => {
  socketManager.emitUpvoteChanged(reportId, {
    upvote_count: upvoteCount,
    has_upvoted: hasUpvoted,
  });
};

/**
 * Broadcast: Laporan baru muncul di peta publik (setelah verified)
 * @param {Object} reportData
 */
const broadcastReportNew = (reportData) => {
  socketManager.emitReportNew(reportData);
};

/**
 * Broadcast: Zone reassignment oleh admin pusat
 * @param {string} oldWilayahId
 * @param {string} newWilayahId
 * @param {Object} payload
 */
const broadcastZoneReassigned = (oldWilayahId, newWilayahId, payload) => {
  socketManager.emitZoneReassigned(oldWilayahId, newWilayahId, payload);
};

/**
 * Broadcast: Override oleh admin pusat
 * @param {Object} payload
 */
const broadcastOverridePerformed = (payload) => {
  socketManager.emitOverridePerformed(payload);
};

/**
 * Get socket stats (for health/monitoring)
 * @returns {Object}
 */
const getSocketStats = () => {
  return socketManager.getStats();
};

module.exports = {
  broadcastReportVerified,
  broadcastReportStatusChanged,
  broadcastNewReportAssigned,
  broadcastUpvoteChanged,
  broadcastReportNew,
  broadcastZoneReassigned,
  broadcastOverridePerformed,
  getSocketStats,
};
