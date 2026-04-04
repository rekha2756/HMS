import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaHospital, FaClock, FaUserMd, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import api from "../../services/api";
import DoctorSidebar from "../../components/doctorsidebar";
import "../../css/doctor/doctor.css";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({
    name: "", 
    specialization: "", 
    experience: "", 
    email: "", 
    phone: "", 
    hospital: "", 
    about: "",
    consultation_fee: "",
    rating: ""
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDoctorProfile = async () => {
    setLoading(true);
    try {
      // ✅ Correct endpoint: /api/doctor/profile
      const res = await api.get("/doctor/profile");
      console.log("Fetched doctor data:", res.data);
      setDoctor(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch doctor profile:", err);
      showToast("Failed to load profile", "error");
      // Fallback data
      const fallbackData = {
        name: "Dr. Priya Sharma", 
        specialization: "Cardiologist", 
        experience: "8 Years",
        email: "priya@example.com", 
        phone: "+91 9876543210", 
        hospital: "City Hospital, Chennai",
        about: "Dr. Priya is a dedicated cardiologist with over 8 years of experience.",
        consultation_fee: "1200",
        rating: "4.8"
      };
      setDoctor(fallbackData);
      setFormData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      // ✅ Prepare the data to send to backend
      const updateData = {
        name: formData.name || doctor.name,
        specialization: formData.specialization || doctor.specialization,
        experience: formData.experience || doctor.experience,
        email: formData.email || doctor.email,
        phone: formData.phone || doctor.phone,
        hospital: formData.hospital || doctor.hospital,
        about: formData.about || doctor.about,
        consultation_fee: formData.consultation_fee || doctor.consultation_fee
      };
      
      console.log("Sending update data:", updateData);
      
      // ✅ Correct endpoint: /api/doctor/profile
      const response = await api.put("/doctor/profile", updateData);
      console.log("Update response:", response.data);
      
      // Update local state with new data
      setDoctor(formData);
      setEditing(false);
      showToast("Profile updated successfully!");
      
      // Refresh profile to get latest data
      await fetchDoctorProfile();
      
    } catch (err) {
      console.error("Failed to update profile:", err);
      console.error("Error response:", err.response?.data);
      showToast(err.response?.data?.error || "Failed to update profile", "error");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="doctor-main-content">
        <div className="loading-state">Loading profile...</div>
      </main>
    </div>
  );

  return (
    <div className="doctor-dashboard-wrapper">
      <DoctorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="doctor-main-content">
        <header className="doctor-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1>Doctor Profile</h1>
          </div>
        </header>

        {toast && (
          <div className={`toast toast--${toast.type}`}>
            {toast.type === "success" ? "✓" : "✗"} {toast.message}
          </div>
        )}

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">{doctor.name?.charAt(0) || "D"}</div>
              <div className="profile-title">
                <h2>{doctor.name}</h2>
                <p className="specialization">{doctor.specialization}</p>
                <div className="rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-value">{doctor.rating || "4.5"}</span>
                </div>
                {!editing && (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-box">
                <h3>{doctor.patients_count || "120"}+</h3>
                <p>Patients Treated</p>
              </div>
              <div className="stat-box">
                <h3>{doctor.appointments_count || "45"}</h3>
                <p>Appointments</p>
              </div>
              <div className="stat-box">
                <h3>₹{doctor.consultation_fee || "800"}</h3>
                <p>Consultation Fee</p>
              </div>
            </div>

            <div className="profile-details">
              {!editing ? (
                <>
                  <div className="detail-item">
                    <FaClock className="detail-icon" />
                    <div>
                      <strong>Experience</strong>
                      <p>{doctor.experience || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FaEnvelope className="detail-icon" />
                    <div>
                      <strong>Email</strong>
                      <p>{doctor.email || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FaPhone className="detail-icon" />
                    <div>
                      <strong>Phone</strong>
                      <p>{doctor.phone || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FaHospital className="detail-icon" />
                    <div>
                      <strong>Hospital</strong>
                      <p>{doctor.hospital || "Not specified"}</p>
                    </div>
                  </div>
                  {doctor.about && (
                    <div className="detail-item full-width">
                      <FaUserMd className="detail-icon" />
                      <div>
                        <strong>About</strong>
                        <p>{doctor.about}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name || ""} 
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input 
                      type="text" 
                      name="specialization"
                      value={formData.specialization || ""} 
                      onChange={handleInputChange}
                      placeholder="e.g., Cardiologist"
                    />
                  </div>
                  <div className="form-group">
                    <label>Experience</label>
                    <input 
                      type="text" 
                      name="experience"
                      value={formData.experience || ""} 
                      onChange={handleInputChange}
                      placeholder="e.g., 8 years"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email || ""} 
                      onChange={handleInputChange}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone || ""} 
                      onChange={handleInputChange}
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>Hospital/Affiliation</label>
                    <input 
                      type="text" 
                      name="hospital"
                      value={formData.hospital || ""} 
                      onChange={handleInputChange}
                      placeholder="Hospital name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Consultation Fee (₹)</label>
                    <input 
                      type="number" 
                      name="consultation_fee"
                      value={formData.consultation_fee || ""} 
                      onChange={handleInputChange}
                      placeholder="e.g., 800"
                    />
                  </div>
                  <div className="form-group">
                    <label>About / Bio</label>
                    <textarea 
                      name="about"
                      value={formData.about || ""} 
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Tell patients about your experience and expertise..."
                    />
                  </div>
                </>
              )}
            </div>

            {editing && (
              <div className="profile-actions">
                <button className="btn btn-primary" onClick={handleUpdate}>
                  <FaSave /> Save Changes
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  setEditing(false);
                  setFormData(doctor);
                }}>
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}