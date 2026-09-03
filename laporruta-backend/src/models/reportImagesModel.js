const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class ReportImagesModel {
  async create({ reportId, imageUrl, filePath, isAfter = false }, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO ${TABLES.REPORT_IMAGES} (report_id, image_url, file_path, is_after)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [reportId, imageUrl, filePath, isAfter],
    );
    return result.rows[0];
  }

  async findByReportId(reportId) {
    const result = await query(
      `SELECT id, image_url, file_path, is_after, created_at
       FROM ${TABLES.REPORT_IMAGES}
       WHERE report_id = $1
       ORDER BY is_after ASC, created_at ASC`,
      [reportId],
    );
    return result.rows;
  }

  async findByReportIds(reportIds) {
    const result = await query(
      `SELECT id, report_id, image_url, file_path, is_after, created_at
       FROM ${TABLES.REPORT_IMAGES}
       WHERE report_id = ANY($1)
       ORDER BY created_at ASC`,
      [reportIds],
    );
    return result.rows;
  }

  async deleteByFilePaths(filePaths, client) {
    const q = client ? client.query.bind(client) : query;
    await q(`DELETE FROM ${TABLES.REPORT_IMAGES} WHERE file_path = ANY($1)`, [
      filePaths,
    ]);
  }
}

module.exports = new ReportImagesModel();
