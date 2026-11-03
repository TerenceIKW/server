
const express = require('express');
const router = express.Router();
const { createContact } = require('../models/Contact');
const { notifySubmission } = require('../mailer');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const contact = await createContact({
      name,
      email,
      phone,
      subject,
      message
    });

    await notifySubmission('contact message', {
      Name: name,
      Email: email,
      Phone: phone || 'Not provided',
      Subject: subject,
      Message: message
    });

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. We will be in touch soon.',
      id: contact._id
    });
  } catch (err) {
    console.error('Contact error:', err.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
});

module.exports = router;
