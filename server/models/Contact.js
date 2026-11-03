const { getDB } = require('../db');

const COLLECTION = 'contacts';

function contactsCollection() {
  return getDB().collection(COLLECTION);
}

// Insert a new contact message
async function createContact(data) {
  const doc = {
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    subject: data.subject,
    message: data.message,
    createdAt: new Date(),
    read: false
  };
  const result = await contactsCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// Get all contacts, newest first
async function getAllContacts(limit = 500) {
  return await contactsCollection()
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// Delete one contact by id
async function deleteContact(id) {
  const { ObjectId } = require('mongodb');
  return await contactsCollection().deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  createContact,
  getAllContacts,
  deleteContact
};