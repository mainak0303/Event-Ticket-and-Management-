const { User } = require('../../model/user');
const { Ticket } = require('../../model/ticket');
const { Payment } = require('../../model/payment');


class AdminUserController {
  static async viewAllUsers(req, res) {
    try {
      const users = await User.aggregate([
        { $match: { role: 'user', emailVerified: true } },

        {
          $lookup: {
            from: 'tickets',
            localField: '_id',
            foreignField: 'userId',
            as: 'tickets'
          }
        },

        
        { $unwind: { path: '$tickets', preserveNullAndEmptyArrays: true } },

        
        {
          $lookup: {
            from: 'events',
            localField: 'tickets.eventId',
            foreignField: '_id',
            as: 'tickets.event'
          }
        },

        
        {
          $lookup: {
            from: 'tickettiers',
            localField: 'tickets.tierId',
            foreignField: '_id',
            as: 'tickets.tier'
          }
        },

        
        { $unwind: { path: '$tickets.event', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$tickets.tier', preserveNullAndEmptyArrays: true } },

        
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            email: { $first: '$email' },
            createdAt: { $first: '$createdAt' },
            tickets: { $push: '$tickets' }
          }
        }
      ]);

      res.render('users/list', {
        users,
        admin: req.user,
        flash: req.flash(),
        activePage: 'users',
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/dashboard');
    }
  }

  static async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      // Delete all payments linked to user's tickets
      const tickets = await Ticket.find({ userId });
      const ticketIds = tickets.map(t => t._id);

      await Payment.deleteMany({ ticketId: { $in: ticketIds } });

      // Delete tickets
      await Ticket.deleteMany({ userId });

      // Delete user profile
      await User.findByIdAndDelete(userId);

      req.flash('success', 'User and all related tickets deleted successfully.');
      res.redirect('/admin/allusers'); // admin users list page

    } catch (error) {
      console.error('Delete user failed:', error);
      req.flash('error', 'Failed to delete user.');
      res.redirect('/admin/allusers');
    }
  }

  static async deleteTicket(req, res) {
    try {
      const ticketId = req.params.ticketId;

      // Delete payments for the ticket
      await Payment.deleteMany({ ticketId });

      // Delete the ticket
      await Ticket.findByIdAndDelete(ticketId);

      req.flash('success', 'Ticket deleted successfully.');
      res.redirect('/admin/allusers');
    } catch (error) {
      console.error('Delete ticket failed:', error);
      req.flash('error', 'Failed to delete ticket.');
      res.redirect('/admin/allusers');
    }
  }
  
}

module.exports = AdminUserController;
