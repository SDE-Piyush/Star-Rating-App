const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;

const DB_HOST = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
const DB_USER = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || '');
const DB_NAME = process.env.DB_NAME || process.env.MYSQLDATABASE || 'store_rating_db';
const DB_SSL = process.env.DB_SSL === 'true' || (connectionUri && connectionUri.includes('ssl='));

const getPoolConfig = () => {
  if (connectionUri) {
    return {
      uri: connectionUri,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ...(DB_SSL ? { ssl: { rejectUnauthorized: false } } : {})
    };
  }
  return {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...(DB_SSL ? { ssl: { rejectUnauthorized: false } } : {})
  };
};

let pool = null;

const initDatabase = async () => {
  try {
    // If not using a fixed connection URI, ensure database exists
    if (!connectionUri) {
      try {
        const rootConnection = await mysql.createConnection({
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USER,
          password: DB_PASSWORD,
          ...(DB_SSL ? { ssl: { rejectUnauthorized: false } } : {})
        });

        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        await rootConnection.end();
      } catch (dbCreateErr) {
        // In managed cloud DBs, CREATE DATABASE might be restricted if the database is already allocated
        console.warn('Notice: Skipping database creation check (may be managed cloud instance):', dbCreateErr.message);
      }
    }

    // Create the pooled connection
    pool = mysql.createPool(getPoolConfig());

    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create Stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(400) NOT NULL,
        owner_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create Ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating TINYINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_store (user_id, store_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`Database connected and tables initialized (${DB_NAME})`);
    return pool;
  } catch (err) {
    console.error('Database connection / initialization failed:', err.message);
    throw err;
  }
};

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(getPoolConfig());
  }
  return pool;
};

module.exports = {
  initDatabase,
  getPool
};

