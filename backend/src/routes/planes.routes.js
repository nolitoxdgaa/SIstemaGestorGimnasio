const express = require('express');
const router = express.Router();
const { getPlanes, getPlanById } = require('../controllers/plan.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, getPlanes);
router.get('/:id', authenticate, getPlanById);

module.exports = router;
