const { User } = require('../../model/user');
const { Event } = require('../../model/event');
const { Ticket } = require('../../model/ticket');
const { Payment } = require('../../model/payment');
const mongoose = require('mongoose');

class EventOrganizerAdminController {

  // List all event organizers
  static async viewAllOrganizers(req, res) {
    try {
      const organizers = await User.find({ role: 'event_organizer' }).lean();

      res.render('admin/organizers/list', {
        organizers,
        admin: req.user,
        flash: req.flash(),
        activePage: 'organizers',
      });
    } catch (err) {
      req.flash('error', 'Failed to fetch organizers');
      res.redirect('/admin/dashboard');
    }
  }

  // View single organizer details with their events
  static async viewOrganizerDetails(req, res) {
  try {
    const organizerId = req.params.id;

    const organizer = await User.findOne({ _id: organizerId, role: 'event_organizer' }).lean();
    if (!organizer) {
      req.flash('error', 'Organizer not found');
      return res.redirect('/admin/organizers');
    }

    const events = await Event.find({ createdBy: organizerId }).lean();

    // Add ticketsSold count per event
    for (let ev of events) {
      ev.ticketsSold = await Ticket.countDocuments({ eventId: ev._id, paymentStatus: 'paid' });
    }

    res.render('admin/organizers/details', {
      organizer,
      events,
      admin: req.user,
      flash: req.flash(),
      activePage: 'organizers',
    });
  } catch (err) {
    req.flash('error', 'Failed to load organizer details');
    res.redirect('/admin/organizers');
  }
}


  // Delete organizer and cascade delete their events and tickets
  static async deleteOrganizer(req, res) {
    try {
      const organizerId = req.params.id;

      // Find events created by organizer
      const events = await Event.find({ createdBy: organizerId });
      const eventIds = events.map(e => e._id);

      // Find tickets linked to those events
      const tickets = await Ticket.find({ eventId: { $in: eventIds } });
      const ticketIds = tickets.map(t => t._id);

      // Delete related payments
      await Payment.deleteMany({ ticketId: { $in: ticketIds } });

      // Delete tickets
      await Ticket.deleteMany({ eventId: { $in: eventIds } });

      // Delete events
      await Event.deleteMany({ _id: { $in: eventIds } });

      // Delete organizer user profile
      await User.findByIdAndDelete(organizerId);

      req.flash('success', 'Organizer and all related events & tickets deleted successfully.');
      res.redirect('/admin/organizers');

    } catch (err) {
      console.error('Delete organizer failed:', err);
      req.flash('error', 'Failed to delete organizer.');
      res.redirect('/admin/organizers');
    }
  }
}

module.exports = EventOrganizerAdminController;
