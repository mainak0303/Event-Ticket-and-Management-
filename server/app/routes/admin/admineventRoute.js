const express = require('express');
const router = express.Router();
const { authentication, isAdmin } = require('../../middleware/authejs');
const AdminController = require('../../controller/admin/AdminEventController');



router.get('/admin/events/pending',authentication, isAdmin, AdminController.listPendingEvents);
router.post('/admin/events/approve/:id',authentication, isAdmin, AdminController.approveEvent);
router.post('/admin/events/disapprove/:id',authentication, isAdmin, AdminController.disapproveEvent);
router.post('/admin/events/delete/:id',authentication, isAdmin, AdminController.deleteEvent);
router.get('/admin/events', authentication, isAdmin, AdminController.listAllEvents);
router.get('/admin/events/:id', authentication, isAdmin, AdminController.eventDetails);


module.exports = router;
