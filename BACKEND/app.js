 const dotenv = require('dotenv');
 dotenv.config();
 const express  = require('express');
 const cors = require('cors')
const connecToDb = require('./db/db'); // Make sure C:\FIXIFY\BACKEND\db\db.js exists, or update the path accordingly
const app = express();
const cookieParser = require('cookie-parser')
const userRoutes =  require('./routes/user.routes');
const utilityRoutes = require('./routes/utility.route');
const mapsRoutes = require('./routes/maps.routes')
const bookingRoutes = require("./routes/booking.route");
const adminRoutes = require('./routes/admin.routes');
const serviceRoutes = require('./routes/service.routes');
const feedbackRoutes = require('./routes/feedback.routes');

connecToDb();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}))
 app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/' , (req, res) => {
    res.send('Welcome to FIXIFY')
})
app.use('/users' , userRoutes)
app.use('/utilities', utilityRoutes);
app.use('/maps', mapsRoutes);
app.use("/bookings", bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/services', serviceRoutes);
app.use('/feedback', feedbackRoutes);

module.exports = app;