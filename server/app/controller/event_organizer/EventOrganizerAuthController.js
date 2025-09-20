const { generateToken } = require('../../middleware/authejs');
const { User, UserJoiSchema } = require('../../model/user');
const { Event } = require('../../model/event');       
const { Ticket } = require('../../model/ticket');
const bcrypt = require('bcryptjs');

class EventOrganizerAuthController {
    static async register(req, res) {
        const { error } = UserJoiSchema.validate(req.body);
        if (error) {
            req.flash('error', error.message);
            return res.redirect('/organizer/auth/register');
        }
        try {
            const exists = await User.findOne({ email: req.body.email });
            if (exists) {
                req.flash('error', 'Email already registered.');
                return res.redirect('/organizer/auth/register');
            }
            const hash = await bcrypt.hash(req.body.password, 10);
            const user = new User({ ...req.body, password: hash, role: 'event_organizer' });
            await user.save();
            req.flash('success', 'Event organizer registration successful');
            res.redirect('/organizer/auth/login');
        } catch (err) {
            req.flash('error', err.message);
            res.redirect('/organizer/auth/register');
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;
        try {
            const admin = await User.findOne({ email, role: 'event_organizer' });
            if (!admin) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/organizer/auth/login');
            }
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/organizer/auth/login');
            }
            // Generate JWT token
            const token = generateToken(admin);
            // Set token as secure HttpOnly cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // true on HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            req.flash('success', 'Admin logged in successfully');
            res.redirect('/organizer/dashboard');
        } catch (err) {
            req.flash('error', err.message);
            res.redirect('/organizer/auth/login');
        }
    }

    static async dashboard(req, res) {
    try {
      // Only fetch events created by this organizer
      const eventsArray = await Event.find({ createdBy: req.user._id }).lean();
      const usersArray = await User.find({ role: 'user' }).lean();

      // Find all tickets for these events
      const eventIds = eventsArray.map(ev => ev._id);
      const registrationsArray = await Ticket.find({ eventId: { $in: eventIds } }).lean();

      res.render('event_organizer/dashboard', {
        event_organizer: req.user,
        users: usersArray,
        events: eventsArray,
        registrations: registrationsArray,
        success: req.flash('success'),
        error: req.flash('error'),
        activePage: 'dashboard'
      });
    } catch (err) {
      req.flash('error', 'Failed to load your dashboard.');
      res.render('event_organizer/dashboard', {
        event_organizer: req.user,
        events: [],
        registrations: [],
        success: req.flash('success'),
        error: req.flash('error'),
        activePage: 'dashboard'
      });
    }
  }

}

module.exports = EventOrganizerAuthController;
