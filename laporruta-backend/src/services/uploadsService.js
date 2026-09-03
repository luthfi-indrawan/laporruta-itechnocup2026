const { uploadFile, deleteFiles, getPublicUrl } = require("../config/supabase");
const STORAGE = require("../constants/storagePaths");
const MESSAGES = require("../constants/errorMessages");
const HTTP_STATUS = require("../constants/httpStatus");

class UploadsService {
  async uploadImage(file) {
    const filePath = STORAGE.TEMP_PATH(file.safeFilename);
    await uploadFile("src", filePath, file.buffer, {
      contentType: file.mimetype,
    });
    const imageUrl = getPublicUrl("src", filePath);
    return { image_url: imageUrl, file_path: filePath };
  }

  async deleteImage(filePath) {
    await deleteFiles("src", [filePath]);
    return true;
  }
}

module.exports = new UploadsService();
