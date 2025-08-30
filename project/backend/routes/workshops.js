const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workshopController');

router.get('/', ctrl.listMechanics);
router.get('/:id', ctrl.getMechanic);

module.exports = router;
