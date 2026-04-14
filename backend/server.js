require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const tenantMiddleware = require("./middleware/tenant");
const rateLimiter = require("./middleware/rateLimiter");
const { query, transaction } = require("./services/dbService");

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.tenantId = "hospital_a";
  next();
});
app.use(rateLimiter);

// ==================== AUTH ROUTES ====================
app.use('/api/auth', require('./routes/auth'));
const authMiddleware = require("./middleware/authMiddleware");

// ==================== ADMIN PROFILE ====================
app.get("/api/admin/profile", authMiddleware, async (req, res) => {
  try {
    const users = await query(req.tenantId, "SELECT id, name, email, phone, role, is_active FROM admin WHERE id = ?", [req.user.userId]);
    if (users.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      phone: users[0].phone || "",
      department: "Hospital Management",
      address: "Chennai, Tamil Nadu, India",
      role: users[0].role || "Admin",
      is_active: users[0].is_active
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/profile", authMiddleware, async (req, res) => {
  const { name, phone } = req.body;
  try {
    await query(req.tenantId, "UPDATE admin SET name = ?, phone = ? WHERE id = ?", [name, phone, req.user.userId]);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DOCTOR PROFILE ====================
app.get("/api/doctor/profile", authMiddleware, async (req, res) => {
  try {
    const doctors = await query(req.tenantId, 
      `SELECT d.*, a.email as admin_email 
       FROM doctors d 
       JOIN admin a ON d.user_id = a.id OR d.email = a.email
       WHERE d.user_id = ? OR d.email = (SELECT email FROM admin WHERE id = ?)`,
      [req.user.userId, req.user.userId]);
    if (doctors.length > 0) {
      res.json({
        id: doctors[0].id,
        name: doctors[0].name,
        specialization: doctors[0].specialization,
        experience: doctors[0].experience,
        phone: doctors[0].phone,
        email: doctors[0].email,
        hospital: doctors[0].hospital || "City Hospital",
        consultation_fee: doctors[0].consultation_fee,
        rating: doctors[0].rating,
        patients_count: doctors[0].patients_count,
        about: doctors[0].about || "Experienced doctor with excellent patient care."
      });
    } else {
      const user = await query(req.tenantId, "SELECT name, email FROM admin WHERE id = ?", [req.user.userId]);
      res.json({
        name: user[0]?.name || "Doctor",
        specialization: "General Medicine",
        experience: "5 years",
        phone: "",
        email: user[0]?.email || "",
        hospital: "City Hospital",
        consultation_fee: 800,
        rating: 4.5,
        patients_count: 0,
        about: "Dedicated to providing quality healthcare."
      });
    }
  } catch (err) {
    console.error("Doctor profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/doctor/profile", authMiddleware, async (req, res) => {
  const { name, specialization, experience, phone, email, hospital, about, consultation_fee } = req.body;
  try {
    const existing = await query(req.tenantId, "SELECT id FROM doctors WHERE user_id = ? OR email = ?", 
      [req.user.userId, email || req.user.email]);
    if (existing.length > 0) {
      await query(req.tenantId,
        `UPDATE doctors SET name=?, specialization=?, experience=?, phone=?, email=?, hospital=?, about=?, consultation_fee=?, updated_at=NOW()
         WHERE user_id=? OR id=?`,
        [name, specialization, experience, phone, email, hospital, about || "", consultation_fee, req.user.userId, existing[0].id]);
    } else {
      await query(req.tenantId,
        `INSERT INTO doctors (user_id, name, specialization, experience, phone, email, hospital, about, consultation_fee, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [req.user.userId, name, specialization, experience, phone, email, hospital, about || "", consultation_fee]);
    }
    if (name) await query(req.tenantId, "UPDATE admin SET name = ? WHERE id = ?", [name, req.user.userId]);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Doctor profile update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== USERS MANAGEMENT ====================
app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const users = await query(req.tenantId, `
      SELECT id, name, email, phone, role, 
             CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END as status,
             created_at FROM admin ORDER BY id DESC`);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users", authMiddleware, async (req, res) => {
  const { name, email, role, password, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO admin (name, email, password, phone, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())";
    const result = await query(req.tenantId, sql, [name, email, hashedPassword, phone, role]);
    res.json({ id: result.insertId, message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const isActive = status === 'Active' ? 1 : 0;
    await query(req.tenantId, "UPDATE admin SET is_active = ? WHERE id = ?", [isActive, id]);
    res.json({ message: `User ${status.toLowerCase()}d successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM admin WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== HOSPITALS ====================
app.get("/api/hospitals", authMiddleware, async (req, res) => {
  try {
    const hospitals = await query(req.tenantId, "SELECT * FROM hospitals ORDER BY created_at DESC");
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/hospitals", authMiddleware, async (req, res) => {
  const { hospital_name, address, city, contact_number, email } = req.body;
  try {
    const sql = "INSERT INTO hospitals (hospital_name, address, city, contact_number, email, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    const result = await query(req.tenantId, sql, [hospital_name, address, city, contact_number, email]);
    res.json({ id: result.insertId, message: "Hospital added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/hospitals/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { hospital_name, address, city, contact_number, email } = req.body;
  try {
    await query(req.tenantId, "UPDATE hospitals SET hospital_name=?, address=?, city=?, contact_number=?, email=? WHERE id=?", 
      [hospital_name, address, city, contact_number, email, id]);
    res.json({ message: "Hospital updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/hospitals/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM hospitals WHERE id = ?", [id]);
    res.json({ message: "Hospital deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DOCTORS ====================
app.get("/api/doctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await query(req.tenantId, "SELECT * FROM doctors ORDER BY id DESC");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/doctors", authMiddleware, async (req, res) => {
  const { name, specialization, phone, email, experience, consultation_fee, hospital, about } = req.body;
  try {
    const sql = "INSERT INTO doctors (name, specialization, phone, email, experience, consultation_fee, hospital, about, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    const result = await query(req.tenantId, sql, [name, specialization, phone, email, experience, consultation_fee, hospital || "", about || ""]);
    res.json({ id: result.insertId, message: "Doctor added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: Allow updating is_available (partial update)
app.put("/api/doctors/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, specialization, phone, email, experience, consultation_fee, hospital, about, is_available } = req.body;
  try {
    const updates = [];
    const values = [];
    if (name !== undefined) { updates.push("name = ?"); values.push(name); }
    if (specialization !== undefined) { updates.push("specialization = ?"); values.push(specialization); }
    if (phone !== undefined) { updates.push("phone = ?"); values.push(phone); }
    if (email !== undefined) { updates.push("email = ?"); values.push(email); }
    if (experience !== undefined) { updates.push("experience = ?"); values.push(experience); }
    if (consultation_fee !== undefined) { updates.push("consultation_fee = ?"); values.push(consultation_fee); }
    if (hospital !== undefined) { updates.push("hospital = ?"); values.push(hospital); }
    if (about !== undefined) { updates.push("about = ?"); values.push(about); }
    if (is_available !== undefined) { updates.push("is_available = ?"); values.push(is_available); }
    if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });
    values.push(id);
    const sql = `UPDATE doctors SET ${updates.join(", ")} WHERE id = ?`;
    await query(req.tenantId, sql, values);
    res.json({ message: "Doctor updated successfully" });
  } catch (err) {
    console.error("Doctor update error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/doctors/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM doctors WHERE id = ?", [id]);
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PATIENTS ====================
app.get("/api/patients", authMiddleware, async (req, res) => {
  try {
    const patients = await query(req.tenantId, "SELECT * FROM patients ORDER BY id DESC");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/patients", authMiddleware, async (req, res) => {
  const { name, age, gender, phone, email, address, date_of_birth, blood_group, user_id } = req.body;
  try {
    const sql = "INSERT INTO patients (name, age, gender, phone, email, address, date_of_birth, blood_group, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    const result = await query(req.tenantId, sql, [name, age, gender, phone, email, address, date_of_birth, blood_group, user_id]);
    res.json({ id: result.insertId, message: "Patient added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/patients/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, age, gender, phone, email, address, date_of_birth, blood_group, user_id } = req.body;
  try {
    await query(req.tenantId, "UPDATE patients SET name=?, age=?, gender=?, phone=?, email=?, address=?, date_of_birth=?, blood_group=?, user_id=? WHERE id=?", 
      [name, age, gender, phone, email, address, date_of_birth, blood_group, user_id, id]);
    res.json({ message: "Patient updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/patients/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM patients WHERE id = ?", [id]);
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PATIENT PROFILE (using user_id) ====================
app.get("/api/patient/profile", authMiddleware, async (req, res) => {
  try {
    const patient = await query(req.tenantId, "SELECT * FROM patients WHERE user_id = ?", [req.user.userId]);
    if (!patient.length) {
      return res.status(404).json({ error: "Patient profile not found. Please contact hospital administrator." });
    }
    res.json(patient[0]);
  } catch (err) {
    console.error("Patient profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/patient/profile", authMiddleware, async (req, res) => {
  const { name, age, gender, phone, email, address, blood_group } = req.body;
  try {
    await query(req.tenantId,
      `UPDATE patients SET name = ?, age = ?, gender = ?, phone = ?, email = ?, address = ?, blood_group = ? WHERE user_id = ?`,
      [name, age, gender, phone, email, address, blood_group, req.user.userId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== APPOINTMENTS (with patient filtering) ====================
app.get("/api/appointments", authMiddleware, async (req, res) => {
  try {
    let doctorId = null, patientId = null;
    if (req.user.role === 'doctor') {
      const doctorResult = await query(req.tenantId, "SELECT id FROM doctors WHERE user_id = ?", [req.user.userId]);
      if (doctorResult.length) doctorId = doctorResult[0].id;
      else return res.json([]);
    } else if (req.user.role === 'patient') {
      const patient = await query(req.tenantId, "SELECT id FROM patients WHERE user_id = ?", [req.user.userId]);
      if (patient.length) patientId = patient[0].id;
    }
    let sql, params;
    if (doctorId) {
      sql = `SELECT a.*, p.name as patient_name, d.name as doctor_name FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             WHERE a.doctor_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [doctorId];
    } else if (patientId) {
      sql = `SELECT a.*, p.name as patient_name, d.name as doctor_name FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [patientId];
    } else {
      sql = `SELECT a.*, p.name as patient_name, d.name as doctor_name FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [];
    }
    const appointments = await query(req.tenantId, sql, params);
    res.json(appointments);
  } catch (err) {
    console.error("Appointments fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/appointments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `SELECT a.*, p.name as patient_name, d.name as doctor_name
                 FROM appointments a
                 LEFT JOIN patients p ON a.patient_id = p.id
                 LEFT JOIN doctors d ON a.doctor_id = d.id
                 WHERE a.id = ?`;
    const appointments = await query(req.tenantId, sql, [id]);
    if (!appointments.length) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointments[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATED: Send email confirmation after booking
app.post("/api/appointments", authMiddleware, async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, status, reason, patient_name, doctor_name } = req.body;
  try {
    let sql, params;
    if (patient_id && doctor_id) {
      sql = `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`;
      params = [patient_id, doctor_id, appointment_date, appointment_time, status || 'Pending', reason];
    } 
    else if (patient_name && doctor_name) {
      sql = `INSERT INTO appointments (patient_name, doctor_name, appointment_date, appointment_time, status, reason, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`;
      params = [patient_name, doctor_name, appointment_date, appointment_time, status || 'Pending', reason];
    } 
    else {
      return res.status(400).json({ error: "Missing patient or doctor information" });
    }
    const result = await query(req.tenantId, sql, params);
    const appointmentId = result.insertId;

    // Send email notification to patient (if patient_id exists)
    if (patient_id) {
      try {
        // Fetch patient email and name from patients table
        const patientRows = await query(req.tenantId, "SELECT email, name FROM patients WHERE id = ?", [patient_id]);
        if (patientRows.length > 0) {
          const patientEmail = patientRows[0].email;
          const patientName = patientRows[0].name;
          
          // Get doctor name if not already provided
          let finalDoctorName = doctor_name;
          if (!finalDoctorName && doctor_id) {
            const doctorRows = await query(req.tenantId, "SELECT name FROM doctors WHERE id = ?", [doctor_id]);
            if (doctorRows.length) finalDoctorName = doctorRows[0].name;
          }
          
          const appointmentDetails = {
            doctor_name: finalDoctorName || 'Doctor',
            appointment_date,
            appointment_time,
            reason: reason || 'Not specified',
            status: status || 'Pending',
          };
          
          // Send email asynchronously (don't await to avoid delaying response)
          sendAppointmentEmail(patientEmail, patientName, appointmentDetails).catch(err => console.error('Email error:', err));
        }
      } catch (emailErr) {
        console.error('Error preparing appointment email:', emailErr);
        // Do not fail the booking because of email error
      }
    }

    res.json({ id: appointmentId, message: "Appointment booked successfully" });
  } catch (err) {
    console.error("Appointment creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to send appointment confirmation email
async function sendAppointmentEmail(patientEmail, patientName, appointmentDetails) {
  const { doctor_name, appointment_date, appointment_time, reason, status } = appointmentDetails;
  
  const mailOptions = {
    from: '"HealthAxis Hospital" <healthaxis.team@gmail.com>',
    to: patientEmail,
    subject: 'Appointment Confirmation – HealthAxis HMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background: #1a2c3e; padding: 15px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">🏥 HealthAxis Hospital</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #2b7cff;">Appointment Confirmed</h3>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your appointment has been successfully booked. Please find the details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Doctor:</strong></td><td style="padding: 8px;">${doctor_name}</td></tr>
            <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Date:</strong></td><td style="padding: 8px;">${appointment_date}</td></tr>
            <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Time:</strong></td><td style="padding: 8px;">${appointment_time}</td></tr>
            <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Reason:</strong></td><td style="padding: 8px;">${reason}</td></tr>
            <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Status:</strong></td><td style="padding: 8px; text-transform: capitalize;">${status}</td></tr>
          </table>
          <p>Please arrive 15 minutes before your scheduled time. If you need to reschedule, please contact us or use the patient portal.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #6c757d;">This is an automated message. Please do not reply directly.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Appointment confirmation email sent to ${patientEmail}`);
  } catch (err) {
    console.error(`❌ Failed to send appointment email to ${patientEmail}:`, err.message);
    // Do not re-throw – email failure should not break the booking process
  }
}

app.put("/api/appointments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, appointment_date, appointment_time, notes, reason } = req.body;
  try {
    const updates = [], values = [];
    if (status !== undefined) { updates.push("status = ?"); values.push(status); }
    if (appointment_date !== undefined) { updates.push("appointment_date = ?"); values.push(appointment_date); }
    if (appointment_time !== undefined) { updates.push("appointment_time = ?"); values.push(appointment_time); }
    if (notes !== undefined) { updates.push("notes = ?"); values.push(notes); }
    if (reason !== undefined) { updates.push("reason = ?"); values.push(reason); }
    if (!updates.length) return res.status(400).json({ error: "No fields to update" });
    values.push(id);
    const sql = `UPDATE appointments SET ${updates.join(", ")} WHERE id = ?`;
    await query(req.tenantId, sql, values);
    res.json({ message: "Appointment updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM appointments WHERE id = ?", [id]);
    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BILLS (patient filtering) ====================
app.get("/api/bills", authMiddleware, async (req, res) => {
  try {
    let patientId = null;
    if (req.user.role === 'patient') {
      const patient = await query(req.tenantId, "SELECT id FROM patients WHERE user_id = ?", [req.user.userId]);
      if (patient.length) patientId = patient[0].id;
    }
    let sql, params;
    if (patientId) {
      sql = "SELECT * FROM bills WHERE patient_id = ? ORDER BY id DESC";
      params = [patientId];
    } else {
      sql = "SELECT * FROM bills ORDER BY id DESC";
      params = [];
    }
    const bills = await query(req.tenantId, sql, params);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/bills", authMiddleware, async (req, res) => {
  const { patient_id, patient_name, appointment_id, description, total_amount, amount, payment_status, status, bill_date, date } = req.body;
  try {
    const sql = "INSERT INTO bills (patient_id, patient_name, appointment_id, description, total_amount, amount, payment_status, status, bill_date, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    const result = await query(req.tenantId, sql, [patient_id, patient_name, appointment_id, description, total_amount || amount, amount, payment_status || status, status || payment_status, bill_date || date, date || bill_date]);
    res.json({ id: result.insertId, message: "Bill created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/bills/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { description, total_amount, payment_status, status, bill_date } = req.body;
  try {
    await query(req.tenantId, "UPDATE bills SET description=?, total_amount=?, payment_status=?, status=?, bill_date=? WHERE id=?", 
      [description, total_amount, payment_status || status, status || payment_status, bill_date, id]);
    res.json({ message: "Bill updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/bills/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM bills WHERE id = ?", [id]);
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== LAB REPORTS (patient filtering) ====================
app.get("/api/labreports", authMiddleware, async (req, res) => {
  try {
    let doctorId = null, patientId = null;
    if (req.user.role === 'doctor') {
      const doctor = await query(req.tenantId, "SELECT id FROM doctors WHERE user_id = ?", [req.user.userId]);
      if (doctor.length) doctorId = doctor[0].id;
      else return res.json([]);
    } else if (req.user.role === 'patient') {
      const patient = await query(req.tenantId, "SELECT id FROM patients WHERE user_id = ?", [req.user.userId]);
      if (patient.length) patientId = patient[0].id;
    }
    let sql, params;
    if (doctorId) {
      sql = "SELECT * FROM lab_reports WHERE doctor_id = ? ORDER BY id DESC";
      params = [doctorId];
    } else if (patientId) {
      sql = "SELECT * FROM lab_reports WHERE patient_id = ? ORDER BY id DESC";
      params = [patientId];
    } else {
      sql = "SELECT * FROM lab_reports ORDER BY id DESC";
      params = [];
    }
    const reports = await query(req.tenantId, sql, params);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/labreports/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const reports = await query(req.tenantId, "SELECT * FROM lab_reports WHERE id = ?", [id]);
    if (!reports.length) return res.status(404).json({ error: "Lab report not found" });
    res.json(reports[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/labreports", authMiddleware, async (req, res) => {
  const { patient_id, doctor_id, test_name, test_date, result, normal_range, remark, patient_name } = req.body;
  try {
    let finalDoctorId = doctor_id;
    if (!finalDoctorId && req.user.role === "doctor") {
      const doctor = await query(req.tenantId, "SELECT id FROM doctors WHERE user_id = ?", [req.user.userId]);
      if (doctor.length) finalDoctorId = doctor[0].id;
    }
    let sql, params;
    if (patient_name) {
      sql = `INSERT INTO lab_reports (patient_name, doctor_id, test_name, test_date, result, normal_range, remark, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
      params = [patient_name, finalDoctorId, test_name, test_date, result, normal_range, remark];
    } else {
      sql = `INSERT INTO lab_reports (patient_id, doctor_id, test_name, test_date, result, normal_range, remark, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
      params = [patient_id, finalDoctorId, test_name, test_date, result, normal_range, remark];
    }
    const resultQuery = await query(req.tenantId, sql, params);
    res.json({ id: resultQuery.insertId, message: "Lab report added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/labreports/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { result, normal_range, remark } = req.body;
  try {
    await query(req.tenantId, "UPDATE lab_reports SET result=?, normal_range=?, remark=? WHERE id=?", [result, normal_range, remark, id]);
    res.json({ message: "Lab report updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/labreports/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await query(req.tenantId, "UPDATE lab_reports SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Lab report status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/labreports/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM lab_reports WHERE id = ?", [id]);
    res.json({ message: "Lab report deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PRESCRIPTIONS (patient filtering) ====================
app.get("/api/prescriptions", authMiddleware, async (req, res) => {
  try {
    let patientId = null;
    if (req.user.role === 'patient') {
      const patient = await query(req.tenantId, "SELECT id FROM patients WHERE user_id = ?", [req.user.userId]);
      if (patient.length) patientId = patient[0].id;
    }
    let sql, params;
    if (patientId) {
      sql = "SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY id DESC";
      params = [patientId];
    } else {
      sql = "SELECT * FROM prescriptions ORDER BY id DESC";
      params = [];
    }
    const prescriptions = await query(req.tenantId, sql, params);
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/prescriptions", authMiddleware, async (req, res) => {
  const { appointment_id, patient_id, doctor_id, diagnosis, medicines, notes, lab_report_id } = req.body;
  try {
    let finalDoctorId = doctor_id;
    if (!finalDoctorId && req.user.role === "doctor") {
      const doctor = await query(req.tenantId, "SELECT id FROM doctors WHERE user_id = ?", [req.user.userId]);
      if (doctor.length) finalDoctorId = doctor[0].id;
    }
    const sql = `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, medicines, notes, lab_report_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
    const result = await query(req.tenantId, sql, [appointment_id, patient_id, finalDoctorId, diagnosis, medicines, notes, lab_report_id]);
    res.json({ id: result.insertId, message: "Prescription added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/prescriptions/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query(req.tenantId, "DELETE FROM prescriptions WHERE id = ?", [id]);
    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PAYMENTS ====================
app.get("/api/payments", authMiddleware, async (req, res) => {
  try {
    const payments = await query(req.tenantId, "SELECT * FROM payments ORDER BY id DESC");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/payments", authMiddleware, async (req, res) => {
  const { bill_id, amount, payment_method, transaction_id, payment_date } = req.body;
  try {
    const sql = "INSERT INTO payments (bill_id, amount, payment_method, transaction_id, payment_date, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    const result = await query(req.tenantId, sql, [bill_id, amount, payment_method, transaction_id, payment_date]);
    res.json({ id: result.insertId, message: "Payment recorded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== OTP & PATIENT REGISTRATION ====================
// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "healthaxis.team@gmail.com",
    pass: "pwozxssbnuxmrnag"   // ⚠️ Move to .env in production
  }
});

// In‑memory OTP store (use Redis/DB for production)
const otpStore = new Map(); // email -> { otp, expiresAt, verified }

// Send OTP
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Check if email already exists
  const existing = await query(req.tenantId, "SELECT id FROM admin WHERE email = ?", [email]);
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered. Please login." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, { otp, expiresAt, verified: false });

  console.log(`OTP for ${email}: ${otp}`); // for debugging

  const mailOptions = {
    from: "healthaxis.team@gmail.com",
    to: email,
    subject: "HealthAxis HMS Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding:25px; background:#111; color:#ffffff; border-radius:10px;">
        <h2 style="color:#ffffff;">🏥 HealthAxis Hospital Management System</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for account verification is:</p>
        <h1 style="letter-spacing:4px; color:#2c7be5;">${otp}</h1>
        <p>This OTP is valid for <b>5 minutes</b>.</p>
        <p>Please do not share this OTP with anyone.</p>
        <hr>
        <p style="font-size:12px;color:gray;">If you did not request this verification, please ignore this email.</p>
        <p>Regards,<br>HealthAxis Support Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send OTP. Try again later." });
  }
});

// Verify OTP
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ error: "No OTP request found for this email." });
  }
  if (record.expiresAt < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }
  if (record.otp !== parseInt(otp)) {
    return res.status(400).json({ error: "Invalid OTP." });
  }
  // Mark as verified
  record.verified = true;
  otpStore.set(email, record);
  res.json({ success: true, message: "OTP verified. Proceed to registration." });
});

// Complete patient registration
app.post("/api/register-patient", async (req, res) => {
  const { email, password, name, age, gender, phone, address, blood_group } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  const record = otpStore.get(email);
  if (!record || !record.verified) {
    return res.status(400).json({ error: "Email not verified. Please verify OTP first." });
  }

  // Double‑check email not already used
  const existing = await query(req.tenantId, "SELECT id FROM admin WHERE email = ?", [email]);
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert into admin table
  const adminResult = await query(req.tenantId,
    "INSERT INTO admin (name, email, password, role, is_active, created_at) VALUES (?, ?, ?, 'patient', 1, NOW())",
    [name, email, hashedPassword]
  );
  const userId = adminResult.insertId;

  // Insert into patients table (link with user_id)
  await query(req.tenantId,
    "INSERT INTO patients (name, age, gender, phone, email, address, blood_group, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
    [name, age || null, gender || null, phone || null, email, address || null, blood_group || null, userId]
  );

  // Clean up OTP store
  otpStore.delete(email);

  // Generate tokens for auto‑login
  const privateKey = fs.readFileSync(path.join(__dirname, './keys/private_key.pem'), 'utf8');
  const accessToken = jwt.sign(
    { userId, role: 'patient', tenantId: req.tenantId },
    privateKey,
    { algorithm: 'RS256', expiresIn: '1d' }
  );

  res.json({
    success: true,
    accessToken,
    user: { id: userId, name, email, role: 'patient' }
  });
});

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({ status: "OK", tenant: req.tenantId });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});