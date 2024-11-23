const express = require('express');
const User = require('../models/User');
const { send_otp_email } = require('../controllers/email_sender');
require('dotenv').config();
const { body, validationResult } = require('express-validator');

const authenticationRouter = () => {
  const router = express.Router();

  // Request OTP
  router.post(
    '/request',
    [
      body('email').isEmail().withMessage('Valid email is required'),
    ],
    async (req, res) => {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

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
    }
  );

  // Verify OTP
  router.post(
    '/verify',
    [
      body('email').isEmail().withMessage('Valid email is required'),
      body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must be numeric'),
    ],
    async (req, res) => {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Return validation errors
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp } = req.body;

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
    }
  );

  return router;
};

module.exports = authenticationRouter;
