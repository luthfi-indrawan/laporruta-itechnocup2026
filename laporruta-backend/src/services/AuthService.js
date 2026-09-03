const bcrypt = require("bcrypt");
const crypto = require("crypto");
const usersModel = require("../models/usersModel");
const refreshTokensModel = require("../models/refreshTokensModel");
const invitationsModel = require("../models/invitationsModel");
const jwtHelper = require("../utils/jwtHelper");
const MESSAGES = require("../constants/errorMessages");
const TIME = require("../constants/timeConstants");
const ROLES = require("../constants/userRoles");

/**
 * Auth Service - LaporRuta
 * Business logic untuk autentikasi
 */
class AuthService {
  // Register

  async register({ fullName, email, password, confirmPassword }) {
    if (password !== confirmPassword) {
      const err = new Error(MESSAGES.VALIDATION.PASSWORD_MISMATCH);
      err.statusCode = 400;
      throw err;
    }

    const isTaken = await usersModel.isEmailTaken(email);
    if (isTaken) {
      const err = new Error(MESSAGES.AUTH.EMAIL_TAKEN);
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await usersModel.create({
      email,
      passwordHash,
      fullName,
      role: ROLES.USER,
      assignedWilayahId: null,
      isActive: true,
    });

    const accessToken = jwtHelper.generateAccessToken(user);
    const refreshToken = jwtHelper.generateRefreshToken();
    const tokenHash = jwtHelper.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + TIME.TTL.JWT_REFRESH_MS);

    await refreshTokensModel.store(user.id, tokenHash, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Login

  async login({ email, password }) {
    const user = await usersModel.findByEmail(email);

    if (!user) {
      const err = new Error(MESSAGES.AUTH.CREDENTIALS_INVALID);
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const err = new Error(MESSAGES.AUTH.CREDENTIALS_INVALID);
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error(MESSAGES.AUTH.ACCOUNT_INACTIVE);
      err.statusCode = 403;
      throw err;
    }

    const accessToken = jwtHelper.generateAccessToken({
      id: user.id,
      role: user.role,
      assigned_wilayah_id: user.assigned_wilayah_id,
    });

    const refreshToken = jwtHelper.generateRefreshToken();
    const tokenHash = jwtHelper.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + TIME.TTL.JWT_REFRESH_MS);

    await refreshTokensModel.store(user.id, tokenHash, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        assigned_wilayah_id: user.assigned_wilayah_id,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh Token

  async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      const err = new Error(MESSAGES.AUTH.TOKEN_MISSING);
      err.statusCode = 401;
      throw err;
    }

    const tokenHash = jwtHelper.hashRefreshToken(rawRefreshToken);
    const tokenRecord = await refreshTokensModel.findByHash(tokenHash);

    if (!tokenRecord) {
      const err = new Error(MESSAGES.AUTH.TOKEN_INVALID);
      err.statusCode = 401;
      throw err;
    }

    if (!tokenRecord.is_active) {
      const err = new Error(MESSAGES.AUTH.ACCOUNT_INACTIVE);
      err.statusCode = 403;
      throw err;
    }

    // Rotate: hapus old, buat new
    await refreshTokensModel.deleteByHash(tokenHash);

    const newRefreshToken = jwtHelper.generateRefreshToken();
    const newTokenHash = jwtHelper.hashRefreshToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + TIME.TTL.JWT_REFRESH_MS);

    await refreshTokensModel.store(
      tokenRecord.user_id,
      newTokenHash,
      expiresAt,
    );

    const accessToken = jwtHelper.generateAccessToken({
      id: tokenRecord.user_id,
      role: tokenRecord.role,
      assigned_wilayah_id: tokenRecord.assigned_wilayah_id,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  // Logout

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = jwtHelper.hashRefreshToken(rawRefreshToken);
      await refreshTokensModel.deleteByHash(tokenHash);
    }
  }

  // Get Current User

  async getCurrentUser(userId) {
    const user = await usersModel.findById(userId);

    if (!user) {
      const err = new Error(MESSAGES.USER.NOT_FOUND);
      err.statusCode = 404;
      throw err;
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      assigned_wilayah_id: user.assigned_wilayah_id,
      assigned_wilayah_name: user.assigned_wilayah_name,
      last_seen_at: user.last_seen_at,
    };
  }

  // Accept Invitation

  async acceptInvitation({ token, fullName, password, confirmPassword }) {
    if (password !== confirmPassword) {
      const err = new Error(MESSAGES.VALIDATION.PASSWORD_MISMATCH);
      err.statusCode = 400;
      throw err;
    }

    const invitation = await invitationsModel.findByToken(token);
    if (!invitation) {
      const err = new Error(MESSAGES.AUTH.INVITATION_INVALID);
      err.statusCode = 400;
      throw err;
    }

    const isTaken = await usersModel.isEmailTaken(invitation.email);
    if (isTaken) {
      const err = new Error(MESSAGES.USER.EMAIL_TAKEN);
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await usersModel.create({
      email: invitation.email,
      passwordHash,
      fullName,
      role: invitation.role,
      assignedWilayahId: invitation.assigned_wilayah_id,
      isActive: true,
    });

    await invitationsModel.markUsed(invitation.id);

    const accessToken = jwtHelper.generateAccessToken(user);
    const refreshToken = jwtHelper.generateRefreshToken();
    const tokenHash = jwtHelper.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + TIME.TTL.JWT_REFRESH_MS);

    await refreshTokensModel.store(user.id, tokenHash, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        assigned_wilayah_id: user.assigned_wilayah_id,
      },
      accessToken,
      refreshToken,
    };
  }
}

module.exports = new AuthService();
