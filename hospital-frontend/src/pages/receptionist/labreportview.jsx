import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import ReceptionistSidebar from "../../components/receptionsidebar";
import "../../css/receptionist/receptionist.css";

export default function LabReportView() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state;
  const reportRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const downloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `LabReport_${report.id}_${report.patient_name}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!report) {
    return (
      <div className="receptionist-dashboard-wrapper">
        <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="receptionist-main-content">
          <div className="error-state">No lab report data found.</div>
          <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </main>
      </div>
    );
  }

  if (report.status?.toLowerCase() !== "completed") {
    return (
      <div className="receptionist-dashboard-wrapper">
        <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="receptionist-main-content">
          <div className="error-state">This lab report is still pending. Please complete it first.</div>
          <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </main>
      </div>
    );
  }

  return (
    <div className="receptionist-dashboard-wrapper">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="receptionist-main-content">
        <header className="receptionist-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h1>Lab Report Details</h1>
          </div>
          <button className="btn-primary" onClick={downloadPDF}>📄 Download PDF</button>
        </header>

        <div ref={reportRef} className="report-card" style={{ background: "white", borderRadius: "16px", padding: "24px", marginTop: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ color: "#2b7cff" }}>HEALTHAXIS HOSPITAL</h2>
            <p style={{ color: "#6c757d" }}>Diagnostic Laboratory Report</p>
          </div>

          <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <div><strong>Report ID:</strong> {report.id}</div>
            <div><strong>Patient Name:</strong> {report.patient_name}</div>
            <div><strong>Test Name:</strong> {report.test_name}</div>
            <div><strong>Test Date:</strong> {report.test_date}</div>
            <div><strong>Result:</strong> {report.result || "Not specified"}</div>
            <div><strong>Normal Range:</strong> {report.normal_range || "Not specified"}</div>
            <div><strong>Remarks:</strong> {report.remark || "None"}</div>
            <div><strong>Status:</strong> <span className={`status-badge ${report.status}`}>{report.status}</span></div>
          </div>

          <div style={{ marginTop: "32px", textAlign: "right" }}>
            <p>_________________________</p>
            <p>Authorised Signatory</p>
          </div>
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#6c757d" }}>
            <p>This is a computer-generated report. No signature is required.</p>
          </div>
        </div>
      </main>
    </div>
  );
}