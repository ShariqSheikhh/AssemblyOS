// Import the 'pg' library's Pool class
const { Pool } = require('pg');

// Create a new connection pool using the environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export the pool so we can use it to run queries in other files
module.exports = pool;
