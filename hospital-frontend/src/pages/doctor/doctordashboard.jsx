import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  FaCalendarAlt,
  FaBed,
  FaExclamationTriangle,
  FaTasks,
  FaSearch,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import api from "../../services/api";
import DoctorSidebar from "../../components/doctorsidebar";
import "../../css/doctor/doctordashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState({ name: "", specialization: "" });
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDoctorData();
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const res = await api.get("/doctor/profile");
      setDoctor(res.data);
    } catch (err) {
      console.error("Failed to fetch doctor data:", err);
      setDoctor({ name: "Dr. Rekha Sharma", specialization: "Cardiology" });
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data || []);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const patientData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Patients",
        data: [20, 30, 25, 40, 45, 35, 28],
        borderColor: "#2b7cff",
        backgroundColor: "rgba(43,124,255,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const appointmentChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Appointments",
        data: [12, 15, 14, 18, 20, 10, 6],
        backgroundColor: "#2b7cff",
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { font: { size: 12 } } } },
  };

  const todaySchedule = [
    { patient: "Michael Chen", time: "11:30 AM", room: "402", status: "waiting" },
    { patient: "Sarah Jenkins", time: "12:00 PM", room: "404", status: "consulting" },
    { patient: "David Kim", time: "01:30 PM", room: "401", status: "completed" },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      waiting: <span className="status-badge waiting">Waiting</span>,
      consulting: <span className="status-badge consulting">Consulting</span>,
      completed: <span className="status-badge completed">Completed</span>,
    };
    return badges[status] || <span className="status-badge">{status}</span>;
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="doctor-main-content">
        <header className="doctor-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div className="greeting">
              <h1>Welcome, {doctor.name}</h1>
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
            <div className="doctor-avatar">
              <FaUserCircle />
            </div>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{patients.length}</h3>
            <p>Total Patients</p>
            <span className="trend up">+12% this month</span>
          </div>
          <div className="stat-card">
            <h3>{appointments.length}</h3>
            <p>Total Consultations</p>
            <span className="trend up">+8% this month</span>
          </div>
          <div className="stat-card">
            <h3>{appointments.filter(a => a.status === "scheduled").length}</h3>
            <p>Today's Appointments</p>
            <span className="trend neutral">4 pending</span>
          </div>
          <div className="stat-card">
            <h3>18</h3>
            <p>Pending Lab Reports</p>
            <span className="trend down">-2 from yesterday</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <FaCalendarAlt /> <h3>Today's Schedule</h3>
            </div>
            <div className="panel-body">
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Time</th><th>Room</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {todaySchedule.map((app, idx) => (
                    <tr key={idx}>
                      <td>{app.patient}</td><td>{app.time}</td><td>{app.room}</td>
                      <td>{getStatusBadge(app.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <FaBed /> <h3>Inpatient Overview</h3>
            </div>
            <div className="panel-body">
              <table className="data-table">
                <thead><tr><th>Ward</th><th>Patient</th><th>Diagnosis</th></tr></thead>
                <tbody>
                  <tr><td>ICU 3A</td><td>Sarah Jenkins</td><td>Post Surgery</td></tr>
                  <tr><td>Med 211</td><td>David Kim</td><td>Hypertension</td></tr>
                  <tr><td>ICU 2A</td><td>Anna Brown</td><td>Respiratory Care</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel chart-panel">
            <div className="panel-header">
              <FaUserCircle /> <h3>Weekly Patient Analytics</h3>
            </div>
            <div className="panel-body chart-container">
              <Line data={patientData} options={chartOptions} />
            </div>
          </div>

          <div className="panel chart-panel">
            <div className="panel-header">
              <FaCalendarAlt /> <h3>Weekly Appointments</h3>
            </div>
            <div className="panel-body chart-container">
              <Bar data={appointmentChartData} options={chartOptions} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <FaExclamationTriangle /> <h3>Lab Alerts</h3>
            </div>
            <div className="panel-body">
              <ul className="alert-list">
                <li>Blood test results pending verification</li>
                <li>MRI scan report awaiting review</li>
                <li>Pathology report uploaded</li>
                <li>Radiology report pending approval</li>
              </ul>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <FaTasks /> <h3>Pending Tasks</h3>
            </div>
            <div className="panel-body">
              <ul className="task-list">
                <li>Review laboratory diagnostics</li>
                <li>Update patient medical records</li>
                <li>Approve discharge summaries</li>
                <li>Verify consultation notes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}