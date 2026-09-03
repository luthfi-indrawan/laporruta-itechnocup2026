const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

/**
 * Invitations Model - LaporRuta
 * Operasi database untuk tabel `invitations`
 */
class InvitationsModel {
  async create({
    email,
    role,
    assignedWilayahId,
    token,
    expiresAt,
    createdBy,
  }) {
    const result = await query(
      `INSERT INTO ${TABLES.INVITATIONS} (email, role, assigned_wilayah_id, token, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        email.toLowerCase(),
        role,
        assignedWilayahId,
        token,
        expiresAt,
        createdBy,
      ],
    );
    return result.rows[0];
  }

  async findByToken(token) {
    const result = await query(
      `SELECT id, email, role, assigned_wilayah_id, token, expires_at, is_used, created_by
       FROM ${TABLES.INVITATIONS}
       WHERE token = $1 AND is_used = false AND expires_at > NOW()
       LIMIT 1`,
      [token],
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await query(
      `SELECT id, email, role, assigned_wilayah_id, token, expires_at, is_used, created_by, created_at
       FROM ${TABLES.INVITATIONS}
       WHERE email = $1
       ORDER BY created_at DESC`,
      [email.toLowerCase()],
    );
    return result.rows;
  }

  async markUsed(invitationId) {
    await query(
      `UPDATE ${TABLES.INVITATIONS} SET is_used = true WHERE id = $1`,
      [invitationId],
    );
  }

  async findAll({ isUsed, expired, page = 1, limit = 20 }) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filter: used / unused
    if (typeof isUsed === "boolean") {
      conditions.push(`i.is_used = $${paramIndex++}`);
      params.push(isUsed);
    }

    // Filter: expired / active
    if (expired === true) {
      conditions.push(`i.expires_at <= NOW()`);
    } else if (expired === false) {
      conditions.push(`i.expires_at > NOW()`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT 
       i.*,
       u.full_name AS created_by_name
     FROM ${TABLES.INVITATIONS} i
     LEFT JOIN ${TABLES.USERS} u 
       ON i.created_by = u.id
     ${whereClause}
     ORDER BY i.created_at DESC
     LIMIT $${paramIndex++}
     OFFSET $${paramIndex++}`,
      [...params, limit, offset],
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total
     FROM ${TABLES.INVITATIONS} i
     ${whereClause}`,
      params,
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }
}

module.exports = new InvitationsModel();
