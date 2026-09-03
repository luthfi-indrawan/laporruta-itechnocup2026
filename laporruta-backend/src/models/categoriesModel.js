const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class CategoriesModel {
  async findAll() {
    const result = await query(
      `SELECT id, name, color, urgency_weight, icon, description, created_at
       FROM ${TABLES.CATEGORIES}
       ORDER BY urgency_weight DESC, name ASC`,
    );
    return result.rows;
  }

  async findById(id) {
    const result = await query(
      `SELECT id, name, color, urgency_weight, icon, description
       FROM ${TABLES.CATEGORIES}
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    return result.rows[0] || null;
  }
}

module.exports = new CategoriesModel();
