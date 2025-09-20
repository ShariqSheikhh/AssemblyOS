const express = require('express');
const router = express.Router();

const { createProduct, getAllProducts, getInventory, getProductById, produceProduct, getDashboardStats } = require('../controllers/products.controller'); // <-- Update this line
const authMiddleware = require('../middleware/auth.middleware');

// When a POST request is made to '/', we first run the authMiddleware.
// If the token is valid, it calls next() and then our createProduct controller runs.
router.post('/', authMiddleware, createProduct);

// GET route to fetch all manufacturable products
router.get('/', authMiddleware, getAllProducts); // <-- Add this line

// GET route to fetch all inventory items
router.get('/inventory', authMiddleware, getInventory); // <-- Add this line

// GET route for dashboard stats (place before dynamic ID route)
router.get('/stats', authMiddleware, getDashboardStats);

// GET route to fetch a single product by its ID
// The ':id' is a URL parameter
router.get('/:id', authMiddleware, getProductById); // <-- Add this line

// POST route to produce a specific quantity of an item
router.post('/:id/produce', authMiddleware, produceProduct); // <-- Add this line

module.exports = router;