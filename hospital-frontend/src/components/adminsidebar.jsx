import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Avatar({ name, size = 32 }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const palette = ["#1976d2", "#2e7d32", "#7b1fa2", "#e65100", "#00695c", "#1565c0"];
  const color = palette[(name || "").charCodeAt(0) % palette.length];
  return (
    <div className="admin-avatar" style={{ width: size, height: size, fontSize: size * 0.35, background: color }}>
      {initials}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/admin/admindashboard", icon: "📊" },
  { id: "doctors", label: "Doctors", path: "/admin/doctors", icon: "👨‍⚕️" },
  { id: "patients", label: "Patients", path: "/admin/patients", icon: "👥" },
  { id: "appointments", label: "Appointments", path: "/admin/appointments", icon: "📅" },
  { id: "billing", label: "Billing", path: "/admin/bills", icon: "💰" },
  { id: "hospitals", label: "Hospitals", path: "/admin/hospitals", icon: "🏥" },
  { id: "labreports", label: "Lab Reports", path: "/admin/labreports", icon: "🔬" },
  { id: "usermanagement", label: "User Management", path: "/admin/usermanagement", icon: "👥" },
  { id: "profile", label: "Profile", path: "/admin/adminprofile", icon: "👤" },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <div className="logo-text">
          <h2>HealthAxis</h2>
          <p>Hospital Management System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">Navigation</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info" onClick={() => navigate("/admin/adminprofile")}>
          <Avatar name="Admin User" size={40} />
          <div>
            <div className="user-name">Admin User</div>
            <div className="user-role">Super Admin</div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </aside>
  );
}