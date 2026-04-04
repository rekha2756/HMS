import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUserInjured, FaFileInvoiceDollar, FaUserMd, FaFlask, FaSignOutAlt } from "react-icons/fa";
import "../css/receptionist/receptionist.css";

export default function ReceptionistSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navItems = [
    { path: "/receptionist/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/receptionist/patientrecords", icon: <FaUserInjured />, label: "Patient Records" },
    { path: "/receptionist/generatebill", icon: <FaFileInvoiceDollar />, label: "Generate Bill" },
    { path: "/receptionist/doctoravailability", icon: <FaUserMd />, label: "Doctor Availability" },
    { path: "/receptionist/labreportsupdate", icon: <FaFlask />, label: "Lab Reports" },
  ];

  return (
    <aside className={`receptionist-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">🏥</div>
        <div><h2>HEALTHAXIS</h2><div className="brand-sub">Reception Portal</div></div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}