const { getPool } = require('../config/db');
const { isValidRating } = require('../utils/validators');

// Get all stores for normal user with search, sort, and user's own submitted rating
const getStoresForUser = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    const { search = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(r_all.rating), 1) AS overallRating,
        COUNT(r_all.id) AS totalRatings,
        r_user.rating AS userSubmittedRating
      FROM stores s
      LEFT JOIN ratings r_all ON r_all.store_id = s.id
      LEFT JOIN ratings r_user ON r_user.store_id = s.id AND r_user.user_id = ?
      WHERE 1=1
    `;

    const params = [userId];

    if (search && search.trim()) {
      query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' GROUP BY s.id, r_user.rating';

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      overallRating: 'overallRating',
      userSubmittedRating: 'userSubmittedRating'
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const [stores] = await pool.query(query, params);

    res.status(200).json({ stores });
  } catch (err) {
    console.error('getStoresForUser error:', err);
    res.status(500).json({ message: 'Failed to fetch store listings.' });
  }
};

// Submit or modify a rating for a store
const submitOrUpdateRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!isValidRating(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const pool = getPool();

    // Verify store exists
    const [store] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (store.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Insert or update rating
    await pool.query(
      `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        rating = VALUES(rating),
        updated_at = CURRENT_TIMESTAMP
      `,
      [userId, storeId, Number(rating)]
    );

    // Fetch new overall rating and count for this store
    const [[stats]] = await pool.query(
      'SELECT ROUND(AVG(rating), 1) as overallRating, COUNT(id) as totalRatings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    res.status(200).json({
      message: 'Rating saved successfully.',
      storeId: Number(storeId),
      userSubmittedRating: Number(rating),
      overallRating: stats.overallRating || 0,
      totalRatings: stats.totalRatings
    });
  } catch (err) {
    console.error('submitOrUpdateRating error:', err);
    res.status(500).json({ message: 'Failed to save store rating.' });
  }
};

module.exports = {
  getStoresForUser,
  submitOrUpdateRating
};
