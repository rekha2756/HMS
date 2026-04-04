import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import PatientSidebar from "../../components/patientsidebar.jsx";
import "../../css/patient/patient.css";

export default function PrescriptionDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const prescription = location.state;
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const prescriptionRef = React.useRef(null);

  if (!prescription) {
    return <div className="error-state">No prescription data found</div>;
  }

  const handleDownload = () => {
    const element = prescriptionRef.current;
    const opt = {
      margin: 0.5,
      filename: `Prescription_${prescription.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
  };

  const medicinesList = prescription.medicines ? prescription.medicines.split("\n") : [];

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <h1>Prescription Details</h1>
          </div>
          <button className="download-btn" onClick={handleDownload}>📄 Download PDF</button>
        </header>
        <div ref={prescriptionRef} className="report-card">
          <h3>Medical Prescription</h3>
          <div className="details-grid">
            <div><strong>Doctor:</strong> Dr. {prescription.doctor_name}</div>
            <div><strong>Date:</strong> {new Date(prescription.created_at).toLocaleDateString()}</div>
            <div><strong>Diagnosis:</strong> {prescription.diagnosis || "N/A"}</div>
            <div className="full-width"><strong>Medicines:</strong>
              <ul>{medicinesList.map((m, i) => <li key={i}>{m}</li>)}</ul>
            </div>
            <div className="full-width"><strong>Doctor's Notes:</strong> {prescription.notes || "None"}</div>
          </div>
        </div>
      </main>
    </div>
  );
}