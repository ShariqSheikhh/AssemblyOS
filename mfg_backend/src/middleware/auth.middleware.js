const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the header
  const token = req.header('Authorization');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // The token will be in the format "Bearer <token>", so we split and get the second part
    const decoded = jwt.verify(token.split(' ')[1], 'your_jwt_secret');
    req.userId = decoded.userId; // Add userId to the request object
    next(); // Move to the next piece of middleware/controller
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};