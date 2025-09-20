require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const connectDB = require('./app/config/dbCon');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});
app.use(limiter);
app.use(cookieParser());
// Session Configuration (for Admin panel, login, flash etc.)
app.use(session({
  secret: process.env.JWT_SECRET || 'dxtrdtyfjygkhiohuyfdtr',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Use true with HTTPS
}));

// Template engine (for admin panel)
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Flash Messages
app.use(flash());

// Make flash messages available in all EJS templates
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Router imports 
// User
const authuser=require('./app/routes/user/userAuthRoute')
app.use('/api',authuser)
const eventuser=require('./app/routes/user/userEventRoute')
app.use('/api',eventuser)
const ticketuser=require('./app/routes/user/userTicketRoute')
app.use('/api',ticketuser)
const bloguser=require('./app/routes/user/userBlogRoute')
app.use('/api',bloguser)

// Admin (EJS) 
const authadmin=require('./app/routes/admin/adminAuthRoute')
app.use(authadmin)
const organizer=require('./app/routes/event_organizer/event_organizerAuthRoute')
app.use(organizer)
const category=require('./app/routes/admin/adminCategoryRoutes')
app.use(category)
const eventadmin=require('./app/routes/admin/admineventRoute')
app.use(eventadmin)
const eventorganizer=require('./app/routes/event_organizer/event_organizerEventRoute')
app.use(eventorganizer)
const ticketadmin=require('./app/routes/admin/adminticketRoute')
app.use(ticketadmin)
const ticketorganizer=require('./app/routes/event_organizer/event_organizerTicketRoute')
app.use(ticketorganizer)
const useradmin=require('./app/routes/admin/adminuserRoute')
app.use(useradmin)
const organizeradmin=require('./app/routes/admin/admineventorganizerRoute')
app.use(organizeradmin)
const blogsadmin=require('./app/routes/admin/adminBlogRoutes')
app.use(blogsadmin)




// Basic route
app.get('/', (req, res) => {
  res.send('Event Ticketing & Management Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
