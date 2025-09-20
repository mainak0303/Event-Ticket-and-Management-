const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpCode = require('../helper/httpcode');

const JWT_SECRET = process.env.JWT_SECRET;

const hashedPassword = async (password) => {
  const salt = 10;
  console.log(`[hashedPassword] Password received: ${password}`);
  const hashed = await bcryptjs.hash(password, salt);
  console.log(`[hashedPassword] Hashed: ${hashed}`);
  return hashed;
};

const comparePassword = async (password, hashed) => {
  console.log(`[comparePassword] Comparing: ${password} to hash: ${hashed}`);
  const matches = await bcryptjs.compare(password, hashed);
  console.log(`[comparePassword] Result: ${matches}`);
  return matches;
};

const AuthCheck = (req, res, next) => {
  const bearerToken = req.headers.authorization;
  const token = req?.body?.token || req?.headers['x-access-token'] ||
    (bearerToken && bearerToken.startsWith('Bearer ') ? bearerToken.split(' ')[1] : null);

  console.log(`[AuthCheck] Headers:`, req.headers);
  console.log(`[AuthCheck] Bearer token:`, bearerToken);
  console.log(`[AuthCheck] Token detected:`, token);

  if (!token) {
    console.log(`[AuthCheck] No token found.`);
    return res.status(httpCode.Unauthorized).json({
      status: false,
      message: 'Please login first to access this page',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`[AuthCheck] JWT decoded:`, decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(`[AuthCheck] JWT error:`, error);
    return res.status(httpCode.Unauthorized).json({
      status: false,
      message: 'Invalid or expired token',
    });
  }
};

// Role-based authorization middleware
const isAdmin = (req, res, next) => {
  console.log(`[isAdmin] User role:`, req.user?.role);
  if (req.user?.role !== 'admin') {
    console.log(`[isAdmin] Access denied.`);
    return res.status(httpCode.Forbidden).json({
      status: false,
      message: 'Only admin can access this resource',
    });
  }
  next();
};

// General role checker, extended if needed
const authorizeRoles = (...roles) => (req, res, next) => {
  console.log(`[authorizeRoles] User role:`, req.user?.role, `Allowed:`, roles);
  if (!roles.includes(req.user?.role)) {
    console.log(`[authorizeRoles] Access denied.`);
    return res.status(httpCode.Forbidden).json({
      status: false,
      message: 'Access denied: insufficient permissions',
    });
  }
  next();
};

const generateToken = (user) => {
  console.log(`[generateToken] User for token:`, user);
  const token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  console.log(`[generateToken] JWT:`, token);
  return token;
};

module.exports = { hashedPassword, comparePassword, AuthCheck, isAdmin, authorizeRoles, generateToken };
