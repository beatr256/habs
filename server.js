require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;
const emailTo = process.env.EMAIL_TO || 'hababupapastathopolos@gmail.com';
const emailFrom = process.env.EMAIL_FROM || 'Habs Tours and Travel <noreply@habs.local>';

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and trip details are required.'
    });
  }

  const travellerName = String(name).trim();
  const travellerEmail = String(email).trim();
  const tripDetails = String(message).trim();

  if (!travellerName || !travellerEmail || !tripDetails) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all fields before sending your inquiry.'
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(travellerEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: emailFrom,
    to: emailTo,
    replyTo: travellerEmail,
    subject: `Safari inquiry from ${travellerName}`,
    text: [
      `Name: ${travellerName}`,
      `Email: ${travellerEmail}`,
      '',
      'Trip details:',
      tripDetails
    ].join('\n')
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const isDebugMode = !process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS;

    return res.status(200).json({
      success: true,
      message: 'Your inquiry was received. We will get back to you shortly.',
      mode: isDebugMode ? 'debug' : 'live',
      messageId: info.messageId || null
    });
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    return res.status(500).json({
      success: false,
      message: 'We could not send your inquiry right now. Please try again or contact us by WhatsApp.'
    });
  }
});

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app };
