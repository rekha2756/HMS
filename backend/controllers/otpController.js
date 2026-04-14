// backend/controllers/otpController.js
const nodemailer = require('nodemailer');
const otpService = require('../services/otpService');

// Configure email transporter using .env variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px;">
      <h2 style="color: #0B1120;">HealthAxis – Email Verification</h2>
      <p>Your OTP for registration is:</p>
      <h1 style="font-size: 32px; letter-spacing: 4px; color: #14B8A6;">${otp}</h1>
      <p>This OTP is valid for <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr />
      <small>HealthAxis Hospital Management System</small>
    </div>
  `;
  await transporter.sendMail({
    from: `"HealthAxis" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Registration',
    html,
  });
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const tenantId = req.tenantId;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!otpService.canRequestOtp(tenantId, email, 3, 10)) {
    return res.status(429).json({
      error: 'Too many OTP requests. Please try again after 10 minutes.',
    });
  }

  const otp = otpService.generateOtp();

  try {
    await otpService.storeOtp(tenantId, email, otp, 5);
    await sendOtpEmail(email, otp);
    otpService.recordOtpRequest(tenantId, email);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const tenantId = req.tenantId;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const isValid = await otpService.verifyOtp(tenantId, email, otp);

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
  }

  res.json({ message: 'OTP verified successfully' });
};