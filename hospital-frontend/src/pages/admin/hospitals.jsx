import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import AdminSidebar from "../../components/adminsidebar";
import "../../css/admin/admindashboard.css";

function DeleteBtn({ onClick }) {
  return <button className="delete-btn" onClick={onClick}>🗑️</button>;
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    hospital_name: "",
    address: "",
    city: "",
    contact_number: "",
    email: "",
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get("/hospitals");
      setHospitals(res.data || []);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
      showToast("Failed to load hospitals", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await api.put(`/hospitals/${editingHospital.id}`, formData);
        showToast("Hospital updated successfully");
      } else {
        await api.post("/hospitals", formData);
        showToast("Hospital added successfully");
      }
      setShowModal(false);
      setEditingHospital(null);
      setFormData({
        hospital_name: "",
        address: "",
        city: "",
        contact_number: "",
        email: "",
      });
      fetchHospitals();
    } catch (err) {
      console.error("Failed to save hospital:", err);
      showToast("Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hospital?")) return;
    try {
      await api.delete(`/hospitals/${id}`);
      showToast("Hospital deleted successfully");
      fetchHospitals();
    } catch (err) {
      console.error("Failed to delete hospital:", err);
      showToast("Delete failed", "error");
    }
  };

  const openEditModal = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      hospital_name: hospital.hospital_name || "",
      address: hospital.address || "",
      city: hospital.city || "",
      contact_number: hospital.contact_number || "",
      email: hospital.email || "",
    });
    setShowModal(true);
  };

  const filteredHospitals = useMemo(() =>
    hospitals.filter(h =>
      h.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [hospitals, searchTerm]
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading hospitals...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Hospitals Management</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="icon-btn">🔔</button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Add Hospital
            </button>
          </div>
        </header>

        <div className="search-container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search hospitals by name or city..."
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
                  <th>Hospital Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Contact Number</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map(hospital => (
                  <tr key={hospital.id}>
                    <td><strong>{hospital.hospital_name}</strong></td>
                    <td>{hospital.address}</td>
                    <td>{hospital.city}</td>
                    <td>{hospital.contact_number}</td>
                    <td>{hospital.email}</td>
                    <td>{new Date(hospital.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="action-btn" onClick={() => openEditModal(hospital)}>✏️</button>
                      <DeleteBtn onClick={() => handleDelete(hospital.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredHospitals.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏥</div>
            <h3>No hospitals found</h3>
            <p>Click "Add Hospital" to create one</p>
          </div>
        )}

        {/* Modal for Add/Edit Hospital */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h2 className="modal__title">
                  {editingHospital ? "Edit Hospital" : "Add New Hospital"}
                </h2>
                <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal__body">
                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label>Hospital Name *</label>
                    <input
                      type="text"
                      value={formData.hospital_name}
                      onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="tel"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingHospital ? "Update Hospital" : "Add Hospital"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
      </main>
    </div>
  );
}