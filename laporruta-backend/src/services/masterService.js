const categoriesModel = require("../models/categoriesModel");
const wilayahModel = require("../models/wilayahModel");
const MESSAGES = require("../constants/errorMessages");

class MasterService {
  async getCategories() {
    return categoriesModel.findAll();
  }

  async getWilayah({ type, parent_id }) {
    return wilayahModel.findAll({ type, parentId: parent_id });
  }
}

module.exports = new MasterService();
