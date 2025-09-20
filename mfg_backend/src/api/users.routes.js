// Import the Express library
const express = require('express');
// Create a new router instance
const router = express.Router();

// Import the register function from our controller
// Import both functions from our controller
const { register, login } = require('../controllers/users.controller'); // <-- Update this line

// Define the POST route for /register
// When a POST request is made to this URL, the 'register' function will be called
// Define the POST route for /register
router.post('/register', register);

// Define the POST route for /login
router.post('/login', login); // <-- Add this line

// Export the router to be used in our main server file
module.exports = router;