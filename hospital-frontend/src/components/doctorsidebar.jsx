import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaCalendarAlt, FaFlask, FaUserMd, FaSignOutAlt } from "react-icons/fa";

export default function DoctorSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navItems = [
    { path: "/doctor/doctordashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/doctor/docappointments", label: "Appointments", icon: <FaCalendarAlt /> },
    { path: "/doctor/pendinglabreports", label: "Lab Reports", icon: <FaFlask /> },
    { path: "/doctor/doctorprofile", label: "Profile", icon: <FaUserMd /> },
  ];

  return (
    <aside className={`doctor-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">🏥</div>
        <h2>HealthAxis</h2>
        <p className="brand-sub">Doctor Portal</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}