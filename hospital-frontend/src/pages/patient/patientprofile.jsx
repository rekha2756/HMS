import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import api from "../../services/api";
import PatientSidebar from "../../components/patientsidebar.jsx";
import "../../css/patient/patient.css";

export default function PatientProfile() {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/patient/profile");
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put("/patient/profile", formData);
      setProfile(formData);
      setEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      showToast("Failed to update profile", "error");
    }
  };

  if (loading) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="patient-dashboard-wrapper">
      <PatientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="patient-main-content">
        <header className="patient-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>My Profile</h1>
          </div>
        </header>
        {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{profile.name?.charAt(0) || "P"}</div>
            <div className="profile-title">
              <h2>{profile.name}</h2>
              <p className="specialization">Patient ID: {profile.id || "N/A"}</p>
              {!editing && <button className="edit-btn" onClick={() => setEditing(true)}><FaEdit /> Edit Profile</button>}
            </div>
          </div>
          <div className="profile-details">
            {!editing ? (
              <>
                <div className="detail-item"><strong>Name:</strong> {profile.name}</div>
                <div className="detail-item"><strong>Age:</strong> {profile.age}</div>
                <div className="detail-item"><strong>Gender:</strong> {profile.gender}</div>
                <div className="detail-item"><strong>Blood Group:</strong> {profile.blood_group || "N/A"}</div>
                <div className="detail-item"><strong>Phone:</strong> {profile.phone}</div>
                <div className="detail-item"><strong>Email:</strong> {profile.email}</div>
                <div className="detail-item full-width"><strong>Address:</strong> {profile.address || "N/A"}</div>
              </>
            ) : (
              <>
                <div className="form-group"><label>Full Name</label><input name="name" value={formData.name || ""} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Age</label><input name="age" type="number" value={formData.age || ""} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Gender</label><select name="gender" value={formData.gender || ""} onChange={handleInputChange}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div className="form-group"><label>Blood Group</label><input name="blood_group" value={formData.blood_group || ""} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Phone</label><input name="phone" value={formData.phone || ""} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Email</label><input name="email" type="email" value={formData.email || ""} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Address</label><textarea name="address" rows="3" value={formData.address || ""} onChange={handleInputChange} /></div>
              </>
            )}
          </div>
          {editing && (
            <div className="profile-actions">
              <button className="btn btn-primary" onClick={handleUpdate}><FaSave /> Save</button>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setFormData(profile); }}><FaTimes /> Cancel</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}