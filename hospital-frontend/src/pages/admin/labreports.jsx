import React, { useState, useEffect } from "react";
import api from "../../services/api";
import AdminSidebar from "../../components/adminsidebar";
import "../../css/admin/admindashboard.css";

function Badge({ result }) {
  const isNormal = result?.toLowerCase() === "normal";
  return (
    <span className={`badge badge--${isNormal ? "completed" : "pending"}`}>
      {result || "Pending"}
    </span>
  );
}

const DeleteBtn = ({ onClick }) => <button className="delete-btn" onClick={onClick}>🗑️</button>;

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    test_name: "",
    test_date: "",
    result: "",
    normal_range: "",
    remarks: ""
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/labreports");
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to fetch lab reports:", err);
      showToast("Failed to load lab reports", "error");
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
      await api.post("/labreports", formData);
      showToast("Lab report added successfully");
      setShowModal(false);
      setFormData({ patient_id: "", patient_name: "", test_name: "", test_date: "", result: "", normal_range: "", remarks: "" });
      fetchReports();
    } catch (err) {
      showToast("Failed to add lab report", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lab report?")) return;
    try {
      await api.delete(`/labreports/${id}`);
      showToast("Lab report deleted successfully");
      fetchReports();
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const filteredReports = reports.filter(report =>
    report.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading lab reports...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Lab Reports Management</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="icon-btn">🔔</button>
            <button className="icon-btn" onClick={() => setShowModal(true)}>➕</button>
          </div>
        </header>

        <div className="search-container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by patient or test name..."
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
                  <th>Test Name</th>
                  <th>Test Date</th>
                  <th>Result</th>
                  <th>Normal Range</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr key={report.id}>
                    <td>{report.patient_name}</td>
                    <td>{report.test_name}</td>
                    <td>{report.test_date}</td>
                    <td><Badge result={report.result} /></td>
                    <td>{report.normal_range}</td>
                    <td>{report.remarks}</td>
                    <td><DeleteBtn onClick={() => handleDelete(report.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredReports.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔬</div>
            <h3>No lab reports found</h3>
            <p>Try adjusting your search</p>
          </div>
        )}

        {/* Modal for Add Lab Report */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h2 className="modal__title">Add Lab Report</h2>
                <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal__body">
                <form onSubmit={handleSubmit} className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient ID</label>
                      <input type="text" value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Patient Name</label>
                      <input type="text" value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Test Name</label>
                      <input type="text" value={formData.test_name} onChange={(e) => setFormData({...formData, test_name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Test Date</label>
                      <input type="date" value={formData.test_date} onChange={(e) => setFormData({...formData, test_date: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Result</label>
                      <input type="text" value={formData.result} onChange={(e) => setFormData({...formData, result: e.target.value})} placeholder="Normal / High / Low" />
                    </div>
                    <div className="form-group">
                      <label>Normal Range</label>
                      <input type="text" value={formData.normal_range} onChange={(e) => setFormData({...formData, normal_range: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} rows="3" />
                  </div>
                  <div className="form-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Report</button>
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