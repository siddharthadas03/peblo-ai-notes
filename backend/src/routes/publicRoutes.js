const express = require('express');
const { getSharedNote } = require('../controllers/publicController');

const router = express.Router();

router.get('/:shareId', getSharedNote);

module.exports = router;
