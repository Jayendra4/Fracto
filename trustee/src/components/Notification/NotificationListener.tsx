import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/firebase';
import { requestNotificationPermission } from '@/utils/notifications';
import { useSendFcmTokenMutation } from '@/store/api/notificationApi';
import { FCM_STORAGE_KEY } from '@/utils/constants';
import toast from 'react-hot-toast';
import NotificationToast from './NotificationToast';

const NotificationListener = () => {
  const [sendFcmToken] = useSendFcmTokenMutation();

  useEffect(() => {
    const initFCM = async () => {
      const storedToken = localStorage.getItem(FCM_STORAGE_KEY);

      if (storedToken) return;

      const token = await requestNotificationPermission();

      if (!token) return;

      try {
        await sendFcmToken({ token }).unwrap();

        localStorage.setItem(FCM_STORAGE_KEY, token);
      } catch (err) {
        console.error('Failed to send FCM token to backend', err);
      }
    };

    initFCM();

    let unsubscribe: (() => void) | undefined;
    if (messaging) {
      try {
        unsubscribe = onMessage(messaging, (payload: any) => {
          console.log('FCM Foreground Message:', payload);

          const title = payload.notification?.title || payload.data?.title || 'Notification';

          const body = payload.notification?.body || payload.data?.body || '';

          toast.custom(
            (t) => (
              <div
                className={`transition-all ${
                  t.visible ? 'animate-in slide-in-from-right' : 'animate-out slide-out-to-right'
                }`}
              >
                <NotificationToast title={title} body={body} />
              </div>
            ),
            {
              duration: 5000,
              position: 'top-right',
            }
          );
        });
      } catch (e) {
        console.warn('onMessage registration skipped:', e);
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return null;
};

export default NotificationListener;
