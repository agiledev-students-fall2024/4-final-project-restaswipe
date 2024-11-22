const nodemailer = require('nodemailer');
require('dotenv').config();

async function send_otp_email(receiver_email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mail_options = {
    from: process.env.EMAIL_USER,
    to: receiver_email,
    subject: 'Your OTP Code',
    text: `Your one-time password (OTP) is: ${otp}`,
  };

  // Send email
  try {
    await transporter.sendMail(mail_options);
    console.log(`OTP sent to ${receiver_email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { send_otp_email };
