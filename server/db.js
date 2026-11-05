require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is missing from your .env file.');
}

const client = new MongoClient(uri);

let db;
let connecting;

async function connectDB() {
  if (db) return db;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      await client.connect();
      db = client.db('testDB');
      await db.command({ ping: 1 });
      console.log('MongoDB Atlas connected successfully!');
      return db;
    } catch (error) {
      connecting = null;
      console.error('MongoDB connection failed:', error.message);
      throw error;
    }
  })();

  return connecting;
}

function getDB() {
  if (!db) {
    throw new Error('Database is not connected.');
  }

  return db;
}

module.exports = { connectDB, getDB };
