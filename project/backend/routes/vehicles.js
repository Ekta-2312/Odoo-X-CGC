const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/vehicleController');

// All routes require authenticated user
router.use(auth(['user']));

router.get('/', ctrl.listMyVehicles);
router.post('/', ctrl.createVehicle);
router.put('/:id', ctrl.updateVehicle);
router.delete('/:id', ctrl.deleteVehicle);
router.post('/:id/default', ctrl.setDefaultVehicle);

module.exports = router;
