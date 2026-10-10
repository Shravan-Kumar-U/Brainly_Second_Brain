const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validateRegister = ({ name, email, password }) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email address';

  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (password.length > 72) errors.password = 'Password must be at most 72 characters';
  else if (!/[A-Za-z]/.test(password)) errors.password = 'Password must contain a letter';
  else if (!/\d/.test(password)) errors.password = 'Password must contain a number';

  return errors;
};