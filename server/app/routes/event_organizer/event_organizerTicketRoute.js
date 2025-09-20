const express = require('express');
const router = express.Router();
const EventOrganizerTicketController = require('../../controller/event_organizer/EventOrganizerTicketController');
const { authentication } = require('../../middleware/authejs');



router.get('/organizer/scan', authentication, (req, res) => {
  res.render('event_organizer/scan', {
    admin: req.user,
    success: req.flash('success'),
    error: req.flash('error'),
    activePage: 'scan'
  });
});

// Scan QR code (AJAX/POST)
router.post('/organizer/scan',authentication, EventOrganizerTicketController.scanQR);
// Analytics dashboard
router.get('/organizer/analytics',authentication, EventOrganizerTicketController.ticketAnalytics);

module.exports = router;
