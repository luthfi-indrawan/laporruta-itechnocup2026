const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class CommentsModel {
  async findByReportId(reportId, { page, limit }) {
    const offset = (page - 1) * limit;

    const result = await query(
      `
    SELECT
      c.id,
      c.text,
      c.created_at,

      json_build_object(
        'full_name', u.full_name
      ) AS user

    FROM ${TABLES.COMMENTS} c

    INNER JOIN ${TABLES.USERS} u
      ON u.id = c.user_id

    WHERE c.report_id = $1

    ORDER BY c.created_at DESC

    LIMIT $2
    OFFSET $3
    `,
      [reportId, limit, offset],
    );

    const countResult = await query(
      `
    SELECT COUNT(*) AS total
    FROM ${TABLES.COMMENTS}
    WHERE report_id = $1
    `,
      [reportId],
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  async create({ reportId, userId, text }, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO ${TABLES.COMMENTS} (report_id, user_id, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [reportId, userId, text],
    );
    return result.rows[0];
  }

  async getCountForReport({ reportId }) {
    const countResult = await query(
      `
    SELECT COUNT(*) AS total
    FROM ${TABLES.COMMENTS}
    WHERE report_id = $1
    `,
      [reportId],
    );

    return parseInt(countResult.rows[0].total, 10);
  }
}

module.exports = new CommentsModel();
