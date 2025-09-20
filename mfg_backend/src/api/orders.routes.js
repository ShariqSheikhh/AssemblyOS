const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route   POST api/orders
// @desc    Create a manufacturing order
router.post('/', authMiddleware, createOrder);

// @route   GET api/orders
// @desc    Get all manufacturing orders
router.get('/', authMiddleware, getAllOrders);

// @route   PUT api/orders/:id
// @desc    Update an order's status
router.put('/:id', authMiddleware, updateOrderStatus);

module.exports = router;
