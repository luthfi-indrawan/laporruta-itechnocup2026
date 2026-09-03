/**
 * Centralized API Response Messages - LaporRuta
 */
module.exports = {
  AUTH: {
    UNAUTHORIZED: "Tidak terautentikasi",
    FORBIDDEN: "Akses ditolak",
    TOKEN_EXPIRED: "Token sudah kadaluarsa",
    TOKEN_INVALID: "Token tidak valid",
    TOKEN_MISSING: "Akses token tidak ditemukan",
    LOGIN_SUCCESS: "login berhasil",
    LOGOUT_SUCCESS: "logout berhasil",
    REGISTER_SUCCESS: "registrasi berhasil",
    REFRESH_SUCCESS: "token berhasil diperbarui",
    CREDENTIALS_INVALID: "Kredensial tidak valid",
    ACCOUNT_INACTIVE: "Akun dinonaktifkan",
    INVITATION_INVALID: "Link undangan tidak valid atau sudah kadaluarsa",
    INVITATION_SUCCESS: "akun admin berhasil dibuat",
  },

  USER: {
    NOT_FOUND: "Pengguna tidak ditemukan",
    EMAIL_TAKEN: "Email sudah terdaftar",
    INVALID_CREDENTIALS: "Kredensial tidak valid",
    PROFILE_UPDATED: "Profil berhasil diperbarui",
    PASSWORD_CHANGED: "Password berhasil diubah",
    LAST_SEEN_UPDATED: "successfully",
  },

  REPORT: {
    CREATED: "Laporan berhasil dikirim dan sedang menunggu verifikasi admin.",
    NOT_FOUND: "Laporan tidak ditemukan",
    NOT_PUBLIC: "Laporan tidak tersedia untuk publik",
    VERIFY_SUCCESS: "Laporan berhasil diverifikasi",
    REJECT_SUCCESS: "Laporan berhasil ditolak",
    STATUS_UPDATED: "Status laporan berhasil diperbarui",
    ZONE_REASSIGNED: "Zona laporan berhasil dipindahkan",
    OVERRIDE_SUCCESS: "Status laporan di-override",
    DISPUTE_SUCCESS: "Permintaan tinjauan ulang berhasil dikirim",
    ALREADY_RESOLVED: "Laporan sudah selesai",
    INVALID_TRANSITION: "Transisi status tidak valid",
  },

  UPVOTE: {
    TOGGLE_SUCCESS: "successfully",
    NOT_ELIGIBLE: "Laporan belum memenuhi syarat untuk di-upvote",
  },

  COMMENT: {
    CREATED: "Komentar berhasil ditambahkan",
  },

  ADMIN: {
    NOTE_CREATED: "Catatan internal berhasil ditambahkan",
    AFTER_IMAGE_UPLOADED: "Gambar bukti perbaikan berhasil diunggah",
    INVITATION_CREATED: "undangan berhasil dibuat",
    STATUS_TOGGLED: "Status admin berhasil diubah",
    CANNOT_DEACTIVATE_LAST: "Tidak dapat menonaktifkan admin pusat terakhir",
    ZONE_REASSIGNED: "Zona tugas admin berhasil diubah",
  },

  FILE: {
    NO_FILE: "Tidak ada file yang diunggah",
    TOO_LARGE: "Ukuran file melebihi batas maksimum 5MB",
    INVALID_TYPE: "Hanya file JPEG dan PNG yang diizinkan",
    INVALID_MAGIC: "Format file tidak valid",
    UPLOAD_SUCCESS: "gambar berhasil diunggah",
    UPLOAD_FAILED: "Gagal mengunggah file",
    DELETE_SUCCESS: "File berhasil dihapus",
    DELETE_FAILED: "Gagal menghapus file",
  },

  DB: {
    CONNECTION_ERROR: "Koneksi database gagal",
    QUERY_ERROR: "Gagal mengeksekusi query",
    RECORD_NOT_FOUND: "Data tidak ditemukan",
    DUPLICATE_ENTRY: "Data sudah ada",
    FK_VIOLATION: "Data referensi tidak ditemukan",
  },

  VALIDATION: {
    FAILED: "validasi gagal",
    REQUIRED: (field) => `${field} wajib diisi`,
    MIN_LENGTH: (field, min) => `${field} minimal ${min} karakter`,
    MAX_LENGTH: (field, max) => `${field} maksimal ${max} karakter`,
    INVALID_EMAIL: "Format email tidak valid",
    INVALID_UUID: "Format ID tidak valid",
    PASSWORD_MISMATCH: "Password tidak cocok",
  },

  GENERIC: {
    SUCCESS: "successfully",
    CREATED: "Resource berhasil dibuat",
    UPDATED: "Resource berhasil diperbarui",
    DELETED: "Resource berhasil dihapus",
    NOT_FOUND: "Data tidak ditemukan",
    BAD_REQUEST: "Permintaan tidak valid",
    SERVER_ERROR: "Terjadi kesalahan pada server",
    RATE_LIMIT: "Terlalu banyak permintaan, silakan coba lagi nanti",
  },
};
