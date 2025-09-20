const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpCode = require('../helper/httpcode');

const SECRET_KEY = process.env.JWT_SECRET;

// Hash password sync (for simplicity in admin flow)
const hashPassword = (password) => {
  const salt = 10;
  return bcryptjs.hashSync(password, salt);
};

// Compare password sync
const comparePassword = (password, hashpassword) => {
  return bcryptjs.compareSync(password, hashpassword);
};

// Middleware: Authenticate admin via JWT stored in cookies
const authentication = (req, res, next) => {
  const token = req.cookies?.token;

  // Allow unauthenticated access to login/register pages to prevent loops
  const openPaths = [
    '/organizer/auth/login',
    '/organizer/auth/register',
    '/admin/auth/login',
    '/admin/auth/register',
    '/user/auth/login',
    '/user/auth/register',
  ];
  if (openPaths.includes(req.path)) {
    return next();
  }

  if (!token) {
    req.flash('error', 'Please login.');
    if (req.path.startsWith('/admin')) return res.redirect('/admin/auth/login');
    if (req.path.startsWith('/organizer')) return res.redirect('/organizer/auth/login');
    return res.redirect('/user/auth/login');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    req.flash('error', 'Session expired.');
    if (req.path.startsWith('/admin')) return res.redirect('/admin/auth/login');
    if (req.path.startsWith('/organizer')) return res.redirect('/organizer/auth/login');
    return res.redirect('/user/auth/login');
  }
};



// Generate JWT token (set as cookie on login)
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
};

// Role checks if needed in future for admin roles/extensions
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(httpCode.Forbidden).send('Access denied. Admins only');
  }
  next();
};

const isEventOrganizer = (req, res, next) => {
  if (req.user?.role !== 'event_organizer') {
    return res.status(httpCode.Forbidden).send('Access denied. Event Organizer only');
  }
  next();
};

module.exports = { hashPassword, comparePassword, authentication, generateToken, isAdmin, isEventOrganizer};
