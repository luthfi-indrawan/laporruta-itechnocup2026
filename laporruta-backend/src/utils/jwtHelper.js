const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");
const TIME = require("../constants/timeConstants");

/**
 * JWT & Refresh Token Helper - LaporRuta
 * Architecture:
 *   - Access Token: JWT (HS256), 7 hari, payload: { sub, role, assigned_wilayah_id }
 *   - Refresh Token: Random string 256-bit, SHA-256 hash disimpan di DB, 30 hari
 *   - Rotation: Saat refresh, old token dihapus, new token diterbitkan
 */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN || TIME.TTL.JWT_ACCESS;
const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || TIME.TTL.JWT_REFRESH;

if (!JWT_SECRET) {
  console.error("[JWT] JWT_SECRET tidak ditemukan di environment");
  process.exit(1);
}

// ─── Access Token ───

/**
 * Generate JWT access token
 * @param {Object} user - { id, role, assigned_wilayah_id }
 * @returns {string} accessToken
 */
const generateAccessToken = (user) => {
  const payload = {
    sub: user.id,
    role: user.role,
    assigned_wilayah_id: user.assigned_wilayah_id || null,
    jti: crypto.randomUUID(), // unique token ID untuk tracking (opsional)
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    algorithm: "HS256",
  });
};

/**
 * Verifikasi JWT access token
 * @param {string} token
 * @returns {Object} decoded payload
 * @throws {Error} TokenExpiredError | JsonWebTokenError
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
};

// ─── Refresh Token ───

/**
 * Generate raw refresh token (256-bit random string, hex encoded)
 * @returns {string} rawToken
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash raw refresh token dengan SHA-256
 * @param {string} rawToken
 * @returns {string} hash
 */
const hashRefreshToken = (rawToken) => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

/**
 * Simpan refresh token hash ke database
 * @param {string} userId
 * @param {string} tokenHash
 * @param {Date} expiresAt
 */
const storeRefreshToken = async (userId, tokenHash, expiresAt) => {
  await query(
    `INSERT INTO ${TABLES.REFRESH_TOKENS} (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
};

/**
 * Cari refresh token di database berdasarkan hash
 * @param {string} tokenHash
 * @returns {Object|null} token record
 */
const findRefreshToken = async (tokenHash) => {
  const result = await query(
    `SELECT rt.*, u.is_active, u.role, u.assigned_wilayah_id
     FROM ${TABLES.REFRESH_TOKENS} rt
     JOIN ${TABLES.USERS} u ON rt.user_id = u.id
     WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
    [tokenHash],
  );
  return result.rows[0] || null;
};

/**
 * Hapus refresh token dari database (logout / rotation)
 * @param {string} tokenHash
 */
const deleteRefreshToken = async (tokenHash) => {
  await query(`DELETE FROM ${TABLES.REFRESH_TOKENS} WHERE token_hash = $1`, [
    tokenHash,
  ]);
};

/**
 * Hapus semua refresh token milik user (force logout saat deactivate admin)
 * @param {string} userId
 */
const deleteAllUserRefreshTokens = async (userId) => {
  await query(`DELETE FROM ${TABLES.REFRESH_TOKENS} WHERE user_id = $1`, [
    userId,
  ]);
};

/**
 * Rotate refresh token: hapus old, buat new, simpan new
 * @param {string} oldTokenHash
 * @param {string} userId
 * @returns {Object} { rawToken, tokenHash, expiresAt }
 */
const rotateRefreshToken = async (oldTokenHash, userId) => {
  // Hapus token lama
  await deleteRefreshToken(oldTokenHash);

  // Buat token baru
  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);
  const expiresAt = new Date(Date.now() + TIME.TTL.JWT_REFRESH_MS);

  // Simpan token baru
  await storeRefreshToken(userId, tokenHash, expiresAt);

  return { rawToken, tokenHash, expiresAt };
};

/**
 * Full login token generation: access + refresh
 * @param {Object} user - { id, role, assigned_wilayah_id }
 * @returns {Object} { accessToken, refreshToken, expiresAt }
 */
const generateTokenPair = async (user) => {
  const accessToken = generateAccessToken(user);

  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);
  const expiresAt = new Date(Date.now() + TIME.TTL.JWT_REFRESH_MS);

  await storeRefreshToken(user.id, tokenHash, expiresAt);

  return {
    accessToken,
    refreshToken: rawToken,
    expiresAt,
  };
};

/**
 * Set refresh token cookie di response
 * @param {Response} res - Express response
 * @param {string} refreshToken
 */
const setRefreshCookie = (res, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd, // true di production (HTTPS)
    sameSite: isProd ? "strict" : "lax",
    maxAge: TIME.TTL.JWT_REFRESH_MS, // 7 hari
    path: "/",
  });
};

/**
 * Clear refresh token cookie (logout)
 * @param {Response} res - Express response
 */
const clearRefreshCookie = (res) => {
  res.cookie("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
    expires: new Date(0),
  });
};

/**
 * Cleanup expired refresh tokens (background job / cron)
 */
const cleanupExpiredTokens = async () => {
  const result = await query(
    `DELETE FROM ${TABLES.REFRESH_TOKENS} WHERE expires_at <= NOW() RETURNING id`,
  );
  if (result.rowCount > 0) {
    console.log(`[JWT] Cleaned up ${result.rowCount} expired refresh tokens`);
  }
  return result.rowCount;
};

module.exports = {
  // Access Token
  generateAccessToken,
  verifyAccessToken,

  // Refresh Token
  generateRefreshToken,
  hashRefreshToken,
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  rotateRefreshToken,

  // Token Pair
  generateTokenPair,

  // Cookie
  setRefreshCookie,
  clearRefreshCookie,

  // Cleanup
  cleanupExpiredTokens,
};
