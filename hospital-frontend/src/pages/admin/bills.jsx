import React, { useState, useEffect } from "react";
import api from "../../services/api";
import AdminSidebar from "../../components/adminsidebar";
import "../../css/admin/admindashboard.css";

function Badge({ status }) {
  const statusClass = status?.toLowerCase() === "paid" ? "paid" : status?.toLowerCase() === "pending" ? "pending" : "overdue";
  return <span className={`badge badge--${statusClass}`}>{status}</span>;
}

export default function Bills() {
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
      setBills(res.data || []);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      showToast("Failed to load bills", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalRevenue = bills.reduce((sum, b) => sum + (Number(b.total_amount) || Number(b.amount) || 0), 0);
  const paidAmount = bills.filter(b => b.payment_status === "Paid" || b.status === "Paid").reduce((sum, b) => sum + (Number(b.total_amount) || Number(b.amount) || 0), 0);
  const pendingAmount = bills.filter(b => b.payment_status === "Pending" || b.status === "Pending").reduce((sum, b) => sum + (Number(b.total_amount) || Number(b.amount) || 0), 0);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading bills...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Bills Management</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="icon-btn">🔔</button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">💰</div>
            <p className="stat-card__label">Total Revenue</p>
            <p className="stat-card__value">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">✅</div>
            <p className="stat-card__label">Collected</p>
            <p className="stat-card__value">₹{paidAmount.toLocaleString("en-IN")}</p>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">⏳</div>
            <p className="stat-card__label">Pending</p>
            <p className="stat-card__value">₹{pendingAmount.toLocaleString("en-IN")}</p>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">📊</div>
            <p className="stat-card__label">Total Bills</p>
            <p className="stat-card__value">{bills.length}</p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td>{bill.patient_name}</td>
                    <td>{bill.description}</td>
                    <td className="amount">₹{Number(bill.total_amount || bill.amount || 0).toLocaleString("en-IN")}</td>
                    <td>{bill.bill_date || bill.date}</td>
                    <td><Badge status={bill.payment_status || bill.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
      </main>
    </div>
  );
}