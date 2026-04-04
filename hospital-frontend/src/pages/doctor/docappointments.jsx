import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaSyncAlt, FaCalendarAlt, FaClock, FaUserMd, FaNotesMedical } from "react-icons/fa";
import api from "../../services/api";
import DoctorSidebar from "../../components/doctorsidebar";
import "../../css/doctor/doctor.css";

export default function DocAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: <span className="status-badge confirmed">Confirmed</span>,
      pending: <span className="status-badge pending">Pending</span>,
      completed: <span className="status-badge completed">Completed</span>,
      cancelled: <span className="status-badge cancelled">Cancelled</span>,
    };
    return badges[status] || <span className="status-badge pending">{status}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <div className="loading-state">Loading appointments...</div>;

  return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="doctor-main-content">
        <header className="doctor-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>My Appointments</h1>
          </div>
        </header>

        {appointments.length === 0 ? (
          <div className="no-data">No appointments found.</div>
        ) : (
          <div className="appointments-grid">
            {appointments.map((app) => (
              <div className="appointment-card" key={app.id}>
                <div className="appointment-card-header">
                  <div className="patient-info">
                    <FaUserMd className="patient-icon" />
                    <h3>{app.patient_name}</h3>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="appointment-card-body">
                  <div className="detail-row">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>{formatDate(app.appointment_date)}</span>
                    </div>
                    <div className="detail-item">
                      <FaClock />
                      <span>{app.appointment_time}</span>
                    </div>
                  </div>
                  {app.reason && (
                    <div className="detail-item full-width">
                      <FaNotesMedical />
                      <span>{app.reason}</span>
                    </div>
                  )}
                </div>

                <div className="appointment-card-actions">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/doctor/viewappointment/${app.id}`)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="btn-reschedule"
                    onClick={() => navigate(`/doctor/reschedule/${app.id}`)}
                    disabled={app.status === "completed" || app.status === "cancelled"}
                  >
                    <FaSyncAlt /> Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}