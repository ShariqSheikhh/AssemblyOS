const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getInventory, getProductById, produceProduct, getDashboardStats } = require('../controllers/products.controller'); // <-- Update this line
const authMiddleware = require('../middleware/auth.middleware');
router.post('/', authMiddleware, createProduct);
router.get('/', authMiddleware, getAllProducts); 
router.get('/inventory', authMiddleware, getInventory); 
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/:id', authMiddleware, getProductById); 
router.post('/:id/produce', authMiddleware, produceProduct); 
module.exports = router;