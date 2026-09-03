const ResponseHelper = require("../utils/responseHelper");
const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

/**
 * Zone Authorization Middleware - LaporRuta
 * Memastikan admin wilayah hanya bisa akses laporan di zona tugasnya.
 * Dipasang SETELAH authMiddleware + roleMiddleware.
 *
 * Usage:
 *   router.patch("/:id/verify",
 *     authMiddleware,
 *     roleMiddleware("admin_wilayah"),
 *     authorizeZone,
 *     controller.verify
 *   );
 */
const authorizeZone = async (req, res, next) => {
  try {
    const { id: reportId } = req.params;
    const { id: userId, role, assigned_wilayah_id } = req.user;

    // Admin Pusat bypass zone check
    if (role === "admin_pusat") {
      return next();
    }

    // Admin Wilayah harus punya assigned_wilayah_id
    if (role === "admin_wilayah" && !assigned_wilayah_id) {
      return ResponseHelper.forbidden(
        res,
        "Admin wilayah tidak memiliki zona tugas",
      );
    }

    // Ambil wilayah_id dari laporan
    const result = await query(
      `SELECT wilayah_id FROM ${TABLES.REPORTS} WHERE id = $1`,
      [reportId],
    );

    if (result.rows.length === 0) {
      const error = new Error("Laporan tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const reportWilayahId = result.rows[0].wilayah_id;

    // Cek apakah laporan berada di zona tugas admin
    if (reportWilayahId !== assigned_wilayah_id) {
      return ResponseHelper.forbidden(
        res,
        "Anda tidak memiliki akses ke laporan di zona ini",
      );
    }

    // Attach report wilayah ke req untuk digunakan di controller
    req.reportWilayahId = reportWilayahId;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Zone Authorization untuk bulk query (list/filter)
 * Otomatis inject WHERE wilayah_id = assigned_wilayah_id ke query params
 * Usage: router.get("/reports", authMiddleware, roleMiddleware("admin_wilayah"), injectZoneFilter, controller.getReports);
 */
const injectZoneFilter = (req, res, next) => {
  try {
    const { role, assigned_wilayah_id } = req.user;

    // Admin Pusat: tidak ada filter zona (lihat semua)
    if (role === "admin_pusat") {
      return next();
    }

    // Admin Wilayah: wajib filter zona
    if (role === "admin_wilayah") {
      if (!assigned_wilayah_id) {
        return ResponseHelper.forbidden(
          res,
          "Admin wilayah tidak memiliki zona tugas",
        );
      }
      req.query.wilayah_id = assigned_wilayah_id;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorizeZone,
  injectZoneFilter,
};
