const uploadsService = require("../services/uploadsService");
const ResponseHelper = require("../utils/responseHelper");
const MESSAGES = require("../constants/errorMessages");

class UploadsController {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        const err = new Error(MESSAGES.FILE.NO_FILE);
        err.statusCode = 400;
        throw err;
      }

      const result = await uploadsService.uploadImage(req.file);
      ResponseHelper.created(res, MESSAGES.FILE.UPLOAD_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { file_path } = req.body;
      if (!file_path) {
        const err = new Error("file_path wajib diisi");
        err.statusCode = 400;
        throw err;
      }

      await uploadsService.deleteImage(file_path);
      ResponseHelper.success(res, MESSAGES.FILE.DELETE_SUCCESS);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadsController();
