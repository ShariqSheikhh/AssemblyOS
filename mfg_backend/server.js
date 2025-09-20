// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <-- Add this import

// Import our user routes
const userRoutes = require('./src/api/users.routes');
const productRoutes = require('./src/api/products.routes');
const orderRoutes = require('./src/api/orders.routes');
const workCenterRoutes = require('./src/api/workCenters.routes'); // Add work centers routes

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
// This is crucial for our server to be able to read the data sent from the frontend
app.use(cors()); // <-- Add this line to enable CORS
app.use(express.json()); // This line should already be here

// A simple test route to make sure the server is alive
app.get('/', (req, res) => {
  res.send('Hello from the AssemblyOS Backend!');
});

// Use our user routes with a URL prefix
// All routes in userRoutes will be prefixed with /api/users
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/work-centers', workCenterRoutes); // Add work centers routes

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});