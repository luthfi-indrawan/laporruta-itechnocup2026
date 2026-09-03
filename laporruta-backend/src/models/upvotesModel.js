const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class UpvotesModel {
  async findByReportAndUser(reportId, userId, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `SELECT id FROM ${TABLES.UPVOTES} WHERE report_id = $1 AND user_id = $2 LIMIT 1`,
      [reportId, userId],
    );
    return result.rows[0] || null;
  }

  async create(reportId, userId, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO ${TABLES.UPVOTES} (report_id, user_id) VALUES ($1, $2) RETURNING *`,
      [reportId, userId],
    );
    return result.rows[0];
  }

  async delete(reportId, userId, client) {
    const q = client ? client.query.bind(client) : query;
    await q(
      `DELETE FROM ${TABLES.UPVOTES} WHERE report_id = $1 AND user_id = $2`,
      [reportId, userId],
    );
  }

  async countByReportId(reportId) {
    const result = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.UPVOTES} WHERE report_id = $1`,
      [reportId],
    );
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new UpvotesModel();
