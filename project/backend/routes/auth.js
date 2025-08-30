const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/complete-registration', authController.completeRegistration);
router.post('/login', authController.login);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.post('/resend-otp', authController.resendOtp);

module.exports = router;
