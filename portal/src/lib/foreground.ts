import { getMessaging, onMessage } from 'firebase/messaging';
import { firebaseApp } from './firebase';

export const initForegroundNotifications = () => {
  const messaging = getMessaging(firebaseApp);

  onMessage(messaging, (payload) => {
    console.log('Foreground notification:', payload);
  });
};
