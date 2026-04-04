import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ReceptionistSidebar from "../../components/receptionsidebar";
import "../../css/receptionist/receptionist.css";

export default function LabReportManagement() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: "",
    test_name: "",
    test_date: "",
    result: "",
    normal_range: "",
    remark: "",
  });
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchReports();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get("/labreports");
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      showToast("Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addReport = async () => {
    if (!formData.patient_name || !formData.test_name) {
      showToast("Patient name and test name are required", "error");
      return;
    }

    const matchedPatient = patients.find(
      (p) => p.name.toLowerCase() === formData.patient_name.toLowerCase()
    );
    if (!matchedPatient) {
      showToast(`Patient "${formData.patient_name}" not found.`, "error");
      return;
    }

    // Get a default doctor ID (first doctor)
    let defaultDoctorId = null;
    try {
      const doctorsRes = await api.get("/doctors");
      if (doctorsRes.data && doctorsRes.data.length > 0) {
        defaultDoctorId = doctorsRes.data[0].id;
      }
    } catch (err) {
      console.error("Could not fetch doctors", err);
    }

    const payload = {
      patient_id: matchedPatient.id,
      patient_name: matchedPatient.name,
      doctor_id: defaultDoctorId,
      test_name: formData.test_name,
      test_date: formData.test_date || new Date().toISOString().split("T")[0],
      result: formData.result || "",
      normal_range: formData.normal_range || "",
      remarks: formData.remark || "",
      status: "pending",
    };

    try {
      await api.post("/labreports", payload);
      showToast("Report added successfully");
      setShowForm(false);
      setFormData({
        patient_name: "",
        test_name: "",
        test_date: "",
        result: "",
        normal_range: "",
        remark: "",
      });
      fetchReports();
    } catch (err) {
      console.error("Add failed:", err);
      const errorMsg = err.response?.data?.error || "Failed to add report";
      showToast(errorMsg, "error");
    }
  };

  const completeReport = async () => {
    if (!editingReport) return;
    try {
      await api.put(`/labreports/${editingReport.id}`, {
        result: editingReport.result,
        normal_range: editingReport.normal_range,
        remarks: editingReport.remarks,
        status: "completed",
      });
      showToast("Report completed successfully");
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      console.error("Complete failed:", err);
      showToast("Failed to complete report", "error");
    }
  };

  const toggleStatus = (report) => {
    if (report.status === "pending") {
      setEditingReport(report);
    } else {
      // Optionally allow resetting to pending
      showToast("Report already completed", "info");
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await api.delete(`/labreports/${id}`);
      showToast("Report deleted");
      fetchReports();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  };

  const viewReport = (report) => {
    if (report.status !== "completed") {
      showToast("Please complete the report first before viewing.", "error");
      return;
    }
    navigate("/receptionist/labreportview", { state: report });
  };

  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === "completed").length,
    pending: reports.filter(r => r.status === "pending").length,
  };

  if (loading) return <div className="loading-state">Loading reports...</div>;

  return (
    <div className="receptionist-dashboard-wrapper">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="receptionist-main-content">
        <header className="receptionist-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>Lab Reports Management</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}

        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.total}</h3><p>Total Reports</p></div>
          <div className="stat-card"><h3>{stats.completed}</h3><p>Completed</p></div>
          <div className="stat-card"><h3>{stats.pending}</h3><p>Pending</p></div>
        </div>

        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Report</button>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Patient</th><th>Test Name</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.patient_name}</td>
                  <td>{report.test_name}</td>
                  <td>{report.test_date}</td>
                  <td><span className={`status-badge ${report.status}`}>{report.status}</span></td>
                  <td>
                    <button onClick={() => viewReport(report)}>View</button>
                    {report.status === "pending" && <button onClick={() => toggleStatus(report)}>Complete</button>}
                    <button onClick={() => deleteReport(report.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Report Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header"><h2>Add New Lab Report</h2><button onClick={() => setShowForm(false)}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label>Patient Name *</label><input name="patient_name" value={formData.patient_name} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Test Name *</label><input name="test_name" value={formData.test_name} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Test Date</label><input type="date" name="test_date" value={formData.test_date} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Result</label><input name="result" value={formData.result} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Normal Range</label><input name="normal_range" value={formData.normal_range} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Remarks</label><textarea name="remark" value={formData.remark} onChange={handleInputChange} rows="3" /></div>
              </div>
              <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn-primary" onClick={addReport}>Add Report</button></div>
            </div>
          </div>
        )}

        {/* Complete Report Modal */}
        {editingReport && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header"><h2>Complete Lab Report</h2><button onClick={() => setEditingReport(null)}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label>Result</label><input value={editingReport.result || ""} onChange={e => setEditingReport({...editingReport, result: e.target.value})} /></div>
                <div className="form-group"><label>Normal Range</label><input value={editingReport.normal_range || ""} onChange={e => setEditingReport({...editingReport, normal_range: e.target.value})} /></div>
                <div className="form-group"><label>Remarks</label><textarea value={editingReport.remarks || ""} onChange={e => setEditingReport({...editingReport, remarks: e.target.value})} rows="3" /></div>
              </div>
              <div className="modal-footer"><button className="btn-secondary" onClick={() => setEditingReport(null)}>Cancel</button><button className="btn-primary" onClick={completeReport}>Complete Report</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}