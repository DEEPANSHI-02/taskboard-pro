const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  // Check if already initialized
  if (admin.apps.length === 0) {
    try {
      // Use service account credentials from environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        // Try to initialize with default credentials (usually from service account file)
        admin.initializeApp();
      }
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      throw error;
    }
  }
};

module.exports = initializeFirebase;