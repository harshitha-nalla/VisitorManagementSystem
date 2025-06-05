const nodemailer = require('nodemailer');

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = {
  sendMail: (mailOptions) => transporter.sendMail(mailOptions),
  from: process.env.EMAIL_USER
}; 