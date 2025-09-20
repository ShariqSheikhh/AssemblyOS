const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getAllOrders);
router.put('/:id', authMiddleware, updateOrderStatus);
module.exports = router;
