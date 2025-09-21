// Import our database connection pool
const pool = require('../config/db.config');
// Import the bcryptjs library for password hashing
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- Add this import

// The function to handle user registration
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || username.length < 6 || username.length > 12) {
    return res.status(400).json({ error: 'Username must be between 6 and 12 characters.' });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email or username already in use.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, email, username',
      [username, email, passwordHash]
    );

    // Send a success response
    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// The function to handle user login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // If credentials are correct, create a JWT
    const token = jwt.sign(
      { userId: user.rows[0].user_id }, // Payload
      'your_jwt_secret',                  // Secret key (we'll move this to .env later)
      { expiresIn: '1h' }                // Token expires in 1 hour
    );

    // Send the token back to the client
    res.status(200).json({
      message: 'Logged in successfully!',
      token: token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};