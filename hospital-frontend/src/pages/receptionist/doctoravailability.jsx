import React, { useState, useEffect } from "react";
import api from "../../services/api";
import ReceptionistSidebar from "../../components/receptionsidebar";
import "../../css/receptionist/receptionist.css";

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try { const res = await api.get("/doctors"); setDoctors(res.data); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleAvailability = async (id, current) => {
    try { await api.put(`/doctors/${id}`, { is_available: current === 1 ? 0 : 1 }); fetchDoctors(); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="receptionist-dashboard-wrapper">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="receptionist-main-content">
        <header className="receptionist-topbar"><div className="topbar-left"><button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button><h1>Doctor Availability</h1></div></header>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Specialization</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.id}</td><td>{doc.name}</td><td>{doc.specialization}</td><td>{doc.phone}</td>
                  <td><span className={`status-badge ${doc.is_available === 1 ? "active" : "unavailable"}`}>{doc.is_available === 1 ? "Available" : "Unavailable"}</span></td>
                  <td><button onClick={() => toggleAvailability(doc.id, doc.is_available)}>Toggle</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}