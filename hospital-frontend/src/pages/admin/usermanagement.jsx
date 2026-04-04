import React, { useState, useEffect } from "react";
import api from "../../services/api";
import AdminSidebar from "../../components/adminsidebar";
import "../../css/admin/admindashboard.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    phone: ""
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      console.log("Users fetched:", res.data);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      showToast("Please fill all required fields", "error");
      return;
    }
    try {
      await api.post("/users", formData);
      showToast("User added successfully");
      setShowModal(false);
      setFormData({ name: "", email: "", role: "", password: "", phone: "" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to add user:", err);
      showToast("Failed to add user", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      showToast("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Delete failed", "error");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await api.patch(`/users/${id}/status`, { status: newStatus });
      showToast(`User ${newStatus.toLowerCase()}d`);
      fetchUsers();
    } catch (err) {
      console.error("Status update failed:", err);
      showToast("Status update failed", "error");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole ? user.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="admin-main"><div className="loading-state">Loading users...</div></main>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">User Management</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="icon-btn" onClick={() => setShowModal(true)}>➕</button>
          </div>
        </header>

        <div className="filters-bar" style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: "300px" }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
            <option value="receptionist">Receptionist</option>
          </select>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      <span className={`badge badge--${user.status === "Active" ? "completed" : "cancelled"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 12px", marginRight: "8px", fontSize: "11px" }}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                      >
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>Click the + button to add a new user</p>
          </div>
        )}

        {/* Modal for Add User */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h2 className="modal__title">Add New User</h2>
                <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal__body">
                <form onSubmit={handleSubmit} className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                        <option value="receptionist">Receptionist</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                  </div>
                  <div className="form-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add User</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
      </main>
    </div>
  );
}