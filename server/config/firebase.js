const admin = require('firebase-admin');
const path = require('path');

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    try {
      const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('✅ Firebase Admin SDK initialized');
    } catch (error) {
      console.error('❌ Firebase Admin SDK init error:', error.message);
      throw error;
    }
  }
};

module.exports = initializeFirebase;
