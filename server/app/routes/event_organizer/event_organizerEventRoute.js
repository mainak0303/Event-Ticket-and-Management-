const express = require('express');
const router = express.Router();
const { authentication, isEventOrganizer } = require('../../middleware/authejs');
const EventOrganizerController = require('../../controller/event_organizer/EventOrganizerEventController');
const Imageupload = require('../../helper/ImageUpload');


router.get('/organizer/events',authentication, isEventOrganizer, EventOrganizerController.getEvents);

router.get('/organizer/events/new',authentication, isEventOrganizer, EventOrganizerController.renderAddEventForm);
router.post('/organizer/events/new',authentication, isEventOrganizer, Imageupload.single('banner'), EventOrganizerController.createEvent);

router.get('/organizer/events/edit/:id',authentication, isEventOrganizer, EventOrganizerController.editEvent);
router.put('/organizer/events/edit/:id',authentication, isEventOrganizer, Imageupload.single('banner'), EventOrganizerController.updateEvent);

router.post('/organizer/events/activate/:id',authentication, isEventOrganizer, EventOrganizerController.activateEvent);
router.post('/organizer/events/deactivate/:id',authentication, isEventOrganizer, EventOrganizerController.deactivateEvent);
router.delete('/organizer/events/delete/:id',authentication, isEventOrganizer, EventOrganizerController.deleteEvent);

module.exports = router;
