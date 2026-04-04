import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar";
import "../../css/patient/patient.css";
import html2pdf from "html2pdf.js";

export default function MyLabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/labreports");
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleView = (report) => {
    if (report.status === "pending") {
      showToast("Report is still pending", "error");
      return;
    }
    navigate("/patient/reportdetails", { state: report });
  };

  const generatePDF = (report) => {
    // Create a temporary div with the report content
    const element = document.createElement("div");
    element.style.padding = "30px";
    element.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";
    element.style.maxWidth = "800px";
    element.style.margin = "0 auto";
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2b7cff; margin-bottom: 5px;">HEALTHAXIS HOSPITAL</h1>
        <p style="color: #6c757d;">123 Healthcare Avenue, Chennai - 600001 | Tel: +91 9876543210</p>
        <hr style="border: 1px solid #e9ecef; margin: 20px 0;" />
        <h2 style="color: #1a2c3e;">Laboratory Report</h2>
      </div>
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; background: #f8f9fc; width: 30%;"><strong>Patient Name:</strong></td><td style="padding: 8px;">${report.patient_name}</td></tr>
          <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Test Name:</strong></td><td style="padding: 8px;">${report.test_name}</td></tr>
          <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Test Date:</strong></td><td style="padding: 8px;">${report.test_date}</td></tr>
          <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Doctor:</strong></td><td style="padding: 8px;">${report.doctor_name || "N/A"}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 20px;">
        <h3 style="color: #2b7cff;">Test Results</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e9ecef;">
          <tr style="background: #2b7cff; color: white;"><th style="padding: 10px; text-align: left;">Parameter</th><th style="padding: 10px; text-align: left;">Result</th><th style="padding: 10px; text-align: left;">Normal Range</th></tr>
          <tr><td style="padding: 10px; border: 1px solid #e9ecef;">${report.test_name}</td><td style="padding: 10px; border: 1px solid #e9ecef;">${report.result || "Pending"}</td><td style="padding: 10px; border: 1px solid #e9ecef;">${report.normal_range || "Not specified"}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 20px;">
        <h3 style="color: #2b7cff;">Remarks</h3>
        <p style="padding: 10px; background: #f8f9fc; border-radius: 8px;">${report.remark || "No remarks"}</p>
      </div>
      <div style="margin-top: 40px; text-align: right;">
        <p>_________________________</p>
        <p>Authorized Signatory</p>
      </div>
      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #6c757d;">
        <p>This is a computer-generated report. No signature is required.</p>
      </div>
    `;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `LabReport_${report.id}_${report.patient_name}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
    showToast("PDF downloaded successfully!");
  };

  const handleDownload = (report) => {
    if (report.status === "pending") {
      showToast("Report not available yet", "error");
      return;
    }
    generatePDF(report);
  };

  if (loading) return <div className="loading-state">Loading reports...</div>;

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>My Lab Reports</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
        {reports.length === 0 ? (
          <div className="no-data">No lab reports found.</div>
        ) : (
          reports.map(report => (
            <div className="card-item" key={report.id}>
              <div className="card-header">
                <h3>{report.test_name}</h3>
                <span className={`status-badge ${report.status}`}>{report.status}</span>
              </div>
              <div className="card-body">
                <p><strong>Doctor:</strong> {report.doctor_name || "N/A"}</p>
                <p><strong>Date:</strong> {report.test_date}</p>
                <p><strong>Result:</strong> {report.result || "Pending"}</p>
              </div>
              <div className="card-actions">
                <button className="btn-sm btn-view" onClick={() => handleView(report)}>View Details</button>
                {report.status === "completed" && (
                  <button className="btn-sm btn-download" onClick={() => handleDownload(report)}>Download</button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}