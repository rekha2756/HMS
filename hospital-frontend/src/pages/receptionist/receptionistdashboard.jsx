import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ReceptionistSidebar from "../../components/receptionsidebar";
import "../../css/receptionist/receptionist.css";

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    todaysAppointments: 0,
    availableDoctors: 0,
    pendingLabReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, labRes] = await Promise.all([
        api.get("/patients"),
        api.get("/doctors"),
        api.get("/appointments"),
        api.get("/labreports"),
      ]);

      const patients = patientsRes.data;
      const doctors = doctorsRes.data;
      const appointments = appointmentsRes.data;
      const labReports = labRes.data;

      const today = new Date().toISOString().split("T")[0];
      const todaysAppts = appointments.filter(a => a.appointment_date === today).length;

      setStats({
        totalPatients: patients.length,
        activePatients: patients.filter(p => p.status === "Active").length,
        todaysAppointments: todaysAppts,
        availableDoctors: doctors.filter(d => d.is_available === 1).length,
        pendingLabReports: labReports.filter(l => l.status === "pending").length,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="receptionist-dashboard-wrapper">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="receptionist-main-content">
        <header className="receptionist-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="greeting">
              <h1>Receptionist Dashboard</h1>
              <p>{today}</p>
            </div>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.totalPatients}</h3><p>Total Patients</p></div>
          <div className="stat-card"><h3>{stats.activePatients}</h3><p>Active Patients</p></div>
          <div className="stat-card"><h3>{stats.todaysAppointments}</h3><p>Today's Appointments</p></div>
          <div className="stat-card"><h3>{stats.availableDoctors}</h3><p>Available Doctors</p></div>
          <div className="stat-card"><h3>{stats.pendingLabReports}</h3><p>Pending Lab Reports</p></div>
        </div>

        <div className="dashboard-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div className="card" onClick={() => navigate("/receptionist/patientrecords")} style={{ cursor: "pointer", background: "white", borderRadius: "12px", padding: "20px", border: "1px solid var(--border)" }}>
            <h3>📋 Patient Records</h3>
            <p>Manage all patient information</p>
          </div>
          <div className="card" onClick={() => navigate("/receptionist/generatebill")} style={{ cursor: "pointer", background: "white", borderRadius: "12px", padding: "20px", border: "1px solid var(--border)" }}>
            <h3>💰 Generate Bill</h3>
            <p>Create patient invoices</p>
          </div>
          <div className="card" onClick={() => navigate("/receptionist/doctoravailability")} style={{ cursor: "pointer", background: "white", borderRadius: "12px", padding: "20px", border: "1px solid var(--border)" }}>
            <h3>👨‍⚕️ Doctor Availability</h3>
            <p>Update doctor schedules</p>
          </div>
          <div className="card" onClick={() => navigate("/receptionist/labreportsupdate")} style={{ cursor: "pointer", background: "white", borderRadius: "12px", padding: "20px", border: "1px solid var(--border)" }}>
            <h3>🔬 Lab Reports</h3>
            <p>Manage test results</p>
          </div>
        </div>
      </main>
    </div>
  );
}