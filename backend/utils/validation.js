// utils/validation.js
const validator = require('validator');

function validateEmail(email) {
  return validator.isEmail(email);
}

function validatePhone(phone) {
  return validator.isMobilePhone(phone, 'any');
}

function validatePassword(password) {
  // at least 8 characters, one uppercase, one lowercase, one number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function sanitizeInput(str) {
  return validator.escape(str);
}

module.exports = { validateEmail, validatePhone, validatePassword, sanitizeInput };