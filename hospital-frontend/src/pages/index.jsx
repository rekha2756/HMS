import React, { useEffect, useRef, useState } from "react";
import "../css/index.css";

const SPECIALTIES = [
  { icon: "🫀", name: "Cardiology" },
  { icon: "🧠", name: "Neurology" },
  { icon: "🦴", name: "Orthopaedics" },
  { icon: "👁️", name: "Ophthalmology" },
  { icon: "🫁", name: "Pulmonology" },
  { icon: "🧬", name: "Oncology" },
  { icon: "🤰", name: "Gynaecology" },
  { icon: "🦷", name: "Dentistry" },
  { icon: "👶", name: "Paediatrics" },
  { icon: "🩺", name: "General Medicine" },
  { icon: "🧪", name: "Pathology" },
  { icon: "🏋️", name: "Physiotherapy" },
];

const SERVICES = [
  {
    icon: "🧑‍⚕️",
    title: "Patient Management",
    desc: "Unified patient profiles with complete medical history, demographics, and visit records — accessible across all hospital units.",
    tag: "Core Module",
  },
  {
    icon: "📅",
    title: "Smart Appointment Booking",
    desc: "Real-time slot availability, automated reminders via SMS/WhatsApp, and zero-conflict scheduling across departments.",
    tag: "Patient-Facing",
  },
  {
    icon: "🗂️",
    title: "Electronic Medical Records",
    desc: "Structured, searchable digital health records with full audit trails, version control, and HL7 FHIR compatibility.",
    tag: "Clinical",
  },
  {
    icon: "🧾",
    title: "Billing & Insurance",
    desc: "Automated itemised billing, TPA/insurance claim workflows, GST-compliant invoices, and real-time payment tracking.",
    tag: "Finance",
  },
  {
    icon: "📊",
    title: "Admin Command Centre",
    desc: "Real-time KPIs across all hospitals — beds, OPD/IPD load, doctor availability, revenue, and occupancy rates.",
    tag: "Operations",
  },
  {
    icon: "💊",
    title: "Pharmacy Management",
    desc: "Drug inventory with expiry tracking, prescription fulfilment, reorder alerts, and controlled substance logging.",
    tag: "Pharmacy",
  },
  {
    icon: "🔬",
    title: "Laboratory Information System",
    desc: "End-to-end lab workflow — test orders, sample tracking, result entry, auto-report generation, and patient delivery.",
    tag: "Diagnostics",
  },
  {
    icon: "👨‍⚕️",
    title: "Doctor & Staff Management",
    desc: "Credential management, shift rostering, leave tracking, performance analytics, and inter-department consultation routing.",
    tag: "HR & Clinical",
  },
  {
    icon: "🛏️",
    title: "Bed & Ward Management",
    desc: "Live bed availability map, admission/discharge/transfer workflows, housekeeping integration, and ICU monitoring.",
    tag: "Operations",
  },
  {
    icon: "🚑",
    title: "Emergency & Triage",
    desc: "Priority-based patient intake, emergency bed allocation, trauma team alerts, and real-time vitals integration.",
    tag: "Emergency",
  },
  {
    icon: "📱",
    title: "Patient Mobile Portal",
    desc: "Patients can book appointments, access reports, view bills, and consult doctors via a branded hospital app.",
    tag: "Digital Health",
  },
  {
    icon: "📈",
    title: "Analytics & Reporting",
    desc: "Customisable dashboards, MIS reports, compliance reporting, and predictive analytics for hospital leadership.",
    tag: "Intelligence",
  },
];

const WHY_ITEMS = [
  {
    icon: "🏥",
    title: "True Multi-Tenant Architecture",
    desc: "Each hospital operates in its own isolated data silo. Zero cross-contamination — full data sovereignty for every tenant.",
  },
  {
    icon: "🔒",
    title: "Enterprise-Grade Security",
    desc: "AES-256 encryption at rest, TLS 1.3 in transit, role-based access control, and HIPAA & ABDM-aligned data governance.",
  },
  {
    icon: "⚡",
    title: "Real-Time Clinical Operations",
    desc: "Live dashboards, push notifications, and sub-second record updates ensure no delays in critical patient workflows.",
  },
  {
    icon: "🌐",
    title: "Cloud-First & Infinitely Scalable",
    desc: "Auto-scaling infrastructure on AWS. Handles 10 hospitals or 10,000 — with zero downtime during peak admission seasons.",
  },
  {
    icon: "🔗",
    title: "Interoperability & Integrations",
    desc: "Native HL7/FHIR APIs, ABDM/Ayushman Bharat compatibility, PACS/RIS integration, and 50+ third-party connectors.",
  },
  {
    icon: "🤖",
    title: "AI-Powered Clinical Insights",
    desc: "Smart diagnosis assistance, drug-interaction alerts, readmission risk scoring, and automated ICD-10 code suggestions.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "HealthAxis reduced our patient wait times by 35% in the first quarter. The appointment module alone paid for itself.",
    name: "Dr. Suresh Reddy",
    role: "Medical Director",
    hospital: "Sunrise Hospitals, Vijayawada",
    avatar: "SR",
  },
  {
    quote:
      "Managing 4 hospitals from a single dashboard was a dream. HealthAxis made it our daily reality. Outstanding support team.",
    name: "Mrs. Kavitha Nair",
    role: "CEO",
    hospital: "MediCare Group, Visakhapatnam",
    avatar: "KN",
  },
  {
    quote:
      "Our billing errors dropped to near-zero. The insurance claim module handles what used to take 3 staff members a full day.",
    name: "Dr. Raju Prasad",
    role: "Chief Financial Officer",
    hospital: "Apollo Associate, Kurnool",
    avatar: "RP",
  },
];

const ACCREDITATIONS = [
  "NABH Compliant",
  "HIPAA Aligned",
  "ABDM Ready",
  "ISO 27001",
  "HL7 FHIR",
  "GDPR Ready",
];

const STATS = [
  { num: "50", suffix: "+", label: "Hospitals Onboarded" },
  { num: "2L", suffix: "+", label: "Patients Managed" },
  { num: "99.9", suffix: "%", label: "Uptime SLA" },
  { num: "12", suffix: "+", label: "Districts Covered" },
];

export default function Index() {
  const revealEls = useRef([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    revealEls.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const r = (el) => {
    if (el && !revealEls.current.includes(el)) revealEls.current.push(el);
  };

  useEffect(() => {
    const header = document.querySelector("header");
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ── TOP BAR ── */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <span>📞 Helpline: 1800-XXX-XXXX (Toll Free)</span>
            <span className="tb-sep">|</span>
            <span>✉️ support@healthaxis.in</span>
          </div>
          <div className="topbar-right">
            <span>🏥 50+ Hospitals Trust HealthAxis</span>
            <a href="#contact" className="topbar-cta">Book a Free Demo →</a>
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header>
        <div className="header-inner">
          <a href="#home" className="logo-container">
            <div className="logo-icon">H<span>A</span></div>
            <div className="logo-text">
              <span className="logo-wordmark">Health<em>Axis</em></span>
              <span className="logo-sub">Hospital Management System</span>
            </div>
          </a>
          <nav className={mobileMenuOpen ? "open" : ""}>
            <ul>
              <li><a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a></li>
              <li className="has-dropdown">
                <a href="#services">Solutions ▾</a>
                <div className="dropdown">
                  <a href="#services">Clinical Modules</a>
                  <a href="#services">Administrative Tools</a>
                  <a href="#services">Patient Portal</a>
                  <a href="#services">Analytics & BI</a>
                </div>
              </li>
              <li><a href="#specialties" onClick={() => setMobileMenuOpen(false)}>Specialties</a></li>
              <li><a href="#why" onClick={() => setMobileMenuOpen(false)}>Why Us</a></li>
              <li><a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a></li>
              <li><a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
            </ul>
          </nav>
          <div className="header-actions">
            <a href="/login" className="btn-nav-outline">Login</a>
            <a href="#contact" className="btn-nav-fill">Request Demo</a>
            <button
              className="hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-bg" />
        <div className="hero-noise" />
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-dot" />
              Trusted across Andhra Pradesh &amp; Telangana
            </div>
            <h1>
              The Future of<br />
              <span className="hero-highlight">Hospital Management</span><br />
              Starts Here
            </h1>
            <p>
              A NABH-compliant, multi-tenant digital platform powering clinical excellence,
              administrative efficiency, and patient-first care — across every department,
              every shift, every hospital.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn-primary">
                <span>Request a Free Demo</span>
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#services" className="btn-secondary">
                Explore Platform
              </a>
            </div>
            <div className="accreditation-row">
              {ACCREDITATIONS.map((a) => (
                <span key={a} className="accred-badge">{a}</span>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-dashboard">
              <div className="dash-header">
                <div className="dash-dot red" /><div className="dash-dot yellow" /><div className="dash-dot green" />
                <span className="dash-title">HealthAxis — Live Dashboard</span>
              </div>
              <div className="dash-stats-row">
                <div className="dash-stat">
                  <span className="ds-num">247</span>
                  <span className="ds-label">Patients Today</span>
                  <span className="ds-trend up">↑ 12%</span>
                </div>
                <div className="dash-stat">
                  <span className="ds-num">38</span>
                  <span className="ds-label">Doctors On-Duty</span>
                  <span className="ds-trend stable">● Live</span>
                </div>
                <div className="dash-stat">
                  <span className="ds-num">94%</span>
                  <span className="ds-label">Bed Occupancy</span>
                  <span className="ds-trend up">↑ 3%</span>
                </div>
              </div>
              <div className="dash-modules">
                {["OPD", "IPD", "ICU", "Lab", "Pharmacy", "OT"].map((m, i) => (
                  <div className="dash-module" key={m} style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="dm-dot" />
                    <span>{m}</span>
                    <span className="dm-status">Active</span>
                  </div>
                ))}
              </div>
              <div className="dash-alert">
                <span className="alert-icon">🔔</span>
                <span>New lab report ready — Patient #A-2847</span>
              </div>
            </div>
            <div className="hero-float-card card-top">
              <span>🟢</span>
              <div>
                <strong>All Systems Operational</strong>
                <small>99.9% uptime this month</small>
              </div>
            </div>
            <div className="hero-float-card card-bottom">
              <span>📋</span>
              <div>
                <strong>NABH Audit Ready</strong>
                <small>Auto-generated compliance reports</small>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-stats-bar">
          {STATS.map((s) => (
            <div className="hstat" key={s.label}>
              <span className="hstat-num">
                {s.num}<em>{s.suffix}</em>
              </span>
              <span className="hstat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="trust-band">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {[
                "NABH Compliant", "Patient Management", "Smart Scheduling",
                "Billing & Insurance", "Pharmacy Inventory", "Lab Information System",
                "Bed Management", "Emergency Triage", "Doctor Rostering",
                "Multi-Tenant Cloud", "AI Clinical Insights", "ABDM Integrated",
              ].map((item) => (
                <React.Fragment key={item}>
                  <span>{item}</span>
                  <span className="dot">✦</span>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── SPECIALTIES ── */}
      <section className="specialties" id="specialties">
        <div className="spec-inner">
          <div className="spec-header reveal" ref={r}>
            <div className="section-label">Clinical Coverage</div>
            <h2 className="section-title">Specialties We <em>Support</em></h2>
            <p className="section-sub">
              HealthAxis is pre-configured for every major medical specialty —
              with department-specific workflows, templates, and protocols.
            </p>
          </div>
          <div className="spec-grid">
            {SPECIALTIES.map((s, i) => (
              <div className="spec-card reveal" key={s.name} ref={r}
                style={{ transitionDelay: `${i * 0.04}s` }}>
                <span className="spec-icon">{s.icon}</span>
                <span className="spec-name">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="spec-note reveal" ref={r}>
            + 30 more specialties supported · Custom specialty workflows available on request
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="services" id="services">
        <div className="services-inner">
          <div className="services-header reveal" ref={r}>
            <div className="section-label">Platform Modules</div>
            <h2 className="section-title">
              12 Integrated Modules.<br /><em>One Unified Platform.</em>
            </h2>
            <p className="section-sub">
              Every clinical and administrative workflow — from patient intake to discharge billing —
              handled seamlessly within a single, connected system.
            </p>
          </div>
          <div className="cards-grid">
            {SERVICES.map((s, i) => (
              <div
                className="svc-card reveal"
                key={s.title}
                ref={r}
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <div className="svc-top">
                  <div className="svc-icon">{s.icon}</div>
                  <span className="svc-tag">{s.tag}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <a href="#contact" className="svc-arrow">
                  Learn more
                  <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="why" id="why">
        <div className="why-inner">
          <div className="why-content">
            <div className="section-label teal">Why HealthAxis</div>
            <h2 className="section-title">
              Built for the Complexity of<br /><em>Real Healthcare</em>
            </h2>
            <p className="section-sub">
              Every feature is designed around on-ground clinical realities —
              not retrofitted from a generic SaaS template.
            </p>
            <div className="why-list">
              {WHY_ITEMS.map((w, i) => (
                <div
                  className="why-item reveal"
                  key={w.title}
                  ref={r}
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="why-item-icon">{w.icon}</div>
                  <div className="why-item-text">
                    <h4>{w.title}</h4>
                    <p>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="why-metrics reveal" ref={r}>
            <div className="why-metrics-title">Platform Performance</div>
            {[
              { num: "98%", label: "Client Satisfaction Rate", color: "#00c9a7" },
              { num: "40%", label: "Reduction in Admin Time", color: "#4fc3f7" },
              { num: "<2s", label: "Avg Page Load Time", color: "#ffb347" },
              { num: "24/7", label: "Technical Support", color: "#ff6b9d" },
              { num: "60%", label: "Faster Billing Cycles", color: "#a78bfa" },
              { num: "0", label: "Reported Data Breaches", color: "#34d399" },
            ].map((m) => (
              <div className="metric-row" key={m.label}>
                <div className="metric-bar-wrap">
                  <div
                    className="metric-bar-fill"
                    style={{ background: m.color, width: m.num.includes("%") ? m.num : "100%" }}
                  />
                </div>
                <div className="metric-info">
                  <span className="metric-val" style={{ color: m.color }}>{m.num}</span>
                  <span className="metric-lbl">{m.label}</span>
                </div>
              </div>
            ))}
            <div className="why-cert-row">
              <div className="cert-item">🏆 Best HMS — AP HealthTech Awards 2025</div>
              <div className="cert-item">✅ NABH Empanelled Vendor</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works">
        <div className="hiw-inner">
          <div className="hiw-header reveal" ref={r}>
            <div className="section-label">Implementation</div>
            <h2 className="section-title">Go Live in <em>30 Days</em></h2>
            <p className="section-sub">
              Our proven onboarding methodology ensures a smooth, zero-disruption
              transition from your legacy system to HealthAxis.
            </p>
          </div>
          <div className="hiw-steps">
            {[
              { step: "01", title: "Discovery & Scoping", desc: "We map your existing workflows, data structures, and integration requirements." },
              { step: "02", title: "Configuration & Setup", desc: "Your hospital tenant is provisioned with custom forms, roles, and department structures." },
              { step: "03", title: "Data Migration", desc: "Historical patient records, doctor data, and billing history are securely migrated." },
              { step: "04", title: "Training & Go-Live", desc: "Hands-on training for all staff levels, followed by live monitoring during launch week." },
            ].map((s, i) => (
              <div className="hiw-step reveal" key={s.step} ref={r}
                style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="hiw-step-num">{s.step}</div>
                <div className="hiw-connector" />
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials" id="testimonials">
        <div className="test-inner">
          <div className="test-header reveal" ref={r}>
            <div className="section-label">Client Stories</div>
            <h2 className="section-title">What Hospital Leaders <em>Say</em></h2>
          </div>
          <div className="test-carousel">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`test-card ${i === activeTestimonial ? "active" : ""}`}
              >
                <div className="test-stars">★★★★★</div>
                <blockquote>"{t.quote}"</blockquote>
                <div className="test-author">
                  <div className="test-avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                    <span className="test-hospital">{t.hospital}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="test-dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className={`test-dot ${i === activeTestimonial ? "active" : ""}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="contact" id="contact">
        <div className="contact-inner">
          <div className="contact-header reveal" ref={r}>
            <div className="section-label">Get In Touch</div>
            <h2 className="section-title">Ready to <em>Transform</em> Your Hospital?</h2>
            <p className="section-sub">
              Book a free 45-minute live demo — our clinical workflow specialists will
              walk you through HealthAxis customised for your hospital type.
            </p>
          </div>
          <div className="contact-wrap reveal" ref={r}>
            <div className="contact-info-box">
              <h3>Contact HealthAxis</h3>
              <p>Serving hospitals across Andhra Pradesh and Telangana since 2020.</p>
              <div className="info-items">
                {[
                  { icon: "📍", label: "Headquarters", val: "Kurnool, Andhra Pradesh, India" },
                  { icon: "📞", label: "Sales Enquiry", val: "+91 98765 43210" },
                  { icon: "🆘", label: "24/7 Support", val: "1800-XXX-XXXX (Toll Free)" },
                  { icon: "✉️", label: "Email", val: "sales@healthaxis.in" },
                  { icon: "🕐", label: "Office Hours", val: "Mon – Sat, 9 AM – 6 PM IST" },
                ].map((item) => (
                  <div className="info-item" key={item.label}>
                    <div className="info-item-icon">{item.icon}</div>
                    <div className="info-item-text">
                      <strong>{item.label}</strong>
                      <span>{item.val}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="contact-social">
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
                <a href="#">YouTube</a>
              </div>
            </div>
            <div className="contact-form-box">
              <div className="form-title">Schedule a Free Demo</div>
              <div className="form-row">
                <div className="field">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Dr. Ravi Kumar" />
                </div>
                <div className="field">
                  <label>Work Email *</label>
                  <input type="email" placeholder="ravi@hospital.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Phone Number *</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="field">
                  <label>Hospital Name *</label>
                  <input type="text" placeholder="Your Hospital Name" />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Number of Beds</label>
                  <select>
                    <option>Select range</option>
                    <option>Under 50</option>
                    <option>50 – 200</option>
                    <option>200 – 500</option>
                    <option>500+</option>
                  </select>
                </div>
                <div className="field">
                  <label>Current System</label>
                  <select>
                    <option>Select</option>
                    <option>Paper-based</option>
                    <option>Legacy HMS</option>
                    <option>Custom Software</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>What are your main challenges?</label>
                <textarea placeholder="Tell us about your hospital's current pain points — billing delays, scheduling issues, data silos..." />
              </div>
              <button className="btn-submit" type="button">
                Book My Free Demo
                <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <p className="form-disclaimer">
                🔒 Your information is 100% secure. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon small">H<span>A</span></div>
              <span className="logo-wordmark">Health<em>Axis</em></span>
            </div>
            <p>
              A NABH-compliant, multi-tenant hospital management platform built for
              clinical excellence and administrative efficiency across Andhra Pradesh.
            </p>
            <div className="footer-badges">
              {["NABH", "HIPAA", "ABDM", "ISO 27001"].map((b) => (
                <span key={b} className="footer-badge">{b}</span>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#services">Patient Management</a></li>
              <li><a href="#services">Appointments</a></li>
              <li><a href="#services">Medical Records (EMR)</a></li>
              <li><a href="#services">Billing & Insurance</a></li>
              <li><a href="#services">Pharmacy</a></li>
              <li><a href="#services">Laboratory (LIS)</a></li>
              <li><a href="#services">Bed Management</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Solutions</h4>
            <ul>
              <li><a href="#services">Multi-Hospital Networks</a></li>
              <li><a href="#services">Single Hospitals</a></li>
              <li><a href="#services">Clinics & Polyclinics</a></li>
              <li><a href="#services">Diagnostic Centres</a></li>
              <li><a href="#services">Nursing Homes</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#home">About Us</a></li>
              <li><a href="#why">Why HealthAxis</a></li>
              <li><a href="#testimonials">Case Studies</a></li>
              <li><a href="#contact">Careers</a></li>
              <li><a href="#contact">Press & Media</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal & Support</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">HIPAA Compliance</a></li>
              <li><a href="#">Data Security</a></li>
              <li><a href="#">Support Portal</a></li>
              <li><a href="#">System Status</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 HealthAxis HMS Pvt. Ltd. All rights reserved. CIN: U85110AP2020PTC123456</p>
          <p>Designed &amp; Built for hospitals in <a href="#">Andhra Pradesh</a> &amp; <a href="#">Telangana</a></p>
        </div>
      </footer>
    </>
  );
}