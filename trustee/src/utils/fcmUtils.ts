import { getToken } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

/**
 * Requests notification permission and returns the FCM token if granted.
 */
export const getFcmToken = async (): Promise<string | null> => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const fcmToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });
            return fcmToken;
        }
        console.log('Notification permission denied');
        return null;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};
