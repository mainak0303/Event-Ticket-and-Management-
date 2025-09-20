const express = require('express');
const router = express.Router();
const AdminTicketController = require('../../controller/admin/AdminTicketController');
const { authentication } = require('../../middleware/authejs');



router.get('/admin/scan', authentication, (req, res) => {
  res.render('admin/scan', {
    admin: req.user,
    success: req.flash('success'),
    error: req.flash('error'),
    activePage: 'scan'
  });
});

// Scan QR code (AJAX/POST)
router.post('/admin/scan',authentication, AdminTicketController.scanQR);
// Analytics dashboard
router.get('/admin/analytics',authentication, AdminTicketController.ticketAnalytics);

module.exports = router;
