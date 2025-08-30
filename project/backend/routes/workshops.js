const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workshopController');
const auth = require('../middleware/auth');

router.get('/', ctrl.listMechanics);
// Admin-only endpoints
router.get('/admin/all', auth(['admin']), ctrl.listAllMechanics);
router.patch('/admin/:id/verify', auth(['admin']), ctrl.verifyMechanic);
router.get('/:id', ctrl.getMechanic);

module.exports = router;
