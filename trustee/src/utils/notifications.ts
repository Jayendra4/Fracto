import { getToken } from 'firebase/messaging';
import { messaging } from '@/firebase';

const VAPID_KEY =
  'BIZZq7lS9IUhlIwRXmQdifyhcCqTR6Cx6I1aE9z7XrFlNRphChxPL48wDoiIRfmmhEnctjvFoQGTBc7HXZKCTAg';

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!token) {
      console.warn('FCM token not generated');
      return null;
    }

    return token;
  } catch (error) {
    console.error('FCM permission/token error:', error);
    return null;
  }
};
