import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar.jsx";
import "../../css/patient/patient.css";

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (prescription) => {
    navigate("/patient/prescriptiondetails", { state: prescription });
  };

  if (loading) return <div className="loading-state">Loading prescriptions...</div>;

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>My Prescriptions</h1>
          </div>
        </header>
        {prescriptions.length === 0 ? (
          <div className="no-data">No prescriptions found.</div>
        ) : (
          prescriptions.map(pres => (
            <div className="card-item" key={pres.id}>
              <div className="card-header">
                <h3>Dr. {pres.doctor_name || "Doctor"}</h3>
                <span className="date">{new Date(pres.created_at).toLocaleDateString()}</span>
              </div>
              <div className="card-body">
                <p><strong>Diagnosis:</strong> {pres.diagnosis || "N/A"}</p>
                <p><strong>Medicines:</strong> {pres.medicines ? pres.medicines.substring(0, 100) + "..." : "N/A"}</p>
              </div>
              <div className="card-actions">
                <button className="btn-sm btn-view" onClick={() => handleView(pres)}>View Full</button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}