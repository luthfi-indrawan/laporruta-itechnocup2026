const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class DisputesModel {
  async create(
    { reportId, userId, reason, status = "flagged_for_review" },
    client,
  ) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO ${TABLES.DISPUTES} (report_id, user_id, reason, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [reportId, userId, reason, status],
    );
    return result.rows[0];
  }

  async findByReportId(reportId) {
    const result = await query(
      `SELECT d.*, u.full_name
       FROM ${TABLES.DISPUTES} d
       JOIN ${TABLES.USERS} u ON d.user_id = u.id
       WHERE d.report_id = $1
       ORDER BY d.created_at DESC`,
      [reportId],
    );
    return result.rows;
  }
}

module.exports = new DisputesModel();
