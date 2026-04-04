// routes/appointments.js
const express = require('express');
const { query, transaction } = require('../services/dbService');
const authMiddleware = require('../middleware/authMiddleware');
const { log } = require('../services/auditLogger');

const router = express.Router();

// All appointment routes require authentication
router.use(authMiddleware);

/**
 * GET /api/appointments
 * Role-based: patient → own appointments; doctor → own appointments; admin/receptionist → all (tenant)
 */
router.get('/', async (req, res) => {
  const { tenantId, user } = req;

  try {
    let sql, params = [];

    if (user.role === 'patient') {
      sql = `
        SELECT a.*, d.name as doctor_name, p.name as patient_name
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN patients p ON a.patient_id = p.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      params = [user.userId];
    } else if (user.role === 'doctor') {
      sql = `
        SELECT a.*, p.name as patient_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      params = [user.userId];
    } else {
      // admin or receptionist: all appointments in this tenant
      sql = `
        SELECT a.*, d.name as doctor_name, p.name as patient_name
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN patients p ON a.patient_id = p.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
    }

    const rows = await query(tenantId, sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

/**
 * POST /api/appointments
 * Create a new appointment (patients only)
 */
router.post('/', async (req, res) => {
  const { tenantId, user } = req;

  if (user.role !== 'patient') {
    return res.status(403).json({ error: 'Only patients can book appointments' });
  }

  const { doctor_id, appointment_date, appointment_time, reason } = req.body;

  if (!doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the slot is already taken (use transaction)
    const appointmentId = await transaction(tenantId, async (conn) => {
      const [existing] = await conn.execute(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
        [doctor_id, appointment_date, appointment_time]
      );
      if (existing.length > 0) {
        throw new Error('Time slot already booked');
      }

      const [result] = await conn.execute(
        `INSERT INTO appointments 
         (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.userId, doctor_id, appointment_date, appointment_time, 'scheduled', reason || null]
      );
      return result.insertId;
    });

    // Log the action
    await log(tenantId, user.userId, 'CREATE_APPOINTMENT', appointmentId, req.ip, req.headers['user-agent']);

    res.status(201).json({ message: 'Appointment booked', appointmentId });
  } catch (err) {
    if (err.message === 'Time slot already booked') {
      return res.status(409).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

/**
 * PUT /api/appointments/:id
 * Update appointment status (doctor, receptionist, admin)
 */
router.put('/:id', async (req, res) => {
  const { tenantId, user } = req;
  const appointmentId = req.params.id;
  const { status } = req.body;

  if (!['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Only doctor, receptionist, or admin can update status
  if (!['doctor', 'receptionist', 'admin'].includes(user.role)) {
    return res.status(403).json({ error: 'Unauthorized to update appointment status' });
  }

  try {
    // Optional: ensure doctor can only update their own appointments
    if (user.role === 'doctor') {
      const [appt] = await query(tenantId, 'SELECT doctor_id FROM appointments WHERE id = ?', [appointmentId]);
      if (!appt || appt.doctor_id !== user.userId) {
        return res.status(403).json({ error: 'You can only update your own appointments' });
      }
    }

    await query(tenantId, 'UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);
    await log(tenantId, user.userId, 'UPDATE_APPOINTMENT_STATUS', appointmentId, req.ip, req.headers['user-agent']);
    res.json({ message: 'Appointment updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

module.exports = router;