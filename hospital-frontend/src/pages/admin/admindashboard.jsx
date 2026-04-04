import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminSidebar from "../../components/adminsidebar";
import "../../css/admin/admindashboard.css";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, patientsRes, appointmentsRes, billsRes] = await Promise.all([
        api.get("/doctors"),
        api.get("/patients"),
        api.get("/appointments"),
        api.get("/bills"),
      ]);
      setDoctors(doctorsRes.data || []);
      setPatients(patientsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setBills(billsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const revenue = bills.reduce((sum, b) => sum + (Number(b.total_amount) || Number(b.amount) || 0), 0);
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;

  const barData = {
    labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Appointments",
        data: [18, 24, 31, 27, 35, appointments.length],
        backgroundColor: "#38bdf8",
        borderRadius: 8,
      },
      {
        label: "New Patients",
        data: [8, 12, 15, 18, 22, patients.length],
        backgroundColor: "#22c55e",
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { font: { size: 12 } } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#e2e8f0" } } },
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Dashboard</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="icon-btn">🔔</button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">👨‍⚕️</div>
            <p className="stat-card__label">Total Doctors</p>
            <p className="stat-card__value">{doctors.length}</p>
            <p className="stat-card__trend positive">+2 this month</p>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">👥</div>
            <p className="stat-card__label">Total Patients</p>
            <p className="stat-card__value">{patients.length}</p>
            <p className="stat-card__trend positive">+12 this month</p>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">📅</div>
            <p className="stat-card__label">Appointments</p>
            <p className="stat-card__value">{appointments.length}</p>
            <p className="stat-card__trend negative">{pendingCount} pending</p>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">💰</div>
            <p className="stat-card__label">Total Revenue</p>
            <p className="stat-card__value">₹{revenue.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-card__header">
              <h3>Activity Overview</h3>
              <p>Last 6 months</p>
            </div>
            <div className="chart-container">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          <div className="recent-list">
            <div className="recent-list__header">
              <h3>Recent Appointments</h3>
            </div>
            {[...appointments].reverse().slice(0, 5).map((app, idx) => (
              <div key={idx} className="recent-item">
                <div className="recent-avatar">{app.patient_name?.charAt(0) || "?"}</div>
                <div className="recent-info">
                  <p className="recent-name">{app.patient_name}</p>
                  <p className="recent-doctor">{app.doctor_name}</p>
                </div>
                <span className={`badge badge--${app.status?.toLowerCase()}`}>{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}