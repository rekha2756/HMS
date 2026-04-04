import React, { useState, useEffect } from "react";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar";
import "../../css/patient/patient.css";
import html2pdf from "html2pdf.js";

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await api.get("/bills");
      setBills(res.data);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateBillPDF = (bill) => {
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
        <h2 style="color: #1a2c3e;">Tax Invoice / Bill Receipt</h2>
      </div>
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; background: #f8f9fc; width: 30%;"><strong>Bill ID:</strong></td><td style="padding: 8px;">${bill.id}</td></tr>
          <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Bill Date:</strong></td><td style="padding: 8px;">${bill.bill_date || new Date(bill.created_at).toLocaleDateString()}</td></tr>
          <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Patient Name:</strong></td><td style="padding: 8px;">${bill.patient_name}</td></tr>
          <tr><td style="padding: 8px; background: #f8f9fc;"><strong>Description:</strong></td><td style="padding: 8px;">${bill.description || "Medical Services"}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 20px;">
        <h3 style="color: #2b7cff;">Bill Summary</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e9ecef;">
          <tr style="background: #2b7cff; color: white;"><th style="padding: 10px; text-align: left;">Particulars</th><th style="padding: 10px; text-align: right;">Amount (₹)</th></tr>
          <tr><td style="padding: 10px; border: 1px solid #e9ecef;">Consultation / Services</td><td style="padding: 10px; border: 1px solid #e9ecef; text-align: right;">₹${bill.total_amount || bill.amount}</td></tr>
          <tr style="background: #f8f9fc;"><td style="padding: 10px; font-weight: bold;">Total Amount</td><td style="padding: 10px; text-align: right; font-weight: bold;">₹${bill.total_amount || bill.amount}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 20px;">
        <p><strong>Payment Status:</strong> <span style="color: ${bill.payment_status === "Paid" ? "#28a745" : "#dc3545"};">${bill.payment_status || "Pending"}</span></p>
        ${bill.payment_method ? `<p><strong>Payment Method:</strong> ${bill.payment_method}</p>` : ""}
      </div>
      <div style="margin-top: 40px; text-align: right;">
        <p>_________________________</p>
        <p>Authorized Signatory</p>
      </div>
      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #6c757d;">
        <p>Thank you for choosing HealthAxis. Wishing you a speedy recovery!</p>
      </div>
    `;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Bill_${bill.id}_${bill.patient_name}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
    showToast("Bill downloaded successfully!");
  };

  const handlePay = async (billId) => {
    // Placeholder for payment gateway integration
    alert("Payment integration coming soon");
  };

  const handleDownload = (bill) => {
    generateBillPDF(bill);
  };

  if (loading) return <div className="loading-state">Loading bills...</div>;

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>My Bills</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
        {bills.length === 0 ? (
          <div className="no-data">No bills found.</div>
        ) : (
          bills.map(bill => (
            <div className="card-item" key={bill.id}>
              <div className="card-header">
                <h3>{bill.description || "Medical Bill"}</h3>
                <span className={`status-badge ${bill.payment_status === "Paid" ? "paid" : "unpaid"}`}>{bill.payment_status || "Pending"}</span>
              </div>
              <div className="card-body">
                <p><strong>Date:</strong> {bill.bill_date || bill.created_at?.split("T")[0]}</p>
                <p><strong>Total Amount:</strong> ₹{bill.total_amount || bill.amount}</p>
              </div>
              <div className="card-actions">
                {bill.payment_status !== "Paid" && (
                  <button className="btn-sm btn-pay" onClick={() => handlePay(bill.id)}>Pay Now</button>
                )}
                <button className="btn-sm btn-download" onClick={() => handleDownload(bill)}>Download Receipt</button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}