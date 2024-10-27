require('dotenv').config(); // Load environment variables

const { Pool } = require('pg');

// Create a new pool using the database connection details from environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Set to false if you encounter issues with self-signed certificates
  },
});

// Export a function to query the database
module.exports = {
  query: (text, params) => pool.query(text, params),
};
