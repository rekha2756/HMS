
const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../services/dbService');
const { log } = require('../services/auditLogger');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  // Only allow users with role 'super_admin'
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { subdomain, hospitalName, adminEmail, adminPassword } = req.body;

  if (!subdomain || !hospitalName || !adminEmail || !adminPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  
  if (!/^[a-z0-9_]+$/.test(subdomain)) {
    return res.status(400).json({ error: 'Invalid subdomain. Use only lowercase letters, numbers, underscore.' });
  }

  const schemaName = subdomain;

  try {
    
    await query('', `CREATE DATABASE ${schemaName}`); // Use a special connection without db name
    console.log(`Created database: ${schemaName}`);

   
    const tables = ['admin', 'patients', 'doctors', 'appointments', 'bills', 'payments', 'prescriptions', 'lab_reports'];
    for (const table of tables) {
      await query(schemaName, `CREATE TABLE IF NOT EXISTS ${table} LIKE hms_template.${table}`);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await query(schemaName,
      `INSERT INTO admin (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Super Admin', adminEmail, hashedPassword, 'admin']
    );

  
    const registryPool = require('../services/auditLogger').getAuditPool(); // might need a separate function
    // Actually, you'd have a tenants table in the registry DB
    await registryPool.execute(
      `INSERT INTO tenants (subdomain, schema_name, hospital_name, created_at) VALUES (?, ?, ?, NOW())`,
      [subdomain, schemaName, hospitalName]
    );

    res.json({ message: 'Tenant created successfully', subdomain, schemaName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

module.exports = router;
