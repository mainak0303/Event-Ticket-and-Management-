const express = require('express');
const router = express.Router();
const AdminAuthController = require('../../controller/admin/AdminAuthController');
const { authentication } = require('../../middleware/authejs');

// Registration form
router.get('/admin/auth/register', (req, res) => res.render('admin/register'));
// Register admin
router.post('/admin/auth/register', AdminAuthController.register);
// Login form
router.get('/admin/auth/login', (req, res) => {    res.render('admin/login');});
// Login admin
router.post('/admin/auth/login', AdminAuthController.login);
// Dashboard
router.get('/admin/dashboard', authentication, AdminAuthController.dashboard);
// Logout
router.post('/admin/auth/logout', (req, res) => {
  res.clearCookie('token');          
  req.session.destroy(err => {       
    if (err) {
      console.error(err);
    }
    res.redirect('/admin/auth/login');  
  });
});


module.exports = router;
