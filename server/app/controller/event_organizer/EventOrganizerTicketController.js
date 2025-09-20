const { Ticket } = require('../../model/ticket');
const { Event } = require('../../model/event');

class EventOrganizerTicketController {
  static async scanQR(req, res) {
    try {
      const { ticketCode } = req.body;

      const ticket = await Ticket.findOne({ ticketCode })
        .populate('eventId', 'title date location')
        .populate('tierId', 'name price');

      if (!ticket) {
        req.flash('error', 'Ticket not found');
        return res.redirect('/organizer/scan');  // redirect back to scan page
      }

      if (ticket.checkedIn) {
        req.flash('error', 'Ticket has already been checked in');
        return res.redirect('/organizer/scan');
      }

      ticket.checkedIn = true;
      await ticket.save();

      req.flash('success', `Check-in successful for ticket ${ticketCode}`);
      res.render('event_organizer/scan_result', {
        ticket,
        success: req.flash('success'),
        error: req.flash('error'),
        admin: req.user,
        activePage: 'scan'
      });

    } catch (err) {
      req.flash('error', `Server error: ${err.message}`);
      res.redirect('/organizer/scan');
    }
  }


  static async ticketAnalytics(req, res) {
    // Returns aggregated ticket counts by event
    try {
      const stats = await Ticket.aggregate([
        {
          $group: {
            _id: "$eventId",
            totalSold: { $sum: 1 },
            totalCheckedIn: { $sum: { $cond: ['$checkedIn', 1, 0] } }
          }
        },
        {
          $lookup: {
            from: "events",
            localField: "_id",
            foreignField: "_id",
            as: "event"
          }
        }
      ]);
      res.render('event_organizer/analytics', {
        stats,
        success: req.flash('success'),
        error: req.flash('error'),
        event_organizer: req.user,   // Pass authenticated user object
        activePage: 'analytics'

      });

    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/organizer/dashboard');
    }
  }
}

module.exports = EventOrganizerTicketController;
