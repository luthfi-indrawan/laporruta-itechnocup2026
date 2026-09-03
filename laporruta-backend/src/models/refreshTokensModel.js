const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

/**
 * Refresh Tokens Model - LaporRuta
 * Operasi database untuk tabel `refresh_tokens`
 */
class RefreshTokensModel {
  async store(userId, tokenHash, expiresAt) {
    await query(
      `INSERT INTO ${TABLES.REFRESH_TOKENS} (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt],
    );
  }

  async findByHash(tokenHash) {
    const result = await query(
      `SELECT rt.*, u.is_active, u.role, u.assigned_wilayah_id
       FROM ${TABLES.REFRESH_TOKENS} rt
       JOIN ${TABLES.USERS} u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [tokenHash],
    );
    return result.rows[0] || null;
  }

  async deleteByHash(tokenHash) {
    await query(`DELETE FROM ${TABLES.REFRESH_TOKENS} WHERE token_hash = $1`, [
      tokenHash,
    ]);
  }

  async deleteAllByUser(userId) {
    await query(`DELETE FROM ${TABLES.REFRESH_TOKENS} WHERE user_id = $1`, [
      userId,
    ]);
  }

  async cleanupExpired() {
    const result = await query(
      `DELETE FROM ${TABLES.REFRESH_TOKENS} WHERE expires_at <= NOW() RETURNING id`,
    );
    return result.rowCount;
  }
}

module.exports = new RefreshTokensModel();
