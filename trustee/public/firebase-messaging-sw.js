importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCvYGYcYkfjuXtB_P-ym5HEbBvg3aanYKE",
  authDomain: "hof-portal.firebaseapp.com",
  projectId: "hof-portal",
  storageBucket: "hof-portal.firebasestorage.app",
  messagingSenderId: "762864996498",
  appId: "1:762864996498:web:863cebe3ed316d0af0564b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
