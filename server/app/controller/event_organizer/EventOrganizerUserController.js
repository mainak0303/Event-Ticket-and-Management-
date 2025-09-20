const mongoose = require('mongoose');
const { User } = require('../../model/user');

class EventOrganizerUserController {

  // List users who have booked tickets for current organizer's events only
  static async viewAllUsers(req, res) {
    try {
      const organizerId = new mongoose.Types.ObjectId(req.user._id);

      const users = await User.aggregate([
        // Unwind tickets to filter by event creator
        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: 'userId',
            as: 'tickets'
          }
        },
        { $unwind: '$tickets' },

        // Join events for each ticket
        {
          $lookup: {
            from: 'events',
            localField: 'tickets.eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },

        // Filter tickets only for events created by the current organizer
        {
          $match: {
            'event.createdBy': organizerId,
            role: 'user',
            emailVerified: true
          }
        },

        // Join ticket tiers
        {
          $lookup: {
            from: 'tickettiers',
            localField: 'tickets.tierId',
            foreignField: '_id',
            as: 'tier'
          }
        },
        { $unwind: { path: '$tier', preserveNullAndEmptyArrays: true } },

        // Group back users with their filtered tickets, events, and tiers
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            email: { $first: '$email' },
            createdAt: { $first: '$createdAt' },
            tickets: {
              $push: {
                ticket: '$tickets',
                event: '$event',
                tier: '$tier'
              }
            }
          }
        }
      ]);

      res.render('event_organizer/users/list', {
        users,
        event_organizer: req.user,
        flash: req.flash(),
        activePage: 'users',
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/organizer/dashboard');
    }
  }


  // View details of a user only if they have booked tickets for this organizer's events
  static async viewUserDetails(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const organizerId = new mongoose.Types.ObjectId(req.user._id);

      const userDetails = await User.aggregate([
        { $match: { _id: userId } },

        // Lookup tickets and unwind
        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: 'userId',
            as: 'tickets'
          }
        },
        { $unwind: '$tickets' },

        // Lookup events joined with tickets
        {
          $lookup: {
            from: 'events',
            localField: 'tickets.eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },

        // Filter to only tickets for events of this organizer
        {
          $match: { 'event.createdBy': organizerId }
        },

        // Lookup ticket tiers
        {
          $lookup: {
            from: 'tickettiers',
            localField: 'tickets.tierId',
            foreignField: '_id',
            as: 'tier'
          }
        },
        { $unwind: { path: '$tier', preserveNullAndEmptyArrays: true } },

        // Group back all data for the user
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            email: { $first: '$email' },
            tickets: { $push: '$tickets' },
            events: { $push: '$event' },
            tiers: { $push: '$tier' }
          }
        }
      ]);

      if (!userDetails || userDetails.length === 0) {
        req.flash('error', 'User not found or no tickets for your events');
        return res.redirect('/organizer/allusers');
      }

      res.render('event_organizer/users/details', {
        user: userDetails[0],
        event_organizer: req.user,
        flash: req.flash(),
        activePage: 'users',
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/organizer/allusers');
    }
  }
}

module.exports = EventOrganizerUserController;
