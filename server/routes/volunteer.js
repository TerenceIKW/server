const express = require('express');
const router = express.Router();
const { createVolunteer } = require('../models/Volunteer');
const { notifySubmission } = require('../mailer');

// POST /api/volunteer
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      location,
      skills,
      availability,
      message
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and phone are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const volunteer = await createVolunteer({
      firstName,
      lastName,
      email,
      phone,
      age,
      location,
      skills,
      availability,
      message
    });

    await notifySubmission('volunteer signup', {
      Name: `${firstName} ${lastName}`,
      Email: email,
      Phone: phone,
      Age: age || 'Not provided',
      Location: location || 'Not provided',
      Skills: skills || 'Not provided',
      Availability: availability || 'Not provided',
      Message: message || 'Not provided'
    });

    console.log(`🙋 New volunteer: ${firstName} ${lastName} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Thank you for signing up! We will contact you soon.',
      id: volunteer._id
    });
  } catch (err) {
    console.error('Volunteer error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
});

module.exports = router;