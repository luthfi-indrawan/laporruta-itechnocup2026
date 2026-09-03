const usersModel = require("../models/usersModel");

class UserPresenceService {
  async updateLastSeen(userId) {
    const result = await usersModel.updateLastSeen(userId);
    return { last_seen_at: result.last_seen_at };
  }
}

module.exports = new UserPresenceService();
