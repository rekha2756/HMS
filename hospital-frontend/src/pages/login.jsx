import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/login.css";

function Login() {
  const navigate = useNavigate();

  // ================= STATE =================
  const [role, setRole] = useState("patient");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);

  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  
  // Resend timer state
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // ================= ROLE CONFIG =================
  const roleConfig = {
    doctor: { label: "Doctor" },
    patient: { label: "Patient" },
    admin: { label: "Admin" },
    receptionist: { label: "Reception" },
  };

  // ================= HELPERS =================
  const clearErrors = useCallback(() => {
    setErrors({});
    setSuccess("");
  }, []);

  const showError = useCallback(
    (message) => {
      setErrors({ general: message });
      setTimeout(() => clearErrors(), 5000);
    },
    [clearErrors]
  );

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 5000);
  }, []);

  // Lock after 3 failed login attempts
  useEffect(() => {
    if (loginAttempts >= 3 && !isLocked) {
      setIsLocked(true);
      setLockTimeLeft(300);
      showError("Too many failed attempts. Account locked for 5 minutes.");
    }
  }, [loginAttempts, isLocked, showError]);

  useEffect(() => {
    if (isLocked && lockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLockTimeLeft(lockTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (isLocked && lockTimeLeft === 0) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [isLocked, lockTimeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  // ================= LOGIN =================
  const loginUser = async () => {
    clearErrors();

    if (isLocked) {
      showError(`Account locked. Try again in ${Math.floor(lockTimeLeft / 60)}:${(lockTimeLeft % 60).toString().padStart(2, "0")}`);
      return;
    }

    if (!email.trim()) {
      setErrors({ email: "Please enter your email address" });
      return;
    }
    if (!password) {
      setErrors({ password: "Please enter your password" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.id);
      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      else localStorage.removeItem("rememberedEmail");

      showSuccess(`Welcome back! Redirecting to ${roleConfig[user.role]?.label} dashboard...`);

      const routeMap = {
        admin: "/admin/admindashboard",
        doctor: "/doctor/doctordashboard",
        patient: "/patient/patientdashboard",
        receptionist: "/receptionist/dashboard",
      };
      setTimeout(() => navigate(routeMap[user.role]), 1000);
    } catch (err) {
      setLoginAttempts((prev) => prev + 1);
      showError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= REGISTRATION FLOW =================
  const validateRegistration = () => {
    if (!name.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    if (!password) return "Password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSendOtp = async () => {
    const errorMsg = validateRegistration();
    if (errorMsg) {
      showError(errorMsg);
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/send-otp", { email });
      setOtpSent(true);
      setShowOtpModal(true);
      setOtpError("");
      showSuccess("OTP sent to your email. Please check your inbox.");
      // Start cooldown (60 seconds)
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      showError(err.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      await api.post("/send-otp", { email });
      setOtpError("");
      showSuccess("OTP resent successfully!");
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      showError(err.response?.data?.error || "Failed to resend OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP
      await api.post("/verify-otp", { email, otp });

      // Register patient
      const registrationPayload = {
        email,
        password,
        name,
        age: age ? parseInt(age) : null,
        gender,
        phone,
        address,
        blood_group: bloodGroup,
      };
      const regResponse = await api.post("/register-patient", registrationPayload);
      const { accessToken, user } = regResponse.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("rememberedEmail", email);

      showSuccess("Registration successful! Redirecting to dashboard...");
      setTimeout(() => navigate("/patient/patientdashboard"), 1500);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    handleSendOtp();
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setAge("");
    setGender("");
    setPhone("");
    setAddress("");
    setBloodGroup("");
    setErrors({});
    setSuccess("");
    setOtp("");
    setOtpError("");
    setShowOtpModal(false);
    setOtpSent(false);
    setResendCooldown(0);
    setCanResend(true);
  };

  const toggleRegisterMode = (e) => {
    e.preventDefault();
    setIsRegister(!isRegister);
    resetForm();
  };

  const getTitle = () => (isRegister ? "Create Account" : "Sign In");
  const getSubtitle = () =>
    isRegister
      ? "Join HealthAxis as a patient"
      : `Secure access to your ${roleConfig[role].label} portal`;

  // ================= UI =================
  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2v20M2 12h20" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="brand-name">HealthAxis</h1>
          </div>
          <p className="brand-tagline">Hospital Management System</p>
          <h2 className="hero-headline">Precision care, powered by innovation.</h2>
          <p className="hero-description">
            Seamless access to electronic health records, appointments, and clinical workflows — all in one secure platform.
          </p>
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-value">50K+</div><div className="stat-label">Patients served</div></div>
            <div className="stat-item"><div className="stat-value">200+</div><div className="stat-label">Specialists</div></div>
            <div className="stat-item"><div className="stat-value">24/7</div><div className="stat-label">Clinical support</div></div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          {!isRegister && (
            <div className="role-selector">
              {Object.entries(roleConfig).map(([key, val]) => (
                <button
                  key={key}
                  className={`role-pill ${role === key ? "active" : ""}`}
                  onClick={() => { setRole(key); resetForm(); }}
                >
                  <span className="role-icon">
                    {key === "doctor" && "👨‍⚕️"}
                    {key === "patient" && "👤"}
                    {key === "admin" && "🛡️"}
                    {key === "receptionist" && "📞"}
                  </span>
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
          )}

          {errors.general && (
            <div className="alert alert-error"><span>⚠️ {errors.general}</span></div>
          )}
          {success && (
            <div className="alert alert-success">
              <span className="success-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <div className="form-header">
            <h2 className="form-title">{getTitle()}</h2>
            <p className="form-subtitle">{getSubtitle()}</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="form-section">
            {isRegister && (
              <>
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Age</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📅</span>
                    <input type="number" className="form-input" placeholder="30" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Gender</label>
                  <div className="input-wrapper">
                    <span className="input-icon">⚥</span>
                    <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📞</span>
                    <input type="tel" className="form-input" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📍</span>
                    <input type="text" className="form-input" placeholder="City, State" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Blood Group</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🩸</span>
                    <input type="text" className="form-input" placeholder="O+" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Email address *</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input type="email" className={`form-input ${errors.email ? "error" : ""}`} placeholder="name@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <div className="label-row">
                <label className="input-label">Password *</label>
                {role === "patient" && !isRegister && (
                  <button type="button" className="text-link small" onClick={() => alert("Password reset coming soon")}>Forgot password?</button>
                )}
              </div>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="input-group">
                <label className="input-label">Confirm Password *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input type="password" className="form-input" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="checkbox-text">Remember me</span>
                </label>
              </div>
            )}

            {!isRegister ? (
              <>
                <button type="button" className="btn btn-primary" onClick={loginUser} disabled={isLoading || isLocked}>
                  {isLoading ? "Signing in..." : `Sign in as ${roleConfig[role].label}`}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleRegister} disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Create account"}
              </button>
            )}

            {role === "patient" && (
              <div className="form-footer-link">
                {isRegister ? (
                  <>Already have an account? <button className="text-link" onClick={toggleRegisterMode}>Sign in</button></>
                ) : (
                  <>New to HealthAxis? <button className="text-link" onClick={toggleRegisterMode}>Create account</button></>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* OTP Modal with Resend Button */}
      {showOtpModal && (
        <div className="modal-overlay" onClick={() => { if (!isLoading) setShowOtpModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Verify Your Email</h3>
            <p>We've sent a 6-digit OTP to <strong>{email}</strong></p>
            
            <div className="input-group">
              <input 
                type="text" 
                maxLength="6" 
                className="form-input otp-input" 
                placeholder="Enter OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                autoFocus
              />
            </div>
            
            {otpError && <span className="error-message">{otpError}</span>}
            
            {/* Resend section */}
            <div className="resend-section">
              {resendCooldown > 0 ? (
                <span className="resend-timer">Resend available in {resendCooldown}s</span>
              ) : (
                <button 
                  type="button" 
                  className="resend-btn" 
                  onClick={handleResendOtp} 
                  disabled={!canResend || isLoading}
                >
                  Resend OTP
                </button>
              )}
            </div>
            
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setShowOtpModal(false)} disabled={isLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleVerifyOtpAndRegister} disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;