// File: scripts/manage-admin.js
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Use require for JSON files
const serviceAccount = require(join(__dirname, '..', 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createUser(email, password = 'temporaryPassword123!') {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    console.log('Successfully created new user:', userRecord.uid);
    return userRecord;
  } catch (error) {
    console.log('Error creating new user:', error);
    throw error;
  }
}

async function setUserAsAdmin(email) {
  try {
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('User not found. Creating new user...');
        userRecord = await createUser(email);
      } else {
        throw error;
      }
    }

    // Update user's custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    // Check if the user document exists in Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      // If the document doesn't exist, create it
      await db.collection('users').doc(userRecord.uid).set({
        email: email,
        role: 'admin'
      });
      console.log(`Created new user document for ${email}`);
    } else {
      // If the document exists, update it
      await db.collection('users').doc(userRecord.uid).update({
        role: 'admin'
      });
      console.log(`Updated existing user document for ${email}`);
    }

    console.log(`Successfully set user ${email} as admin`);
  } catch (error) {
    console.error('Error setting user as admin:', error);
  } finally {
    process.exit();
  }
}

// Usage
const emailToSetAsAdmin = process.argv[2];

if (!emailToSetAsAdmin) {
  console.error('Please provide an email address as an argument');
  process.exit(1);
}

setUserAsAdmin(emailToSetAsAdmin);