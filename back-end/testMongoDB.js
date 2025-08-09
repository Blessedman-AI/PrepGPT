// testMongoDB.js - Run this with: node testMongoDB.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  console.log('🔄 Testing MongoDB connection...');

  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');

    // Test ping
    const adminDb = client.db().admin();
    const pingResult = await adminDb.ping();
    console.log('✅ Ping successful:', pingResult);

    // List databases
    const databasesList = await adminDb.listDatabases();
    console.log('📁 Available databases:');
    databasesList.databases.forEach((db) => {
      console.log(`   - ${db.name}`);
    });

    // Test creating/accessing your quiz database
    const quizDb = client.db('prepgpt'); // Replace with your actual DB name
    const collections = await quizDb.listCollections().toArray();
    console.log(`📚 Collections in PrepGPT database: ${collections.length}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    // Close connection
    await client.close();
    console.log('🔌 Connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
