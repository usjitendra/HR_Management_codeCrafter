import admin from 'firebase-admin';

  const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
  
admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount)
});

const sendFirebaseNotification = async (fcmToken, payload) => {
        console.log("fcmToken",fcmToken);
        console.log("payload",payload);
        // return
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {} // optional custom data
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export default sendFirebaseNotification;
