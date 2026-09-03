// Allowed MIME types for file uploads
module.exports = {
  IMAGES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],

  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],

  VIDEOS: ["video/mp4", "video/webm", "video/ogg"],

  AUDIO: ["audio/mpeg", "audio/ogg", "audio/wav"],

  // Convenience groups
  ALL_IMAGES_AND_DOCS: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  // File size limits in bytes
  MAX_FILE_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    DEFAULT: 5 * 1024 * 1024, // 5MB
  },
};
