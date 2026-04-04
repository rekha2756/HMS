// services/auditLogger.js
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;

async function getAuditPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.TENANT_REGISTRY_DB || 'tenant_registry',
      connectionLimit: 2,
      waitForConnections: true,
    });
  }
  return pool;
}

/**
 * Log an action to the central audit log table.
 * @param {string} tenantId
 * @param {number|string} userId
 * @param {string} action
 * @param {string} resourceId
 * @param {string} ip
 * @param {string} userAgent
 */
async function log(tenantId, userId, action, resourceId, ip, userAgent) {
  try {
    const pool = await getAuditPool();
    await pool.execute(
      `INSERT INTO audit_logs 
       (tenant_id, user_id, action, resource_id, ip, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [tenantId, userId, action, resourceId, ip, userAgent]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
    // Fail silently – don't break the main request
  }
}

module.exports = { log };