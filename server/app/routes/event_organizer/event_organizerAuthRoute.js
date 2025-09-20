const express = require('express');
const router = express.Router();
const { authentication } = require('../../middleware/authejs');
const EventOrganizerAuthController = require('../../controller/event_organizer/EventOrganizerAuthController');
const EventOrganizerUserController = require('../../controller/event_organizer/EventOrganizerUserController');

// Registration form
router.get('/organizer/auth/register', (req, res) => res.render('event_organizer/register'));
// Register admin
router.post('/organizer/auth/register', EventOrganizerAuthController.register);
// Login form
router.get('/organizer/auth/login', (req, res) => {    res.render('event_organizer/login');});
// Login admin
router.post('/organizer/auth/login', EventOrganizerAuthController.login);
// Dashboard
router.get('/organizer/dashboard', authentication, EventOrganizerAuthController.dashboard);
// All Users
router.get('/organizer/allusers', authentication,EventOrganizerUserController.viewAllUsers);
// List users who booked tickets
router.get('/organizer/allusers', authentication, EventOrganizerUserController.viewAllUsers);
// View single user details and tickets
router.get('/organizer/users/:id', authentication, EventOrganizerUserController.viewUserDetails);
// Logout
router.post('/organizer/auth/logout', (req, res) => {
  res.clearCookie('token');          
  req.session.destroy(err => {       
    if (err) {
      console.error(err);
    }
    res.redirect('/organizer/auth/login');  
  });
});


module.exports = router;
