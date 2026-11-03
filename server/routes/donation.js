const express = require('express');
const router = express.Router();
const { createDonation, getAllDonations } = require('../models/Donation');
const { notifySubmission } = require('../mailer');

router.post('/', async (req, res) => {
  try {
    const { reference, firstName, lastName, email, phone, amount, message } = req.body;

    if (!firstName || !lastName || !email || !amount) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and amount are required.' });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid donation amount greater than zero.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const finalReference = reference || ('DONATION-' + Date.now());
    const donation = await createDonation({ reference: finalReference, firstName, lastName, email, phone, amount: Number(amount), message });

    await notifySubmission('donation', {
      Reference: finalReference,
      Name: `${firstName} ${lastName}`,
      Email: email,
      Phone: phone || 'Not provided',
      Amount: `R${Number(amount).toFixed(2)}`,
      Message: message || 'Not provided'
    });

    res.status(201).json({ success: true, message: 'Thank you for your donation! We will be in touch to confirm.', id: donation._id, reference: finalReference });
  } catch (err) {
    console.error('Donation error:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const donations = await getAllDonations();
    res.json({ success: true, count: donations.length, data: donations });
  } catch (err) {
    console.error('Get donations error:', err.message);
    res.status(500).json({ success: false, message: 'Could not fetch donations.' });
  }
});

module.exports = router;