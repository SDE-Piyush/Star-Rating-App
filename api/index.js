const app = require('../backend/src/server');
const { initDatabase } = require('../backend/src/config/db');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
    } catch (err) {
      console.error('Serverless database initialization notice:', err.message);
    }
  }
  return app(req, res);
};
