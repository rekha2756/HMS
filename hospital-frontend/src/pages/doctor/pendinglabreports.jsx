import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import DoctorSidebar from "../../components/doctorsidebar";
import "../../css/doctor/doctor.css";

export default function PendingLabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/labreports");
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to fetch lab reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
                          report.test_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="status-badge pending">Pending</span>,
      "in-progress": <span className="status-badge in-progress">In Progress</span>,
      completed: <span className="status-badge completed">Completed</span>,
    };
    return badges[status] || <span>{status}</span>;
  };

  if (loading) return <div className="loading-state">Loading lab reports...</div>;

  return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="doctor-main-content">
        <header className="doctor-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>Lab Reports</h1>
          </div>
          <div className="topbar-right">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search patients or tests..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </header>

        <div className="filter-bar">
          <FaFilter className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option><option value="pending">Pending</option>
            <option value="in-progress">In Progress</option><option value="completed">Completed</option>
          </select>
        </div>

        <div className="reports-container">
          <table className="reports-table">
            <thead>
              <tr><th>Patient</th><th>Test</th><th>Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.patient_name}</td>
                  <td>{report.test_name}</td>
                  <td>{report.test_date}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>
                    <button className="action-btn view" onClick={() => navigate(`/doctor/report/${report.id}`)}>
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && <p className="no-data">No lab reports found.</p>}
        </div>
      </main>
    </div>
  );
}