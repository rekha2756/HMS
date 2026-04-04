import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUserMd, FaCalendarAlt, FaClock, FaStethoscope, FaNotesMedical, FaArrowLeft, FaFlask } from "react-icons/fa";
import api from "../../services/api";
import DoctorSidebar from "../../components/doctorsidebar";
import "../../css/doctor/viewappointment.css";

export default function ViewAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState(null);
  const [generatingLab, setGeneratingLab] = useState(false);
  const [hasLabReport, setHasLabReport] = useState(false);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      const res = await api.get(`/appointments/${id}`);
      setAppointment(res.data);
      setStatus(res.data.status);
      setNotes(res.data.notes || "");
      
      // Check if a lab report already exists for this appointment
      if (res.data.id) {
        const labReportsRes = await api.get("/labreports");
        const existing = labReportsRes.data.find(
          (report) => report.appointment_id === res.data.id || 
                      (report.patient_id === res.data.patient_id && report.test_name?.includes("Consultation"))
        );
        setHasLabReport(!!existing);
      }
    } catch (err) {
      console.error("Failed to fetch appointment details:", err);
      showToast("Failed to load appointment details", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus, notes });
      setStatus(newStatus);
      showToast(`Appointment ${newStatus} successfully`);
      fetchAppointmentDetails(); // Refresh to update button visibility
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Failed to update status", "error");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.put(`/appointments/${id}`, { status, notes });
      showToast("Notes saved successfully");
    } catch (err) {
      console.error("Failed to save notes:", err);
      showToast("Failed to save notes", "error");
    }
  };

  const handleGenerateLabReport = async () => {
    if (hasLabReport) {
      showToast("A lab report already exists for this appointment", "error");
      return;
    }
    if (!appointment.patient_id && !appointment.patient_name) {
      showToast("Patient information missing", "error");
      return;
    }
    setGeneratingLab(true);
    try {
      const labData = {
        patient_id: appointment.patient_id || null,
        patient_name: appointment.patient_name,
        doctor_id: null, // backend auto-fills from logged-in doctor
        test_name: "Post-Consultation Lab Report",
        test_date: new Date().toISOString().split('T')[0],
        result: "Pending",
        normal_range: "",
        remark: `Generated from appointment #${appointment.id} after completion`,
        status: "pending",
        appointment_id: appointment.id // if your lab_reports table has this column
      };
      const res = await api.post("/labreports", labData);
      setHasLabReport(true);
      showToast("Lab report created! Redirecting...");
      setTimeout(() => navigate(`/doctor/report/${res.data.id}`), 1500);
    } catch (err) {
      console.error("Failed to create lab report:", err);
      showToast("Failed to create lab report", "error");
    } finally {
      setGeneratingLab(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: <span className="status-badge confirmed">Confirmed</span>,
      pending: <span className="status-badge pending">Pending</span>,
      completed: <span className="status-badge completed">Completed</span>,
      cancelled: <span className="status-badge cancelled">Cancelled</span>,
    };
    return badges[status] || <span className="status-badge pending">{status}</span>;
  };

  if (loading) return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="doctor-main-content"><div className="loading-state">Loading appointment details...</div></main>
    </div>
  );

  if (!appointment) return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="doctor-main-content"><div className="error-state">Appointment not found</div></main>
    </div>
  );

  return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="doctor-main-content">
        <header className="doctor-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Back
            </button>
            <h1>Appointment Details</h1>
          </div>
        </header>

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}

        <div className="appointment-detail-container">
          <div className="detail-card">
            <div className="detail-header">
              <h2>Patient Information</h2>
              {getStatusBadge(status)}
            </div>
            <div className="detail-content">
              <div className="detail-row">
                <div className="detail-item">
                  <FaUserMd className="detail-icon" />
                  <div><strong>Patient Name</strong><p>{appointment.patient_name}</p></div>
                </div>
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <div><strong>Date</strong><p>{appointment.appointment_date}</p></div>
                </div>
                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <div><strong>Time</strong><p>{appointment.appointment_time}</p></div>
                </div>
                <div className="detail-item">
                  <FaStethoscope className="detail-icon" />
                  <div><strong>Type</strong><p>{appointment.type || "Consultation"}</p></div>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item full-width">
                  <FaNotesMedical className="detail-icon" />
                  <div><strong>Reason for Visit</strong><p>{appointment.reason || "No reason provided"}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-header">
              <h2>Doctor's Notes</h2>
            </div>
            <div className="detail-content">
              <textarea
                className="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your consultation notes, diagnosis, and prescription here..."
                rows="6"
              />
              <button className="btn btn-primary" onClick={handleSaveNotes}>
                Save Notes
              </button>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-header">
              <h2>Update Status</h2>
            </div>
            <div className="detail-content">
              <div className="status-buttons">
                <button 
                  className={`status-btn ${status === 'confirmed' ? 'active' : ''}`}
                  onClick={() => handleUpdateStatus('confirmed')}
                >
                  Confirm
                </button>
                <button 
                  className={`status-btn ${status === 'completed' ? 'active' : ''}`}
                  onClick={() => handleUpdateStatus('completed')}
                >
                  Complete
                </button>
                <button 
                  className={`status-btn ${status === 'cancelled' ? 'active' : ''}`}
                  onClick={() => handleUpdateStatus('cancelled')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Lab Report Button - only visible when appointment status is 'completed' */}
          {status === 'completed' && (
            <div className="detail-card">
              <div className="detail-header">
                <h2>Generate Lab Report</h2>
              </div>
              <div className="detail-content">
                <button 
                  className="btn btn-lab" 
                  onClick={handleGenerateLabReport}
                  disabled={generatingLab || hasLabReport}
                  style={{ background: hasLabReport ? '#95a5a6' : '#6c63ff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <FaFlask style={{ marginRight: '8px' }} />
                  {generatingLab ? "Creating..." : hasLabReport ? "Lab Report Already Generated" : "Generate Lab Report"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}