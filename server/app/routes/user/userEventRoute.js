const express = require('express');
const router = express.Router();
const UserEventController = require('../../controller/user/UserEventController');

// Browse active events
router.get('/user/events', UserEventController.browseEvents);

// event details
router.get('/user/events/:id', UserEventController.getEventDetails);


module.exports = router;
