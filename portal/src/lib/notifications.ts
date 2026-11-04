import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    console.warn('Notification permission denied');
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  return token;
}

export function onForegroundMessage(callback: (payload: any) => void) {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
}
