const express = require('express');
const router = express.Router();
const { getWorkCenterStats } = require('../controllers/workCenters.controller');
const authMiddleware = require('../middleware/auth.middleware');


router.get('/', authMiddleware, getWorkCenterStats);

module.exports = router;
