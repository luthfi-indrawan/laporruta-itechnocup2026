const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class WilayahModel {
  async findAll({ type, parentId } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (type) {
      conditions.push(`type = $${idx++}`);
      params.push(type);
    }
    if (parentId) {
      conditions.push(`parent_id = $${idx++}`);
      params.push(parentId);
    } else if (parentId === null && !type) {
      conditions.push(`parent_id IS NULL`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await query(
      `SELECT id, parent_id, name, type, code, latitude, longitude, created_at
       FROM ${TABLES.WILAYAH}
       ${where}
       ORDER BY name ASC`,
      params,
    );
    return result.rows;
  }

  async findById(id) {
    const result = await query(
      `SELECT id, parent_id, name, type, code, latitude, longitude
       FROM ${TABLES.WILAYAH}
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findHierarchyById(id) {
    const result = await query(
      `WITH RECURSIVE hierarchy AS (
         SELECT id, parent_id, name, type, code, latitude, longitude, 0 as level
         FROM ${TABLES.WILAYAH}
         WHERE id = $1
         UNION ALL
         SELECT w.id, w.parent_id, w.name, w.type, w.code, w.latitude, w.longitude, h.level + 1
         FROM ${TABLES.WILAYAH} w
         INNER JOIN hierarchy h ON w.id = h.parent_id
       )
       SELECT * FROM hierarchy ORDER BY level DESC`,
      [id],
    );
    return result.rows;
  }
}

module.exports = new WilayahModel();
