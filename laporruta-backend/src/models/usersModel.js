const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

/**
 * Users Model - LaporRuta
 * Operasi database untuk tabel `users`
 */
class UsersModel {
  async findByEmail(email) {
    const result = await query(
      `SELECT id, email, password_hash, full_name, role, assigned_wilayah_id, is_active, last_seen_at, created_at, updated_at
       FROM ${TABLES.USERS}
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase()],
    );
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await query(
      `SELECT 
       u.id,
       u.email,
       u.full_name,
       u.role,
       u.assigned_wilayah_id,
       w.name AS assigned_wilayah_name,
       u.is_active,
       u.last_seen_at,
       u.created_at,
       u.updated_at
     FROM ${TABLES.USERS} u
     LEFT JOIN ${TABLES.WILAYAH} w
       ON w.id = u.assigned_wilayah_id
     WHERE u.id = $1
     LIMIT 1`,
      [id],
    );

    return result.rows[0] || null;
  }

  async create({
    email,
    passwordHash,
    fullName,
    role = "user",
    assignedWilayahId = null,
    isActive = true,
  }) {
    const result = await query(
      `INSERT INTO ${TABLES.USERS} (email, password_hash, full_name, role, assigned_wilayah_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role, assigned_wilayah_id, is_active, created_at`,
      [
        email.toLowerCase(),
        passwordHash,
        fullName,
        role,
        assignedWilayahId,
        isActive,
      ],
    );
    return result.rows[0];
  }

  async updateLastSeen(userId) {
    const result = await query(
      `UPDATE ${TABLES.USERS}
       SET last_seen_at = NOW()
       WHERE id = $1
       RETURNING last_seen_at`,
      [userId],
    );
    return result.rows[0];
  }

  async isEmailTaken(email) {
    const result = await query(
      `SELECT 1 FROM ${TABLES.USERS} WHERE email = $1 LIMIT 1`,
      [email.toLowerCase()],
    );
    return result.rows.length > 0;
  }

  async countActiveAdminPusat(excludeId = null) {
    let sql = `SELECT COUNT(*) as count FROM ${TABLES.USERS} WHERE role = 'admin_pusat' AND is_active = true`;
    const params = [];
    if (excludeId) {
      sql += ` AND id != $1`;
      params.push(excludeId);
    }
    const result = await query(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  async updateActiveStatus(userId, isActive) {
    const result = await query(
      `UPDATE ${TABLES.USERS} SET is_active = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId, isActive],
    );
    return result.rows[0];
  }

  async updateAssignedWilayah(userId, wilayahId) {
    const result = await query(
      `UPDATE ${TABLES.USERS} SET assigned_wilayah_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId, wilayahId],
    );
    return result.rows[0];
  }

  async deleteById(userId) {
    const result = await query(
      `DELETE FROM ${TABLES.USERS} WHERE id = $1 AND role != 'user' RETURNING id`,
      [userId],
    );
    return result.rowCount > 0;
  }

  async findAdmins({ role, isActive, page = 1, limit = 20 }) {
    const conditions = ["role != 'user'"];
    const params = [];
    let paramIndex = 1;

    if (role) {
      conditions.push(`role = $${paramIndex++}`);
      params.push(role);
    }
    if (typeof isActive === "boolean") {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(isActive);
    }

    const whereClause = conditions.join(" AND ");
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, email, full_name, role, assigned_wilayah_id, is_active, last_seen_at, created_at
       FROM ${TABLES.USERS}
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset],
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM ${TABLES.USERS} WHERE ${whereClause}`,
      params,
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }
}

module.exports = new UsersModel();
