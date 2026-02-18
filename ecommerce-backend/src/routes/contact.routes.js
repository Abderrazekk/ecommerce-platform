const express = require('express');
const router = express.Router();
const { contactUs } = require('../controllers/contact.controller');

// POST /api/contact
router.post('/', contactUs);

module.exports = router;