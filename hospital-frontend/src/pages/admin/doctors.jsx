import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import AdminSidebar from "../../components/adminsidebar";
import "../../css/admin/admindashboard.css";

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

const DeleteBtn = ({ onClick }) => <button className="delete-btn" onClick={onClick}>🗑️</button>;

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      showToast("Failed to load doctors", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this doctor?")) return;
    try {
      await api.delete(`/doctors/${id}`);
      showToast("Doctor removed successfully");
      fetchDoctors();
    } catch (err) {
      showToast("Failed to delete doctor", "error");
    }
  };

  const filteredDoctors = useMemo(() =>
    doctors.filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())),
    [doctors, searchTerm]
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading doctors...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Doctors Management</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="icon-btn">🔔</button>
          </div>
        </header>

        <div className="search-container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="doctors-grid">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-card__header">
                <Avatar name={doctor.name} size={56} />
                <DeleteBtn onClick={() => handleDelete(doctor.id)} />
              </div>
              <div className="doctor-card__body">
                <h3 className="doctor-name">{doctor.name}</h3>
                <span className="doctor-specialty">{doctor.specialization}</span>
                <div className="doctor-details">
                  <p>📧 {doctor.email}</p>
                  <p>📞 {doctor.phone}</p>
                  <p>🏅 {doctor.experience} years</p>
                  <p>💰 ₹{doctor.consultation_fee}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👨‍⚕️</div>
            <h3>No doctors found</h3>
            <p>Try adjusting your search</p>
          </div>
        )}

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
      </main>
    </div>
  );
}