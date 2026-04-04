import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ReceptionistSidebar from "../../components/receptionsidebar";
import "../../css/receptionist/receptionist.css";

export default function GenerateBill() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    description: "",
    total_amount: "",
    payment_status: "Pending",
    bill_date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      showToast("Could not load patient list", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.description || !formData.total_amount) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const patient = patients.find(p => p.id === parseInt(formData.patient_id));
      if (!patient) throw new Error("Patient not found");

      const amount = parseFloat(formData.total_amount);
      // Prepare data exactly as backend expects
      const billData = {
        patient_id: patient.id,
        patient_name: patient.name,
        appointment_id: null, // optional
        description: formData.description,
        total_amount: amount,
        amount: amount,               // duplicate for compatibility
        payment_status: formData.payment_status,
        status: formData.payment_status, // duplicate for compatibility
        bill_date: formData.bill_date,
        date: formData.bill_date,        // duplicate for compatibility
      };

      const response = await api.post("/bills", billData);
      showToast("Bill generated successfully!");

      // Navigate to bill view with clean state (no extra fields)
      navigate("/receptionist/billview", {
        state: {
          id: response.data.id,
          patientId: patient.id,
          patientName: patient.name,
          description: formData.description,
          totalAmount: amount,
          paymentStatus: formData.payment_status,
          billDate: formData.bill_date,
        },
      });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Bill generation failed";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receptionist-dashboard-wrapper">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="receptionist-main-content">
        <header className="receptionist-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>Generate Bill</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient *</label>
            <select name="patient_id" value={formData.patient_id} onChange={handleChange} required>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Amount (₹) *</label>
            <input type="number" step="0.01" name="total_amount" value={formData.total_amount} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Payment Status</label>
            <select name="payment_status" value={formData.payment_status} onChange={handleChange}>
              <option>Pending</option>
              <option>Paid</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bill Date</label>
            <input type="date" name="bill_date" value={formData.bill_date} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Generating..." : "Generate Bill"}
          </button>
        </form>
      </main>
    </div>
  );
}