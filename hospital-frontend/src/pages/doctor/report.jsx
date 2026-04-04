import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import DoctorSidebar from "../../components/doctorsidebar";
import "../../css/doctor/report.css";

function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [labReport, setLabReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Prescription fields
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const reportRef = useRef(null); // For PDF download

  useEffect(() => {
    fetchLabReport();
  }, [id]);

  const fetchLabReport = async () => {
    try {
      const res = await api.get(`/labreports/${id}`);
      setLabReport(res.data);
    } catch (err) {
      console.error("Failed to fetch lab report:", err);
      showToast("Failed to load lab report", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSavePrescription = async () => {
    if (!diagnosis.trim() && !medicines.trim()) {
      showToast("Please enter at least diagnosis or medicines", "error");
      return;
    }

    setSaving(true);
    try {
      // Prepare prescription data
      const prescriptionData = {
        patient_id: labReport.patient_id || null,
        patient_name: labReport.patient_name,
        doctor_id: labReport.doctor_id,
        diagnosis: diagnosis,
        medicines: medicines,
        notes: notes,
        lab_report_id: parseInt(id)
      };
      console.log("Saving prescription:", prescriptionData);
      
      const res = await api.post("/prescriptions", prescriptionData);
      console.log("Prescription saved:", res.data);

      // Update lab report status to completed
      await api.patch(`/labreports/${id}/status`, { status: "completed" });

      showToast("Prescription saved & lab report marked completed!");
      setTimeout(() => navigate("/doctor/pendinglabreports"), 1500);
    } catch (err) {
      console.error("Failed to save prescription:", err.response?.data || err);
      showToast(err.response?.data?.error || "Failed to save prescription", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Dynamically import html2pdf.js only when needed
      const html2pdf = (await import("html2pdf.js")).default;
      const element = reportRef.current;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `LabReport_${labReport.id}_${labReport.patient_name}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      };
      html2pdf().set(opt).from(element).save();
      showToast("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF download failed:", err);
      showToast("Failed to generate PDF", "error");
    }
  };

  if (loading) return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="doctor-main-content"><div className="loading-state">Loading lab report...</div></main>
    </div>
  );

  if (!labReport) return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="doctor-main-content"><div className="error-state">Lab report not found</div></main>
    </div>
  );

  return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="doctor-main-content">
        <header className="doctor-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h1>Lab Report & Prescription</h1>
          </div>
          <div className="topbar-right">
            <button className="download-btn" onClick={handleDownloadPDF}>
              📄 Download PDF
            </button>
          </div>
        </header>

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}

        {/* Printable content */}
        <div ref={reportRef} className="report-page">
          {/* Lab Report Details Card */}
          <div className="report-card lab-details">
            <h3>🔬 Lab Report Details</h3>
            <div className="details-grid">
              <div><strong>Patient:</strong> {labReport.patient_name}</div>
              <div><strong>Test Name:</strong> {labReport.test_name}</div>
              <div><strong>Test Date:</strong> {labReport.test_date}</div>
              <div><strong>Result:</strong> {labReport.result || "Pending"}</div>
              <div><strong>Normal Range:</strong> {labReport.normal_range || "Not specified"}</div>
              <div><strong>Remarks:</strong> {labReport.remark || "None"}</div>
              <div><strong>Status:</strong> 
                <span className={`status-badge ${labReport.status}`}>{labReport.status}</span>
              </div>
            </div>
          </div>

          {/* Prescription Form Card (visible only when editing) */}
          <div className="report-card">
            <h3>📝 Add Prescription</h3>
            <div className="form-group">
              <label>Diagnosis *</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis (e.g., Acute pharyngitis, Hypertension)"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Medicines *</label>
              <textarea
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
                placeholder="Enter medicines (one per line or comma separated)&#10;e.g.,&#10;Paracetamol 500mg - Twice daily for 5 days&#10;Amoxicillin 250mg - Three times daily"
                rows="5"
              />
            </div>
            <div className="form-group">
              <label>Doctor's Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional instructions, follow-up advice, diet restrictions, etc."
                rows="4"
              />
            </div>
            <div className="report-buttons">
              <button 
                className="generate-btn" 
                onClick={handleSavePrescription}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Prescription & Complete Report"}
              </button>
            </div>
          </div>

          {/* Display saved prescription (if any) – optional */}
          {/* You can fetch and show existing prescription here */}
        </div>
      </main>
    </div>
  );
}

export default Report;