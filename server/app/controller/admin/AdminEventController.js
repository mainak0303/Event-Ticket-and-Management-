const { Event } = require('../../model/event');
const { TicketTier } = require('../../model/ticketTier');

class AdminController {

  static async listPendingEvents(req, res) {
    try {
      const events = await Event.find({ approvalStatus: 'pending' }).populate('category').lean();
      res.render('admin/events_pending', { admin: req.user, events, success: req.flash('success'), error: req.flash('error'), activePage: 'events' });
    } catch (err) {
      req.flash('error', 'Failed to load pending events');
      res.redirect('/admin/dashboard');
    }
  }

  static async approveEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/admin/events');
    }
    event.approvalStatus = 'approved';
    await event.save();
    req.flash('success', 'Event approved');

    // Redirect to unified list page instead of old pending page
    res.redirect('/admin/events');
  } catch (err) {
    req.flash('error', 'Failed to approve event');
    res.redirect('/admin/events');
  }
}

static async disapproveEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/admin/events');
    }
    event.approvalStatus = 'disapproved';
    await event.save();
    req.flash('success', 'Event disapproved');

    // Redirect to unified list page instead of old pending page
    res.redirect('/admin/events');
  } catch (err) {
    req.flash('error', 'Failed to disapprove event');
    res.redirect('/admin/events');
  }
}


  static async deleteEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/admin/events');
      }
      await TicketTier.deleteMany({ eventId: event._id });
      await event.deleteOne();
      req.flash('success', 'Event deleted');
      res.redirect('/admin/events');
    } catch (err) {
      req.flash('error', 'Failed to delete event');
      res.redirect('/admin/events');
    }
  }

  static async listAllEvents(req, res) {
    try {
      const events = await Event.find({})
        .populate('category')
        .populate('createdBy', 'name email')  // assuming createdBy references User model with name and email
        .lean();

      // Populate tiers for each event
      for (let event of events) {
        event.tiers = await TicketTier.find({ eventId: event._id }).lean();
      }

      res.render('admin/list', {
        admin: req.user,
        events,
        activePage: 'events',
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (err) {
      req.flash('error', 'Failed to load events');
      res.redirect('/admin/dashboard');
    }
  }

  // New: Show detailed page for a specific event
  static async eventDetails(req, res) {
    try {
      const event = await Event.findById(req.params.id)
        .populate('category')
        .populate('createdBy', 'name email')
        .lean();

      if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/admin/events');
      }

      const tiers = await TicketTier.find({ eventId: event._id }).lean();

      res.render('admin/details', {
        admin: req.user,
        event,
        tiers,
        activePage: 'events',
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (err) {
      req.flash('error', 'Failed to load event details');
      res.redirect('/admin/events');
    }
  }


}

module.exports = AdminController;
