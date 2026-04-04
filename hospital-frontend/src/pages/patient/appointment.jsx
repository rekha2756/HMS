import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar";
import "../../css/patient/patient.css";

export default function Appointment() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: ""
  });
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
    fetchPatientProfile();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  const fetchPatientProfile = async () => {
    try {
      const res = await api.get("/patient/profile");
      setPatient(res.data);
    } catch (err) {
      console.error("Failed to fetch patient profile:", err);
      showToast("Could not load your profile. Please refresh.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (!patient) {
      showToast("Patient profile not loaded. Please refresh.", "error");
      return;
    }

    setLoading(true);
    try {
      const selectedDoctor = doctors.find(d => d.id === parseInt(formData.doctor_id));
      const appointmentData = {
        patient_id: patient.id,
        patient_name: patient.name,
        doctor_id: parseInt(formData.doctor_id),
        doctor_name: selectedDoctor?.name,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason,
        status: "pending"
      };
      console.log("Sending appointment data:", appointmentData);
      const response = await api.post("/appointments", appointmentData);
      console.log("Booking response:", response.data);
      showToast("Appointment booked successfully!");
      setTimeout(() => navigate("/patient/myappointment"), 1500);
    } catch (err) {
      console.error("Booking failed:", err);
      showToast(err.response?.data?.error || "Failed to book appointment", "error");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) return <div className="loading-state">Loading profile...</div>;
  if (!patient) return <div className="error-state">Unable to load patient profile. Please contact admin.</div>;

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>Book Appointment</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Doctor *</label>
            <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
              <option value="">Select Doctor</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label>Time *</label>
            <select name="appointment_time" value={formData.appointment_time} onChange={handleChange} required>
              <option value="">Select Time</option>
              <option>09:00:00</option><option>10:00:00</option><option>11:00:00</option>
              <option>12:00:00</option><option>14:00:00</option><option>15:00:00</option>
              <option>16:00:00</option>
            </select>
          </div>
          <div className="form-group">
            <label>Reason (optional)</label>
            <textarea name="reason" rows="3" value={formData.reason} onChange={handleChange} placeholder="Brief description of your concern" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Booking..." : "Confirm Appointment"}</button>
        </form>
      </main>
    </div>
  );
}