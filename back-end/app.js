const express = require('express');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const restaurantsRouter = require('./app/routes/restaurant_routes');
const authenticationRouter = require('./app/routes/auth_routes');
const userRouter = require('./app/routes/user_routes');
const jwtStrategy = require('./app/config/jwt');
require('dotenv').config({ silent: true });
const mongoose = require('mongoose');

const app = express();

// DB setup
try {
  mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');
} catch (err) {
  console.log(`Error connecting to MongoDB: ${err}`);
}

// Middleware
passport.use(jwtStrategy);
app.use(passport.initialize());
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));
app.use(cors({ origin: process.env.FRONT_END_DOMAIN }));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/restaurants', restaurantsRouter());
app.use('/auth', authenticationRouter());
app.use('/user', userRouter());

module.exports = app;
