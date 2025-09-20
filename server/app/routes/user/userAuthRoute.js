const express = require('express');
const router = express.Router();
const UserAuthController = require('../../controller/user/UserAuthController');
const { AuthCheck } = require('../../middleware/auth');

// Registration
router.post('/user/auth/register', UserAuthController.register);

// verify email
router.get('/user/auth/verify', UserAuthController.verifyEmail);

// Login
router.post('/user/auth/login', UserAuthController.login);

// Forgot password - send reset link
router.post('/user/auth/forgot-password', UserAuthController.forgotPassword);

// Reset password using token
router.post('/user/auth/reset-password', UserAuthController.resetPassword);

// Update password for logged-in users
router.post('/user/auth/update-password', AuthCheck, UserAuthController.updatePassword)

// Profile
router.get('/user/auth/profile', AuthCheck, UserAuthController.getProfile);
module.exports = router;
