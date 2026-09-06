const { Server } = require("socket.io");
const { SOCKET_EVENTS } = require("../constants");

/**
 * Socket.io Manager - LaporRuta
 * Room Architecture:
 *   - public:reports     → Semua client (termasuk guest)
 *   - admin:{wilayah_id} → Admin Wilayah zona tertentu
 *   - admin:pusat        → Admin Pusat
 *   - report:{id}        → User yang buka detail laporan X
 */
class SocketManager {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.io server
   * @param {http.Server} server - HTTP server instance
   */
  init(server) {
    this.io = new Server(server, {
      path: process.env.WS_PATH || "/ws",
      cors: {
        origin: process.env.CORS_ORIGIN || "https://laporruta.netlify.app",
        credentials: true,
      },
      // Fallback: long-polling → websocket
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.on("connection", this.handleConnection.bind(this));

    console.log(
      `[Socket.io] Server running on path: ${process.env.WS_PATH || "/ws"}`,
    );
  }

  handleConnection(socket) {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Kirim status koneksi ke client
    socket.emit(SOCKET_EVENTS.SERVER.CONNECTION_STATUS, {
      connected: true,
      clientId: socket.id,
      timestamp: new Date().toISOString(),
    });

    // ─── Client → Server Event Handlers ───

    // Bergabung ke room publik
    socket.on(SOCKET_EVENTS.CLIENT.JOIN_PUBLIC, () => {
      socket.join(SOCKET_EVENTS.ROOMS.PUBLIC_REPORTS);
      console.log(`[Socket.io] ${socket.id} joined room: public:reports`);
      socket.emit(SOCKET_EVENTS.SERVER.CONNECTED, {
        room: SOCKET_EVENTS.ROOMS.PUBLIC_REPORTS,
      });
    });

    // Bergabung ke room admin
    socket.on(SOCKET_EVENTS.CLIENT.JOIN_ADMIN, ({ type, wilayah_id }) => {
      let room;
      if (type === "wilayah" && wilayah_id) {
        room = SOCKET_EVENTS.ROOMS.ADMIN_WILAYAH(wilayah_id);
      } else if (type === "pusat") {
        room = SOCKET_EVENTS.ROOMS.ADMIN_PUSAT;
      } else {
        socket.emit(SOCKET_EVENTS.SERVER.CONNECTION_STATUS, {
          connected: false,
          error: "Invalid admin type or missing wilayah_id",
        });
        return;
      }

      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room: ${room}`);
      socket.emit(SOCKET_EVENTS.SERVER.CONNECTED, { room });
    });

    // Bergabung ke room report spesifik (detail laporan)
    socket.on("join:report", ({ report_id }) => {
      if (!report_id) {
        socket.emit(SOCKET_EVENTS.SERVER.CONNECTION_STATUS, {
          connected: false,
          error: "report_id is required",
        });
        return;
      }
      const room = SOCKET_EVENTS.ROOMS.REPORT(report_id);
      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room: ${room}`);
      socket.emit(SOCKET_EVENTS.SERVER.CONNECTED, { room });
    });

    // Keluar dari room tertentu
    socket.on(SOCKET_EVENTS.CLIENT.LEAVE_ROOM, ({ room }) => {
      if (room) {
        socket.leave(room);
        console.log(`[Socket.io] ${socket.id} left room: ${room}`);
      }
    });

    // Ping-pong keep-alive
    socket.on(SOCKET_EVENTS.CLIENT.PING, () => {
      socket.emit(SOCKET_EVENTS.SERVER.PONG, {
        timestamp: Date.now(),
      });
    });

    // Disconnect handler
    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket.io] Client disconnected: ${socket.id} | Reason: ${reason}`,
      );
    });

    // Error handler
    socket.on("error", (err) => {
      console.error(`[Socket.io] ${socket.id} error:`, err.message);
    });
  }

  // ─── Server → Client Broadcast Helpers ───

  /**
   * Broadcast ke room publik: laporan baru terverifikasi
   * @param {Object} reportData
   */
  emitReportVerified(reportData) {
    this.io
      .to(SOCKET_EVENTS.ROOMS.PUBLIC_REPORTS)
      .emit(SOCKET_EVENTS.SERVER.REPORT_VERIFIED, reportData);
  }

  /**
   * Broadcast perubahan status laporan
   * @param {Object} payload { report_id, status, old_status, updated_at }
   * @param {string[]} additionalRooms - extra rooms selain public
   */
  emitReportStatusChanged(payload, additionalRooms = []) {
    const rooms = [SOCKET_EVENTS.ROOMS.PUBLIC_REPORTS, ...additionalRooms];
    rooms.forEach((room) => {
      this.io
        .to(room)
        .emit(SOCKET_EVENTS.SERVER.REPORT_STATUS_CHANGED, payload);
    });
  }

  /**
   * Broadcast laporan baru masuk ke antrian admin
   * @param {string} wilayahId
   * @param {Object} reportData
   */
  emitAdminReportAssigned(wilayahId, reportData) {
    const room = SOCKET_EVENTS.ROOMS.ADMIN_WILAYAH(wilayahId);
    this.io
      .to(room)
      .emit(SOCKET_EVENTS.SERVER.ADMIN_REPORT_ASSIGNED, reportData);
  }

  /**
   * Broadcast ke admin pusat (zoneless / fallback)
   * @param {Object} reportData
   */
  emitAdminPusatReportAssigned(reportData) {
    this.io
      .to(SOCKET_EVENTS.ROOMS.ADMIN_PUSAT)
      .emit(SOCKET_EVENTS.SERVER.ADMIN_REPORT_ASSIGNED, reportData);
  }

  /**
   * Broadcast perubahan upvote
   * @param {string} reportId
   * @param {Object} payload { upvote_count, has_upvoted }
   */
  emitUpvoteChanged(reportId, payload) {
    const rooms = [
      SOCKET_EVENTS.ROOMS.PUBLIC_REPORTS,
      SOCKET_EVENTS.ROOMS.REPORT(reportId),
    ];
    rooms.forEach((room) => {
      this.io.to(room).emit(SOCKET_EVENTS.SERVER.REPORT_UPVOTE_CHANGED, {
        report_id: reportId,
        ...payload,
      });
    });
  }

  /**
   * Broadcast laporan baru muncul di peta publik
   * @param {Object} reportData
   */
  emitReportNew(reportData) {
    this.io
      .to(SOCKET_EVENTS.ROOMS.PUBLIC_REPORTS)
      .emit(SOCKET_EVENTS.SERVER.REPORT_NEW, reportData);
  }

  /**
   * Broadcast zone reassignment
   * @param {string} oldWilayahId
   * @param {string} newWilayahId
   * @param {Object} payload
   */
  emitZoneReassigned(oldWilayahId, newWilayahId, payload) {
    const rooms = [
      SOCKET_EVENTS.ROOMS.ADMIN_WILAYAH(oldWilayahId),
      SOCKET_EVENTS.ROOMS.ADMIN_WILAYAH(newWilayahId),
      SOCKET_EVENTS.ROOMS.ADMIN_PUSAT,
    ];
    rooms.forEach((room) => {
      this.io
        .to(room)
        .emit(SOCKET_EVENTS.SERVER.REPORT_ZONE_REASSIGNED, payload);
    });
  }

  /**
   * Broadcast override oleh admin pusat
   * @param {Object} payload
   */
  emitOverridePerformed(payload) {
    this.io
      .to(SOCKET_EVENTS.ROOMS.ADMIN_PUSAT)
      .emit(SOCKET_EVENTS.SERVER.ADMIN_OVERRIDE_PERFORMED, payload);
  }

  /**
   * Emit ke socket/client spesifik
   * @param {string} socketId
   * @param {string} event
   * @param {Object} payload
   */
  emitToSocket(socketId, event, payload) {
    this.io.to(socketId).emit(event, payload);
  }

  /**
   * Get connected clients stats
   * @returns {Object}
   */
  getStats() {
    if (!this.io) return { totalClients: 0 };
    return {
      totalClients: this.io.engine.clientsCount,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()).filter(
        (r) => !this.io.sockets.sockets.has(r), // exclude socket IDs
      ),
    };
  }

  /**
   * Graceful shutdown
   */
  async close() {
    if (!this.io) {
      return;
    }

    console.log("[Socket.io] Closing connections...");

    this.io.close();

    this.io = null;

    console.log("[Socket.io] Server closed");
  }
}

module.exports = new SocketManager();
