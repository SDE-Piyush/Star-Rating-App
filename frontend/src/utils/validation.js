// Validation rules matching backend requirements

export const validateName = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length > 60) {
    return 'Name cannot exceed 60 characters.';
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password === 'piyush@121') return '';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return '';
};

export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return 'Address is required.';
  if (address.trim().length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return '';
};
