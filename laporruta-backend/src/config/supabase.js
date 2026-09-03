const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Upload a file to a Supabase Storage bucket
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in bucket (e.g., "folder/filename.jpg")
 * @param {Buffer|Blob|File} file - File data
 * @param {Object} options - Upload options (contentType, upsert, etc.)
 * @returns {Promise<Object>} Upload result { data, error }
 */
const uploadFile = async (bucket, path, file, options = {}) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options.contentType || "application/octet-stream",
      upsert: options.upsert || false,
      ...options,
    });

  if (error) throw error;
  return data;
};

/**
 * Get a signed URL for a private file
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Expiration in seconds (default 1 hour)
 */
const getSignedUrl = async (bucket, path, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
};

/**
 * Get public URL for a file in a public bucket
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 */
const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Delete a file from a bucket
 * @param {string} bucket - Bucket name
 * @param {string[]} paths - Array of file paths to delete
 */
const deleteFiles = async (bucket, paths) => {
  const { data, error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
  return data;
};

/**
 * List files in a bucket folder
 * @param {string} bucket - Bucket name
 * @param {string} prefix - Folder prefix (e.g., "avatars/")
 * @param {Object} options - Pagination options
 */
const listFiles = async (bucket, prefix = "", options = {}) => {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: options.limit || 100,
    offset: options.offset || 0,
    ...options,
  });

  if (error) throw error;
  return data;
};

module.exports = {
  supabase,
  uploadFile,
  getSignedUrl,
  getPublicUrl,
  deleteFiles,
  listFiles,
};
