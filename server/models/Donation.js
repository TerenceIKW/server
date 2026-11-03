const { getDB } = require('../db');

const COLLECTION = 'donations';

function donationsCollection() {
  return getDB().collection(COLLECTION);
}

async function createDonation(data) {
  const doc = {
    reference: data.reference,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || '',
    amount: data.amount,
    message: data.message || '',
    status: 'pending',
    paymentMethod: 'manual',
    payfastPaymentId: null,
    createdAt: new Date(),
    paidAt: null
  };
  const result = await donationsCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function getAllDonations(limit = 500) {
  return await donationsCollection()
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

async function getPaidTotal() {
  const result = await donationsCollection()
    .aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ])
    .toArray();
  return {
    total: result[0] ? result[0].total : 0,
    count: result[0] ? result[0].count : 0
  };
}

async function updateDonationStatus(id, status) {
  const { ObjectId } = require('mongodb');
  const update = { status };
  if (status === 'paid') update.paidAt = new Date();
  await donationsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );
  return await donationsCollection().findOne({ _id: new ObjectId(id) });
}

module.exports = {
  createDonation,
  getAllDonations,
  getPaidTotal,
  updateDonationStatus
};