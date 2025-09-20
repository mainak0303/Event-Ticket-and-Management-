const { generateToken } = require('../../middleware/authejs');
const { User, UserJoiSchema } = require('../../model/user');
const { Event } = require('../../model/event');       
const { Ticket } = require('../../model/ticket');
const bcrypt = require('bcryptjs');

class AdminAuthController {
    static async register(req, res) {
        const { error } = UserJoiSchema.validate(req.body);
        if (error) {
            req.flash('error', error.message);
            return res.redirect('/admin/register');
        }
        try {
            const exists = await User.findOne({ email: req.body.email });
            if (exists) {
                req.flash('error', 'Email already registered.');
                return res.redirect('/admin/register');
            }
            const hash = await bcrypt.hash(req.body.password, 10);
            const user = new User({ ...req.body, password: hash, role: 'admin' });
            await user.save();
            req.flash('success', 'Admin registration successful');
            res.redirect('/admin/auth/login');
        } catch (err) {
            req.flash('error', err.message);
            res.redirect('/admin/register');
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;
        try {
            const admin = await User.findOne({ email, role: 'admin' });
            if (!admin) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/admin/login');
            }
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/admin/login');
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
            res.redirect('/admin/dashboard');
        } catch (err) {
            req.flash('error', err.message);
            res.redirect('/admin/login');
        }
    }

    static async dashboard(req, res) {
        try {
            // Fetch Users, Events, and Registrations (tickets)
            const usersArray = await User.find({ role: 'user' }).lean();
            const eventsArray = await Event.find().lean();
            const registrationsArray = await Ticket.find().lean();

            res.render('admin/dashboard', {
                admin: req.user,
                users: usersArray,
                events: eventsArray,
                registrations: registrationsArray,
                success: req.flash('success'),
                error: req.flash('error'),
                activePage: 'dashboard'
            });
        } catch (err) {
            console.error(err);
            req.flash('error', 'Failed to load dashboard data');
            res.render('admin/dashboard', {
                admin: req.user,
                users: [],
                events: [],
                registrations: [],
                success: req.flash('success'),
                error: req.flash('error'),
                activePage: 'dashboard'
            });
        }
    }

}

module.exports = AdminAuthController;
