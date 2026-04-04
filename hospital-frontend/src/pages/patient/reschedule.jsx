import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar";
import "../../css/patient/patient.css";

export default function PatientReschedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const res = await api.get(`/appointments/${id}`);
      setAppointment(res.data);
      setDate(res.data.appointment_date);
      setTime(res.data.appointment_time);
      setReason(res.data.reason || "");
    } catch (err) {
      console.error("Failed to fetch appointment:", err);
      showToast("Failed to load appointment", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async () => {
    if (!date || !time) {
      showToast("Please select date and time", "error");
      return;
    }
    setUpdating(true);
    try {
      const updateData = {
        appointment_date: date,
        appointment_time: time,
        reason: reason,
      };
      console.log("Sending update:", updateData);
      const response = await api.put(`/appointments/${id}`, updateData);
      console.log("Update response:", response.data);
      showToast("Appointment rescheduled successfully!");
      setTimeout(() => navigate("/patient/myappointment"), 1500);
    } catch (err) {
      console.error("Update error:", err);
      // Check for authentication error
      if (err.response?.status === 401) {
        showToast("Session expired. Please log in again.", "error");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showToast(err.response?.data?.error || "Failed to reschedule appointment", "error");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}`, { status: "cancelled" });
      showToast("Appointment cancelled successfully!");
      setTimeout(() => navigate("/patient/myappointment"), 1500);
    } catch (err) {
      console.error("Cancel error:", err);
      showToast("Failed to cancel appointment", "error");
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (!appointment) return <div className="error-state">Appointment not found</div>;

  if (appointment.status === "completed" || appointment.status === "cancelled") {
    return (
      <div className="patient-dashboard-wrapper">
        <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="patient-main-content">
          <div className="error-state">Cannot reschedule a {appointment.status} appointment.</div>
          <button onClick={() => navigate("/patient/myappointment")}>Back to Appointments</button>
        </main>
      </div>
    );
  }

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h1>Reschedule Appointment</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
        <div className="reschedule-container">
          <div className="patient-info-card">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> {appointment.patient_name}</p>
            <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
          </div>
          <div className="current-appointment-card">
            <h3>Current Appointment</h3>
            <p><strong>Date:</strong> {appointment.appointment_date}</p>
            <p><strong>Time:</strong> {appointment.appointment_time}</p>
            <p><strong>Status:</strong> {appointment.status}</p>
          </div>
          <div className="reschedule-form-card">
            <h3>Select New Date & Time</h3>
            <div className="form-group">
              <label>New Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label>New Time</label>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                <option value="">Select Time Slot</option>
                <option>09:00:00</option>
                <option>10:00:00</option>
                <option>11:00:00</option>
                <option>12:00:00</option>
                <option>14:00:00</option>
                <option>15:00:00</option>
                <option>16:00:00</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reason for Rescheduling (optional)</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" placeholder="e.g., Doctor on leave, Patient requested change..." />
            </div>
            <div className="button-group">
              <button className="btn-primary" onClick={handleUpdate} disabled={updating}>
                {updating ? "Updating..." : "Update Appointment"}
              </button>
              <button className="btn-danger" onClick={handleCancel}>Cancel Appointment</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
