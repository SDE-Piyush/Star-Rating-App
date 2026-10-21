const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const { validateUserPayload, isValidPassword } = require('../utils/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_store_rating_app_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Register a new normal user
const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validate inputs
    const validation = validateUserPayload({ name, email, password, address, role: 'USER' });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors[0], errors: validation.errors });
    }

    const pool = getPool();

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), 'USER']
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      role: 'USER'
    };

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error while registering user.' });
  }
};

// Single login for all user roles (Admin, User, Store Owner)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const pool = getPool();
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

// Get current logged-in user profile
const getMe = async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user: users[0] });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Internal server error fetching profile.' });
  }
};

// Update password after logging in
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: 'New password must be 8-16 characters long and include at least one uppercase letter and one special character.'
      });
    }

    const pool = getPool();
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('updatePassword error:', err);
    res.status(500).json({ message: 'Internal server error updating password.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword
};
