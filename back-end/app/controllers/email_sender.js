const dotenv = require("dotenv"); 
const nodemailer = require("nodemailer");

dotenv.config();

// Generate a 6-digit OTP
function generate_otp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email function
async function send_otp_email(receiver_email) {
  const otp = generate_otp();

  // Configure Nodemailer with your email provider
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email content
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
    return otp; // Return OTP if needed for verification
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

send_otp_email("receiver@example.com")
  .then((otp) => console.log(`Generated OTP: ${otp}`))
  .catch(console.error);

module.exports = { send_otp_email };
