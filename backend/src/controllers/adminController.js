const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');
const { validateUserPayload, validateStorePayload } = require('../utils/validators');

// Get overall stats for Admin dashboard
const getDashboardStats = async (req, res) => {
  try {
    const pool = getPool();

    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metrics.' });
  }
};

// Get list of users with filtering and sorting
const getUsers = async (req, res) => {
  try {
    const pool = getPool();
    const { name, email, address, role, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        s.name AS store_name,
        ROUND(AVG(r.rating), 1) AS rating,
        COUNT(r.id) AS rating_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (name && name.trim()) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (email && email.trim()) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    if (address && address.trim()) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    if (role && role.trim()) {
      query += ' AND u.role = ?';
      params.push(role.trim());
    }

    query += ' GROUP BY u.id, s.name';

    // Safe sorting whitelist
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'rating',
      created_at: 'u.created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 'u.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const [rows] = await pool.query(query, params);

    res.status(200).json({ users: rows });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Failed to fetch users list.' });
  }
};

// Create a new user (Admin, Normal User, or Store Owner)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const validation = validateUserPayload({ name, email, password, address, role });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors[0], errors: validation.errors });
    }

    const pool = getPool();

    // Check if email already in use
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), role]
    );

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role
      }
    });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ message: 'Failed to create user.' });
  }
};

// Get list of stores with filtering and sorting
const getStores = async (req, res) => {
  try {
    const pool = getPool();
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(AVG(r.rating), 1) AS rating,
        COUNT(r.id) AS rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (name && name.trim()) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (email && email.trim()) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    if (address && address.trim()) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    query += ' GROUP BY s.id, u.name, u.email';

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating',
      rating_count: 'rating_count',
      created_at: 's.created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const [rows] = await pool.query(query, params);

    res.status(200).json({ stores: rows });
  } catch (err) {
    console.error('getStores error:', err);
    res.status(500).json({ message: 'Failed to fetch stores list.' });
  }
};

// Add a new store
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const validation = validateStorePayload({ name, email, address });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors[0], errors: validation.errors });
    }

    const pool = getPool();

    // Check if store email already in use
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'A store with this email already exists.' });
    }

    // If owner_id provided, verify owner is STORE_OWNER
    let verifiedOwnerId = null;
    if (owner_id) {
      const [owner] = await pool.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
      if (owner.length === 0 || owner[0].role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Selected owner must be a user with the STORE_OWNER role.' });
      }
      verifiedOwnerId = owner[0].id;
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), verifiedOwnerId]
    );

    res.status(201).json({
      message: 'Store created successfully.',
      store: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        owner_id: verifiedOwnerId
      }
    });
  } catch (err) {
    console.error('createStore error:', err);
    res.status(500).json({ message: 'Failed to create store.' });
  }
};

// Get list of eligible store owners to populate select dropdown
const getAvailableOwners = async (req, res) => {
  try {
    const pool = getPool();
    const [owners] = await pool.query(
      'SELECT id, name, email FROM users WHERE role = "STORE_OWNER" ORDER BY name ASC'
    );
    res.status(200).json({ owners });
  } catch (err) {
    console.error('getAvailableOwners error:', err);
    res.status(500).json({ message: 'Failed to fetch available store owners.' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getStores,
  createStore,
  getAvailableOwners
};
