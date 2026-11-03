
require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

if (!uri) {
    throw new Error('MONGO_URI is missing from your .env file.');
}

const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();

        db = client.db('testDB');

        await db.command({ ping: 1 });

        console.log('MongoDB Atlas connected successfully!');

        return db;
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database is not connected.');
    }

    return db;
}

module.exports = { connectDB, getDB };
