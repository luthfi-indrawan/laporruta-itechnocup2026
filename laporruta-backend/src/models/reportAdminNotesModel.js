const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class ReportAdminNotesModel {
  async create({ reportId, adminId, note }, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO ${TABLES.REPORT_ADMIN_NOTES} (report_id, admin_id, note)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [reportId, adminId, note],
    );
    return result.rows[0];
  }

  async findByReportId(reportId) {
    const result = await query(
      `SELECT n.id, n.note, n.created_at, n.updated_at,
              u.full_name as admin_name
       FROM ${TABLES.REPORT_ADMIN_NOTES} n
       JOIN ${TABLES.USERS} u ON n.admin_id = u.id
       WHERE n.report_id = $1
       ORDER BY n.created_at DESC`,
      [reportId],
    );
    return result.rows;
  }
}

module.exports = new ReportAdminNotesModel();
