const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/requestController');

// Create a new service request (user)
router.post('/', auth(['user']), ctrl.createRequest);

// List my requests (user)
router.get('/me', auth(['user']), ctrl.listMyRequests);

// Admin: list pending
router.get('/pending', auth(['admin']), ctrl.listPending);

// Admin: list all requests
router.get('/all', auth(['admin']), ctrl.listAll);

// Admin: assign mechanic
router.post('/:id/assign', auth(['admin']), ctrl.assignMechanic);

// Worker/mechanic: list assigned to me
router.get('/assigned', auth(['mechanic']), ctrl.listAssignedToMechanic);

// Worker/mechanic: update status
router.post('/:id/status', auth(['mechanic', 'admin']), ctrl.updateStatus);

// Comments (all roles)
router.post('/:id/comments', auth(['user', 'mechanic', 'admin']), ctrl.addComment);

// Get by id (owner/assigned/admin)
router.get('/:id', auth(['user', 'mechanic', 'admin']), ctrl.getById);

module.exports = router;
