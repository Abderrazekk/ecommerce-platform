const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { updateUserProfile } = require('../controllers/profile.controller');

router.use(protect);
router.put('/', updateUserProfile);

module.exports = router;