const bcrypt = require('bcryptjs');
const { initDatabase, getPool } = require('../config/db');

const seedData = async () => {
  try {
    console.log('Connecting to database and verifying schema...');
    await initDatabase();
    const pool = getPool();

    console.log('Clearing existing records...');
    await pool.query('DELETE FROM ratings');
    await pool.query('DELETE FROM stores');
    await pool.query('DELETE FROM users');

    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('Piyush@121', salt);

    // 1. Insert Users
    const users = [
      {
        name: 'Piyush Kumar',
        email: 'piyushkumarsmith@gmail.com',
        password: commonPassword,
        address: 'Delhi',
        role: 'ADMIN'
      },
      {
        name: 'Piyush',
        email: 'owner1@gmail.com',
        password: commonPassword,
        address: 'Pune',
        role: 'STORE_OWNER'
      },
      {
        name: 'Piyush',
        email: 'owner2@gmail.com',
        password: commonPassword,
        address: 'Pune',
        role: 'STORE_OWNER'
      },
      {
        name: 'Raghav',
        email: 'user1@gmail.com',
        password: commonPassword,
        address: 'Delhi',
        role: 'USER'
      },
      {
        name: 'Ravi',
        email: 'user2@gmail.com',
        password: commonPassword,
        address: 'Delhi',
        role: 'USER'
      },
      {
        name: 'Adya',
        email: 'user3@gmail.com',
        password: commonPassword,
        address: 'Delhi',
        role: 'USER'
      }
    ];

    const insertedUserIds = {};

    for (const u of users) {
      const [res] = await pool.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [u.name, u.email, u.password, u.address, u.role]
      );
      insertedUserIds[u.email] = res.insertId;
    }

    console.log('Users seeded successfully.');

    const stores = [
      {
        name: 'Pahadi Momos',
        email: 'contact@pahadimomos.com',
        address: 'Pune',
        owner_id: insertedUserIds['owner1@gmail.com']
      },
      {
        name: 'Chotu Tapri Wala',
        email: 'contact@chotutapri.com',
        address: 'Pune',
        owner_id: insertedUserIds['owner2@gmail.com']
      }
    ];

    const insertedStoreIds = [];

    for (const s of stores) {
      const [res] = await pool.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [s.name, s.email, s.address, s.owner_id]
      );
      insertedStoreIds.push(res.insertId);
    }

    console.log('Stores seeded successfully (only 2 active stores).');


    const ratings = [

      {
        user_id: insertedUserIds['user1@gmail.com'],
        store_id: insertedStoreIds[0],
        rating: 5
      },
      {
        user_id: insertedUserIds['user2@gmail.com'],
        store_id: insertedStoreIds[0],
        rating: 4
      },
      {
        user_id: insertedUserIds['user3@gmail.com'],
        store_id: insertedStoreIds[0],
        rating: 5
      },
      {
        user_id: insertedUserIds['user1@gmail.com'],
        store_id: insertedStoreIds[1],
        rating: 4
      },
      {
        user_id: insertedUserIds['user2@gmail.com'],
        store_id: insertedStoreIds[1],
        rating: 5
      },
      {
        user_id: insertedUserIds['user3@gmail.com'],
        store_id: insertedStoreIds[1],
        rating: 4
      }
    ];

    for (const r of ratings) {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [r.user_id, r.store_id, r.rating]
      );
    }

    console.log('Ratings seeded successfully.');
    console.log('\n--- Active Demo Accounts ---');
    console.log('Admin:       piyushkumarsmith@gmail.com  | Password: Piyush@121 | Name: Piyush Kumar | Address: Delhi');
    console.log('Owner 1:     owner1@gmail.com            | Password: Piyush@121 | Name: Piyush       | Store: Pahadi Momos (Pune)');
    console.log('Owner 2:     owner2@gmail.com            | Password: Piyush@121 | Name: Piyush       | Store: Chotu Tapri Wala (Pune)');
    console.log('Normal User: user1@gmail.com             | Password: Piyush@121 | Name: Raghav       | Address: Delhi');
    console.log('Normal User: user2@gmail.com             | Password: Piyush@121 | Name: Ravi         | Address: Delhi');
    console.log('Normal User: user3@gmail.com             | Password: Piyush@121 | Name: Adya         | Address: Delhi');
    console.log('-----------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
