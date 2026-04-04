// services/dbService.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Cache of connection pools (one pool per tenant schema)
const pools = new Map();

/**
 * Get or create a connection pool for a specific tenant (schema).
 * @param {string} tenantId - The database/schema name (e.g., 'hospital_a')
 * @returns {Promise<mysql.Pool>}
 */
async function getTenantPool(tenantId) {
  if (!tenantId) {
    throw new Error('Tenant ID is required to get a database connection');
  }

  if (!pools.has(tenantId)) {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: tenantId,               // <-- connects to the tenant's schema
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test the connection
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log(`✅ Connected to tenant database: ${tenantId}`);
    } catch (err) {
      console.error(`❌ Failed to connect to tenant ${tenantId}:`, err.message);
      throw err;
    }

    pools.set(tenantId, pool);
  }

  return pools.get(tenantId);
}

/**
 * Get a single connection from the tenant's pool (useful for transactions).
 * @param {string} tenantId
 * @returns {Promise<mysql.PoolConnection>}
 */
async function getTenantConnection(tenantId) {
  const pool = await getTenantPool(tenantId);
  return pool.getConnection();
}

/**
 * Execute a query on a tenant's database.
 * @param {string} tenantId
 * @param {string} sql - SQL query (use ? placeholders)
 * @param {Array} params - Values for placeholders
 * @returns {Promise<any>} - Query result rows
 */
async function query(tenantId, sql, params = []) {
  const pool = await getTenantPool(tenantId);
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Execute a transaction (multiple queries that commit or rollback together).
 * @param {string} tenantId
 * @param {Function} callback - Async function that receives a connection
 * @returns {Promise<any>} - Result of the callback
 */
async function transaction(tenantId, callback) {
  const conn = await getTenantConnection(tenantId);
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Close all connection pools (useful for graceful shutdown).
 */
async function closeAllPools() {
  const closePromises = [];
  for (const [tenantId, pool] of pools.entries()) {
    closePromises.push(pool.end());
    console.log(`Closed pool for tenant: ${tenantId}`);
  }
  await Promise.all(closePromises);
  pools.clear();
}

// Optional: If you still want a default export for quick migration,
// but better to use named exports.
module.exports = {
  getTenantPool,
  getTenantConnection,
  query,
  transaction,
  closeAllPools,
};