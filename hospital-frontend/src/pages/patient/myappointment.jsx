import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar";
import "../../css/patient/patient.css";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}`, { status: "cancelled" });
      showToast("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      showToast("Failed to cancel", "error");
    }
  };

  const handleReschedule = (appt) => {
    navigate(`/patient/reschedule/${appt.id}`);
  };

  if (loading) return <div className="loading-state">Loading appointments...</div>;

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>My Appointments</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
        {appointments.length === 0 ? (
          <div className="no-data">No appointments found.</div>
        ) : (
          appointments.map(app => (
            <div className="card-item" key={app.id}>
              <div className="card-header">
                <h3>Dr. {app.doctor_name || "Doctor"}</h3>
                <span className={`status-badge ${app.status}`}>{app.status}</span>
              </div>
              <div className="card-body">
                <p><strong>Date:</strong> {app.appointment_date}</p>
                <p><strong>Time:</strong> {app.appointment_time}</p>
                <p><strong>Reason:</strong> {app.reason || "Not specified"}</p>
              </div>
              <div className="card-actions">
                {app.status !== "completed" && app.status !== "cancelled" && (
                  <>
                    <button className="btn-sm btn-reschedule" onClick={() => handleReschedule(app)}>Reschedule</button>
                    <button 
                      className="btn-sm" 
                      onClick={() => handleCancel(app.id)}
                      style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}