importScripts('/firebase-env.js');
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
);

firebase.initializeApp(self.__FIREBASE_ENV__);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (!payload?.notification) return;

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon || '/firebase-icon.png',
    data: payload.data || {},
  });
});
