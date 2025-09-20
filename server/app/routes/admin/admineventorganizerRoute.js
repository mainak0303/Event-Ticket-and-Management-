const express = require('express');
const router = express.Router();
const EventOrganizerAdminController = require('../../controller/admin/AdminEventOrganizerController');
const { authentication } = require('../../middleware/authejs');

// List all organizers
router.get('/admin/organizers', authentication, EventOrganizerAdminController.viewAllOrganizers);

// Organizer detail page
router.get('/admin/organizers/:id', authentication, EventOrganizerAdminController.viewOrganizerDetails);

// Delete organizer with cascade data removal
router.delete('/admin/organizers/:id', authentication, EventOrganizerAdminController.deleteOrganizer);

module.exports = router;
