import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pages from './pages';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFcmToken } from '@/redux/slices/notificationSlice';
import {
  requestNotificationPermission,
  onForegroundMessage,
} from '@/lib/notifications';
import 'aos/dist/aos.css';
import type { RootState } from './redux/store';
import Cookies from 'js-cookie';
import { useProfileSync } from './hooks/useProfileSync';
import { getJwtExpiry } from '@/utils/jwt.utils';
import { logout } from '@/redux/slices/authLoginSlice';
// import { useThemeStore } from "./stores";
// import { applyTheme } from "./utils/theme.utils";

import { ChatNotificationProvider } from './provider/ChatNotificationProvider';
import { GlobalToastProvider } from './provider/GlobalToastProvider';

export function ThemeSync() {
  const theme = useSelector((state: RootState) => state.mode.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      document.body.style.overflow = '';
    });

    // AOS.init({
    //   once: true,
    //   duration: 800,
    //   easing: 'ease-out-cubic',
    // });
  }, [theme]);

  return null;
}

function App() {
  const dispatch = useDispatch();
  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    '';

  const queryClient = useQueryClient();

  useProfileSync(token);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handler = () => {
      // Invalidate and refetch immediately for critical dashboard data
      // Using a small delay to ensure server-side processing is definitely complete
      timeoutId = setTimeout(() => {
        const options = { refetchType: 'all' } as const;

        queryClient.invalidateQueries({
          queryKey: ['broker-commission-summary'],
          ...options,
        });
        queryClient.invalidateQueries({
          queryKey: ['broker-dashboard'],
          ...options,
        });
        queryClient.invalidateQueries({
          queryKey: ['broker-commissions'],
          ...options,
        });
        queryClient.invalidateQueries({
          queryKey: ['broker-locks-commission'],
          ...options,
        });
        queryClient.invalidateQueries({ queryKey: ['my-wallet'], ...options });
        queryClient.invalidateQueries({
          queryKey: ['payment-requests'],
          ...options,
        });
        queryClient.invalidateQueries({
          queryKey: ['user-profile'],
          ...options,
        });
        queryClient.invalidateQueries({ queryKey: ['kyc-status'], ...options });
        queryClient.invalidateQueries({ queryKey: ['activities'], ...options });
        queryClient.invalidateQueries({
          queryKey: ['my-notifications'],
          ...options,
        });
      }, 500);
    };

    window.addEventListener('fcm-notification', handler);
    return () => {
      window.removeEventListener('fcm-notification', handler);
      clearTimeout(timeoutId);
    };
  }, [queryClient]);

  useEffect(() => {
    async function initFCM() {
      const token = await requestNotificationPermission();
      if (token) {
        dispatch(setFcmToken(token));
      }
    }

    initFCM();

    onForegroundMessage((payload) => {
      if (!payload) return;

      // Even if there's no visible notification object, we want to trigger the event
      // so queries can be invalidated.
      const id =
        payload.data?.id || payload.notification?.tag || crypto.randomUUID();

      const notification = payload.notification
        ? {
            id: String(id),
            title: payload.notification.title,
            description: payload.notification.body ?? '',
            isRead: false,
            createdAt: new Date().toISOString(),
          }
        : null;

      if (notification) {
        (window as any).__FCM_NOTIFICATIONS__ =
          (window as any).__FCM_NOTIFICATIONS__ || [];
        (window as any).__FCM_NOTIFICATIONS__.unshift(notification);
      }

      window.dispatchEvent(
        new CustomEvent('fcm-notification', {
          detail: { notification, data: payload.data },
        })
      );
    });
  }, []);

  useEffect(() => {
    const token = Cookies.get('hof_token');
    if (!token) return;

    const expiry = getJwtExpiry(token);
    if (!expiry) return;

    const timeout = expiry - Date.now();

    if (timeout <= 0) {
      Cookies.remove('hof_token');
      dispatch(logout());
      window.location.href = '/login';
      return;
    }

    const timer = setTimeout(() => {
      Cookies.remove('hof_token');
      dispatch(logout());
      window.location.href = '/login';
    }, timeout);

    return () => clearTimeout(timer);
  }, []);

  return (
    <React.Fragment>
      <BrowserRouter>
        <ThemeSync />
        <PageLoader>
          <ScrollToTop />
          <GlobalToastProvider>
            <ChatNotificationProvider>
              <main id="main-content" className="min-h-screen">
                <Pages />
              </main>
            </ChatNotificationProvider>
          </GlobalToastProvider>
        </PageLoader>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
