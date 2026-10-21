const { getPool } = require('../config/db');

// Store Owner Dashboard
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'date', sortOrder = 'DESC' } = req.query;
    const pool = getPool();

    // 1. Fetch store owned by this user
    const [stores] = await pool.query(
      `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(r.rating), 1) as averageRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = ?
      GROUP BY s.id
      `,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        hasStore: false,
        message: 'No store is currently associated with your account. Please contact an administrator.',
        store: null,
        ratings: []
      });
    }

    const store = stores[0];

    // 2. Fetch all ratings submitted for this store with user details
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      date: 'r.updated_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 'r.updated_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [ratings] = await pool.query(
      `
      SELECT 
        r.id as rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.address as user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY ${sortColumn} ${direction}
      `,
      [store.id]
    );

    res.status(200).json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: store.averageRating !== null ? Number(store.averageRating) : 0,
        totalRatings: store.totalRatings
      },
      ratings
    });
  } catch (err) {
    console.error('getOwnerDashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch store owner dashboard.' });
  }
};

module.exports = {
  getOwnerDashboard
};
