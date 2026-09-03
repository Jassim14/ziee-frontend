const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s-]{7,20}$/;

export function isRequired(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined && value !== '';
}

export function isEmail(value) {
  return EMAIL_RE.test(value.trim());
}

export function isPhone(value) {
  return PHONE_RE.test(value.trim());
}

export function minLength(value, min) {
  return value.trim().length >= min;
}

export function sameAs(value, other) {
  return value === other;
}

export function validateForm(rules, values) {
  const errors = {};
  Object.entries(rules).forEach(([field, checkers]) => {
    checkers.forEach((checker) => {
      if (errors[field]) return;
      const { valid, message } = checker(values[field], values);
      if (!valid) errors[field] = message;
    });
  });
  return errors;
}

export function required(message = 'This field is required') {
  return (value) => ({ valid: isRequired(value), message });
}

export function email(message = 'Enter a valid email address') {
  return (value) => ({ valid: isEmail(value), message });
}

export function phone(message = 'Enter a valid phone number') {
  return (value) => ({ valid: isPhone(value), message });
}

export function minLen(min, message) {
  return (value) => ({ valid: minLength(value || '', min), message: message || `Must be at least ${min} characters` });
}

export function maxLen(max, message) {
  return (value) => ({ valid: !value || value.length <= max, message: message || `Must be at most ${max} characters` });
}

export function matches(otherField, message) {
  return (value, values) => ({ valid: sameAs(value, values?.[otherField]), message });
}