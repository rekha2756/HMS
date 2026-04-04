import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PatientSidebar from "../../components/patientsidebar.jsx";
import "../../css/patient/patient.css";

export default function ReportDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state;
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (!report) {
    return <div className="error-state">No report data found</div>;
  }

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h1>Lab Report Details</h1>
          </div>
        </header>
        <div className="report-page">
          <div className="report-card">
            <h3>🔬 {report.test_name}</h3>
            <div className="details-grid">
              <div><strong>Patient:</strong> {report.patient_name}</div>
              <div><strong>Doctor:</strong> {report.doctor_name || "N/A"}</div>
              <div><strong>Test Date:</strong> {report.test_date}</div>
              <div><strong>Result:</strong> {report.result || "Pending"}</div>
              <div><strong>Normal Range:</strong> {report.normal_range || "Not specified"}</div>
              <div><strong>Remarks:</strong> {report.remark || "None"}</div>
              <div><strong>Status:</strong> <span className={`status-badge ${report.status}`}>{report.status}</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}