// services/encryption.js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes hex

if (!key || key.length !== 32) {
  console.error('❌ ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
}

/**
 * Encrypt a string using AES-256-CBC with a random IV.
 * @param {string} text - Plain text
 * @returns {string} - IV:encrypted (hex)
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string that was encrypted with encrypt().
 * @param {string} encryptedText - IV:encrypted (hex)
 * @returns {string} - Plain text
 */
function decrypt(encryptedText) {
  const [ivHex, encryptedData] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };