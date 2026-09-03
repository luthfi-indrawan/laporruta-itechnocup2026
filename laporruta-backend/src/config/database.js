const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT, 10),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: parseInt(process.env.PG_MAX_CONNECTIONS, 10) || 20,
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT, 10) || 30000,
  connectionTimeoutMillis:
    parseInt(process.env.PG_CONNECTION_TIMEOUT, 10) || 2000,
});

// Test connection on startup
pool.on("connect", () => {
  console.log("[PostgreSQL] New client connected to the pool");
});

pool.on("error", (err) => {
  console.error("[PostgreSQL] Unexpected pool error:", err.message);
  process.exit(-1);
});

/**
 * Execute a query with optional parameter values
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(
      `[PostgreSQL] Query executed in ${duration}ms: ${text.substring(0, 50)}...`,
    );
    return result;
  } catch (error) {
    console.error("[PostgreSQL] Query error:", error.message);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<PoolClient>}
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalRelease = client.release.bind(client);

  // Override release to log it
  client.release = () => {
    console.log("[PostgreSQL] Client released back to pool");
    originalRelease();
  };

  return client;
};

// Gracefully close the pool
const closePool = async () => {
  console.log("[PostgreSQL] Closing connection pool...");
  await pool.end();
  console.log("[PostgreSQL] Pool closed");
};

module.exports = {
  pool,
  query,
  getClient,
  closePool,
};
