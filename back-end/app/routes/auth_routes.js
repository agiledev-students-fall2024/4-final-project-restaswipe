const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { send_otp_email } = require('../controllers/email_sender');
require('dotenv').config();

const authenticationRouter = () => {
  const router = express.Router();

  // Request OTP
  router.post('/request', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send('Email is required');

    try {
      let user = await User.findOne({ email });
      if (!user) {
        // Create a new user if not exist
        user = new User({ email });
      }
      const otp = await user.generateOTP();
      // Send the OTP via email
      await send_otp_email(email, otp);
      res.status(200).send('OTP sent');
    } catch (error) {
      console.error('Error in /auth/request:', error);
      res.status(500).send('Error generating OTP');
    }
  });

  // Verify OTP
  router.post('/verify', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).send('Email and OTP are required.');

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send('User not found');
      }

      const isValid = await user.validateOTP(otp);
      if (isValid) {
        await user.clearOTP();
        const token = user.generateJWT();
        res.status(200).json({ message: 'OTP verified', token });
      } else {
        res.status(400).send('Invalid or expired OTP');
      }
    } catch (error) {
      console.error('Error in /auth/verify:', error);
      res.status(500).send('Error verifying OTP');
    }
  });

  return router;
};

module.exports = authenticationRouter;
