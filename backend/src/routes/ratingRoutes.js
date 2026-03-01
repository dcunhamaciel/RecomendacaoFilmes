const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/', ratingController.create);
router.get('/', ratingController.index);

module.exports = router;