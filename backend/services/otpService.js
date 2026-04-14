// backend/services/otpService.js
const { query } = require('./dbService');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOtp = async (tenantId, email, otp, ttlMinutes = 5) => {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  await query(tenantId, 'DELETE FROM otp_verifications WHERE email = ?', [email]);
  await query(
    tenantId,
    'INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
    [email, otp, expiresAt]
  );
};

const verifyOtp = async (tenantId, email, otp) => {
  const rows = await query(
    tenantId,
    'SELECT * FROM otp_verifications WHERE email = ? AND otp_code = ? AND expires_at > NOW()',
    [email, otp]
  );
  if (rows.length === 0) return false;
  await query(tenantId, 'DELETE FROM otp_verifications WHERE email = ?', [email]);
  return true;
};

const deleteExpiredOtps = async (tenantId) => {
  await query(tenantId, 'DELETE FROM otp_verifications WHERE expires_at <= NOW()');
};

// In‑memory rate limiting per tenant+email (3 requests per 10 minutes)
const otpRequestLog = new Map();

const canRequestOtp = (tenantId, email, maxRequests = 3, windowMinutes = 10) => {
  const key = `${tenantId}:${email}`;
  const now = Date.now();
  const record = otpRequestLog.get(key);
  if (!record) return true;
  const windowStart = record.firstRequestTime + windowMinutes * 60 * 1000;
  if (now > windowStart) {
    otpRequestLog.delete(key);
    return true;
  }
  return record.count < maxRequests;
};

const recordOtpRequest = (tenantId, email) => {
  const key = `${tenantId}:${email}`;
  const now = Date.now();
  const record = otpRequestLog.get(key);
  if (!record) {
    otpRequestLog.set(key, { count: 1, firstRequestTime: now });
  } else {
    record.count++;
  }
};

module.exports = {
  generateOtp,
  storeOtp,
  verifyOtp,
  deleteExpiredOtps,
  canRequestOtp,
  recordOtpRequest,
};