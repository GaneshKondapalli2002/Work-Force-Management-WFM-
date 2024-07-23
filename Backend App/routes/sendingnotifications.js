// routes/sendingnotification.js
const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (userId, title, body) => {
  try {
    const userSnapshot = await admin.firestore().collection('users').doc(userId).get();
    if (!userSnapshot.exists) {
      console.error(`User with ID ${userId} not found`);
      return;
    }

    const fcmToken = userSnapshot.data().fcmToken;

    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: fcmToken,
    };

    await admin.messaging().send(message);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = sendNotification;
