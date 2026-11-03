const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/auth');

const { getAllContacts, deleteContact } = require('../models/Contact');
const { getAllDonations, updateDonationStatus } = require('../models/Donation');
const { getAllVolunteers } = require('../models/Volunteer');

// All routes below require the admin key
router.use(adminAuth);

// GET /api/admin/contacts
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    console.error('Admin contacts error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/contacts/:id
router.delete('/contacts/:id', async (req, res) => {
  try {
    await deleteContact(req.params.id);
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    console.error('Admin delete contact error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await getAllDonations();
    const totalPaid = donations
      .filter(d => d.status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0);
    const totalPending = donations
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.amount, 0);

    res.json({
      success: true,
      count: donations.length,
      totalPaid,
      totalPending,
      data: donations
    });
  } catch (err) {
    console.error('Admin donations error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/donations/:id/status
router.patch('/donations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'paid', 'cancelled', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const donation = await updateDonationStatus(req.params.id, status);
    res.json({ success: true, data: donation });
  } catch (err) {
    console.error('Admin update donation error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/volunteers
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await getAllVolunteers();
    res.json({ success: true, count: volunteers.length, data: volunteers });
  } catch (err) {
    console.error('Admin volunteers error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;