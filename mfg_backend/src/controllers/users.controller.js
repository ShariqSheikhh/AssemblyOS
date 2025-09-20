const pool = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
exports.register = async (req, res) => {
  
  const { name, email, password } = req.body;

  try {
    
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, email',
      [name, email, passwordHash]
    );

    
    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    
    const token = jwt.sign(
      { userId: user.rows[0].user_id }, 
      'your_jwt_secret',                 
      { expiresIn: '1h' }                
    );

   
    res.status(200).json({
      message: 'Logged in successfully!',
      token: token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};