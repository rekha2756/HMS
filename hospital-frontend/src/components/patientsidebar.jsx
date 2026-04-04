import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarPlus,
  FaCalendarCheck,
  FaFlask,
  FaPrescriptionBottle,
  FaUser,
  FaFileInvoiceDollar,
  FaSignOutAlt,
} from "react-icons/fa";

export default function PatientSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "/patient/patientdashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/patient/appointment", icon: <FaCalendarPlus />, label: "Book Appointment" },
    { path: "/patient/myappointment", icon: <FaCalendarCheck />, label: "My Appointments" },
    { path: "/patient/mylabreports", icon: <FaFlask />, label: "My Lab Reports" },
    { path: "/patient/myprescription", icon: <FaPrescriptionBottle />, label: "My Prescriptions" },
    { path: "/patient/patientprofile", icon: <FaUser />, label: "Profile" },
    { path: "/patient/billing", icon: <FaFileInvoiceDollar />, label: "Billing" },
  ];

  return (
    <aside className={`patient-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">🏥</div>
        <div>
          <h2>HEALTHAXIS</h2>
          <div className="brand-sub">Patient Portal</div>
        </div>
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