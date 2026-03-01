const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.post('/', movieController.create);
router.get('/', movieController.index);
router.get('/:id', movieController.show);

module.exports = router;