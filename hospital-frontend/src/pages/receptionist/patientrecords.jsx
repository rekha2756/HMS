import React, { useState, useEffect } from "react";
import api from "../../services/api";
import ReceptionistSidebar from "../../components/receptionsidebar";
import "../../css/receptionist/receptionist.css";

export default function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({ name: "", age: "", gender: "", phone: "", email: "", address: "", blood_group: "" });
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) { console.error(err); showToast("Failed to load patients", "error"); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleSubmit = async () => {
    if (!formData.name) return showToast("Name required", "error");
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, formData);
        showToast("Patient updated");
      } else {
        await api.post("/patients", formData);
        showToast("Patient added");
      }
      setShowModal(false);
      setEditingPatient(null);
      setFormData({ name: "", age: "", gender: "", phone: "", email: "", address: "", blood_group: "" });
      fetchPatients();
    } catch (err) { showToast("Operation failed", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try { await api.delete(`/patients/${id}`); fetchPatients(); showToast("Patient deleted"); }
    catch (err) { showToast("Delete failed", "error"); }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="receptionist-dashboard-wrapper">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="receptionist-main-content">
        <header className="receptionist-topbar"><div className="topbar-left"><button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button><h1>Patient Records</h1></div></header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}
        <button className="btn-primary" onClick={() => { setEditingPatient(null); setFormData({ name: "", age: "", gender: "", phone: "", email: "", address: "", blood_group: "" }); setShowModal(true); }}>+ Add Patient</button>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Email</th><th>Blood Group</th><th>Actions</th></tr></thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.name}</td><td>{p.age}</td><td>{p.gender}</td><td>{p.phone}</td><td>{p.email}</td><td>{p.blood_group}</td>
                  <td><button onClick={() => { setEditingPatient(p); setFormData(p); setShowModal(true); }}>Edit</button> <button onClick={() => handleDelete(p.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div className="modal-overlay"><div className="modal"><div className="modal-header"><h2>{editingPatient ? "Edit Patient" : "Add Patient"}</h2><button onClick={() => setShowModal(false)}>×</button></div>
          <div className="modal-body">
            <div className="form-group"><label>Name</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="form-group"><label>Age</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></div>
            <div className="form-group"><label>Gender</label><select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div>
            <div className="form-group"><label>Phone</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="form-group"><label>Address</label><input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            <div className="form-group"><label>Blood Group</label><input value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} /></div>
          </div>
          <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-primary" onClick={handleSubmit}>Save</button></div></div></div>
        )}
      </main>
    </div>
  );
}