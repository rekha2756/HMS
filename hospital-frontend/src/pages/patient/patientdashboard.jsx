import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar";
import "../../css/patient/patient.css";

export default function PatientDashboard() {
  const [patient, setPatient] = useState({ name: "Guest User" });
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0,
    labReports: 0,
    pendingBills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const profileRes = await api.get("/patient/profile");
      setPatient(profileRes.data);
      // In a real app, fetch actual counts from API
      setStats({ appointments: 3, prescriptions: 2, labReports: 4, pendingBills: 1 });
    } catch (err) {
      console.error(err);
      setStats({ appointments: 3, prescriptions: 2, labReports: 4, pendingBills: 1 });
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
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="patient-main-content">
        <div className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div className="greeting">
              <h1>Welcome, {patient.name}</h1>
              <p>{today}</p>
            </div>
          </div>
          <div className="topbar-right">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search..." className="search-input" />
            </div>
            <button className="notification-btn">
              <FaBell />
              <span className="notification-dot" />
            </button>
            <div className="patient-avatar">
              <FaUserCircle />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.appointments}</h3>
            <p>Upcoming Appointments</p>
            <span className="trend up">Active</span>
          </div>
          <div className="stat-card">
            <h3>{stats.prescriptions}</h3>
            <p>Active Prescriptions</p>
            <span className="trend neutral">Current</span>
          </div>
          <div className="stat-card">
            <h3>{stats.labReports}</h3>
            <p>Lab Reports</p>
            <span className="trend up">Available</span>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingBills}</h3>
            <p>Pending Bills</p>
            <span className="trend down">Due</span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="dashboard-cards">
          <div className="card">
            <h3>📅 Quick Actions</h3>
            <p>Book a new appointment with your preferred doctor</p>
            <button onClick={() => navigate("/patient/appointment")}>Book Appointment</button>
          </div>
          <div className="card">
            <h3>🔬 Recent Lab Report</h3>
            <p>Check your latest test results</p>
            <button onClick={() => navigate("/patient/mylabreports")}>View Reports</button>
          </div>
          <div className="card">
            <h3>💊 Active Prescriptions</h3>
            <p>Review your current medications</p>
            <button onClick={() => navigate("/patient/myprescription")}>View Prescriptions</button>
          </div>
          <div className="card">
            <h3>💰 Billing Summary</h3>
            <p>Pending payments: ₹{stats.pendingBills * 500}</p>
            <button onClick={() => navigate("/patient/billing")}>View Bills</button>
          </div>
        </div>
      </div>
    </div>
  );
}