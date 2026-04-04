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

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data || []);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      showToast("Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this patient?")) return;
    try {
      await api.delete(`/patients/${id}`);
      showToast("Patient removed successfully");
      fetchPatients();
    } catch (err) {
      showToast("Failed to delete patient", "error");
    }
  };

  const filteredPatients = useMemo(() =>
    patients.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [patients, searchTerm]
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading patients...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Patients Management</h1>
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
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Date of Birth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-info">
                        <Avatar name={patient.name} size={32} />
                        <div>
                          <div className="patient-name">{patient.name}</div>
                          <div className="patient-email">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{patient.gender}</td>
                    <td><span className="blood-group">{patient.blood_group || "N/A"}</span></td>
                    <td>{patient.phone}</td>
                    <td>{patient.date_of_birth}</td>
                    <td><DeleteBtn onClick={() => handleDelete(patient.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPatients.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No patients found</h3>
            <p>Try adjusting your search</p>
          </div>
        )}

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
      </main>
    </div>
  );
}