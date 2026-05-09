const admin = require('firebase-admin');

// You will need to provide your service account credentials here
// For testing locally without them, we will mock the verification if credentials are not found.

let isFirebaseInitialized = false;

try {
  // If FIREBASE_SERVICE_ACCOUNT is provided in .env as a JSON string, use it.
  // Otherwise, if you have a serviceAccountKey.json, you can require it.
  // We'll wrap in try-catch so it doesn't crash the server if missing.
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log("Firebase Admin Initialized successfully.");
  } else {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT not found in .env. Firebase verification will be skipped or mocked for testing.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

module.exports = {
  admin,
  isFirebaseInitialized
};
