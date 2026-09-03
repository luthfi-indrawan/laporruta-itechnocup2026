const crypto = require("crypto");
const usersModel = require("../models/usersModel");
const invitationsModel = require("../models/invitationsModel");
const refreshTokensModel = require("../models/refreshTokensModel");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");
const TIME = require("../constants/timeConstants");

class UserMgmtService {
  async getAdminList({ role, is_active, page, limit }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    return usersModel.findAdmins({
      role,
      isActive: is_active,
      page: pageNum,
      limit: limitNum,
    });
  }

  async createInvitation(createdBy, { email, role, assigned_wilayah_id }) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TIME.TTL.INVITATION_MS);

    const invitation = await invitationsModel.create({
      email,
      role,
      assignedWilayahId: assigned_wilayah_id || null,
      token,
      expiresAt,
      createdBy,
    });

    return {
      invitation_id: invitation.id,
      token: invitation.token,
      invite_url: `${process.env.FRONTEND_URL}/accept-invitation?token=${invitation.token}`,
      expires_at: invitation.expires_at,
    };
  }

  async getInvitations({ is_used, expired, page, limit }) {
    const parseBoolean = (value) => {
      if (value === "true" || value === true) return true;
      if (value === "false" || value === false) return false;
      return undefined;
    };
    return invitationsModel.findAll({
      isUsed: parseBoolean(is_used),
      expired: parseBoolean(expired),
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
  }

  async toggleAdminStatus(adminId, isActive) {
    const target = await usersModel.findById(adminId);
    if (!target || target.role === "user") {
      const err = new Error(MESSAGES.USER.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    if (!isActive && target.role === "admin_pusat") {
      const count = await usersModel.countActiveAdminPusat(adminId);
      if (count === 0) {
        const err = new Error(MESSAGES.ADMIN.CANNOT_DEACTIVATE_LAST);
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
      }
    }

    const updated = await usersModel.updateActiveStatus(adminId, isActive);
    if (!isActive) {
      await refreshTokensModel.deleteAllByUser(adminId);
    }

    return updated;
  }

  async reassignAdminZone(adminId, wilayahId) {
    const target = await usersModel.findById(adminId);
    if (!target || target.role !== "admin_wilayah") {
      const err = new Error(MESSAGES.USER.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    return usersModel.updateAssignedWilayah(adminId, wilayahId);
  }

  async deleteAdmin(adminId) {
    const target = await usersModel.findById(adminId);
    if (!target || target.role === "user") {
      const err = new Error(MESSAGES.USER.NOT_FOUND);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    if (target.role === "admin_pusat") {
      const count = await usersModel.countActiveAdminPusat(adminId);
      if (count === 0) {
        const err = new Error(MESSAGES.ADMIN.CANNOT_DEACTIVATE_LAST);
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
      }
    }

    await refreshTokensModel.deleteAllByUser(adminId);
    return usersModel.deleteById(adminId);
  }
}

module.exports = new UserMgmtService();
