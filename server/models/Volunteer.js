const { getDB } = require('../db');

const COLLECTION = 'volunteers';

function volunteersCollection() {
  return getDB().collection(COLLECTION);
}

// Insert a new volunteer signup
async function createVolunteer(data) {
  const doc = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    age: data.age ? parseInt(data.age) : null,
    location: data.location || '',
    skills: data.skills || '',
    availability: data.availability || '',
    message: data.message || '',
    createdAt: new Date(),
    contacted: false
  };
  const result = await volunteersCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// Get all volunteers, newest first
async function getAllVolunteers(limit = 500) {
  return await volunteersCollection()
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

module.exports = {
  createVolunteer,
  getAllVolunteers
};