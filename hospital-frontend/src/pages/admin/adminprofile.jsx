import React, { useState, useEffect } from "react";
import api from "../../services/api";
import AdminSidebar from "../../components/adminsidebar";
import "../../css/admin/admindashboard.css";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    address: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/admin/profile");
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // Use mock data if backend endpoint not ready
      const mockProfile = {
        name: "Admin User",
        email: "admin@healthaxis.com",
        phone: "+91 9876543210",
        department: "Hospital Management",
        address: "Chennai, Tamil Nadu, India",
        role: "Super Admin",
      };
      setProfile(mockProfile);
      setFormData(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async () => {
    try {
      await api.put("/admin/profile", formData);
      setProfile(formData);
      setEditing(false);
      showToast("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast("Failed to update profile", "error");
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">Admin Profile</h1>
            <p className="topbar__subtitle">{today}</p>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <button className="icon-btn">🔔</button>
          </div>
        </header>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {profile.name?.charAt(0) || "A"}
              </div>
              <h2>{profile.name}</h2>
              <p className="profile-role">{profile.role || "Hospital Administrator"}</p>
            </div>

            <div className="profile-details">
              {!editing ? (
                <>
                  <div className="detail-group">
                    <label>Full Name</label>
                    <p>{profile.name}</p>
                  </div>
                  <div className="detail-group">
                    <label>Email Address</label>
                    <p>{profile.email}</p>
                  </div>
                  <div className="detail-group">
                    <label>Phone Number</label>
                    <p>{profile.phone}</p>
                  </div>
                  <div className="detail-group">
                    <label>Department</label>
                    <p>{profile.department}</p>
                  </div>
                  <div className="detail-group">
                    <label>Address</label>
                    <p>{profile.address}</p>
                  </div>
                  <div className="detail-group">
                    <label>Role</label>
                    <p>{profile.role}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="detail-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="detail-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="detail-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={formData.department || ""}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="detail-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="profile-actions">
              {!editing ? (
                <button className="btn btn-primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={handleUpdate}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
      </main>
    </div>
  );
}