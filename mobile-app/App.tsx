import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNBootSplash from 'react-native-bootsplash';
import Keychain from 'react-native-keychain';
import MainNavigator from './app/navigation/MainNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from './app/store';
import { login, logout, refreshUser } from './app/store/authSlice';
import Routes, { OnboardingStackParamList } from './app/constant/Routes';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { clearStorage, createChannel, requestUserPermission } from './app/util/helper';
import { AccountType } from './app/store/authSlice.types';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import notifee, { AndroidStyle } from "@notifee/react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedSplash from './app/components/AnimatedSplash';
import { connectSocket } from './app/services/socket';
import { toastConfig } from './app/util/toast';
import { setNotifications } from './app/store/notificationSlice';
import { useNotificationApi } from './app/services/auth.service';
import { useTheme } from './app/util/theme';

const queryClient = new QueryClient();

const AppContent = ({
  showAnimatedSplash,
  setShowAnimatedSplash,
}: {
  showAnimatedSplash: boolean;
  setShowAnimatedSplash: (val: boolean) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const userDetails = useSelector((state: RootState) => state.auth.user);

  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof OnboardingStackParamList>(
    Routes.ONBOARDING.CREATEYOURACCOUNT
  );
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const isMountedRef = useRef(true);

  const messaging = useMemo(() => getMessaging(), []);

  const { refetch: refetchNotifications } = useNotificationApi({
    skip: 0,
    take: 10,
  });

  const bootstrapApp = async () => {
    try {
      setBootstrapError(null);
      setIsAppReady(false);

      const [alreadyLaunched, credentials] = await Promise.all([
        AsyncStorage.getItem('alreadyLaunched'),
        Keychain.getGenericPassword({ service: 'accessToken' }),
      ]);

      if (!alreadyLaunched) {
        if (isMountedRef.current) {
          setInitialRoute(Routes.ONBOARDING.ONBOARDINGSCREEN);
          setIsAppReady(true);
        }
        return;
      }

      if (credentials) {
        dispatch(login({ identifier: credentials.username }));

        try {
          const result = await dispatch(refreshUser()).unwrap();

          const route =
            result?.type === AccountType.Business
              ? Routes.ONBOARDINGTAB.ROLEASASSETOWNER
              : Routes.TABS.HOME;

          if (isMountedRef.current) {
            setInitialRoute(route);
            setIsAppReady(true);
          }
        } catch (error) {
          if (error === "Unauthorized") {
            await Keychain.resetGenericPassword({ service: 'accessToken' });
            dispatch(logout());
            await clearStorage();

            if (isMountedRef.current) {
              setInitialRoute(Routes.ONBOARDING.CREATEYOURACCOUNT);
              setIsAppReady(true);
            }
          } else {
            setBootstrapError("Something went wrong. Please retry.");
            return;
          }
        }
      } else {
        if (isMountedRef.current) {
          setInitialRoute(Routes.ONBOARDING.CREATEYOURACCOUNT);
          setIsAppReady(true);
        }
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
      setBootstrapError("Unexpected error. Please retry.");
      return;
    }
  };

  useEffect(() => {
    bootstrapApp();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (
      !initializedRef.current &&
      userDetails?.id &&
      isAppReady &&
      !showAnimatedSplash
    ) {
      initializedRef.current = true;
      requestUserPermission();
      const socket = connectSocket(userDetails.id);
      refetchNotifications().then((res) => {
        dispatch(setNotifications(res?.data?.data));
      });

      return () => {
        socket?.disconnect?.();
      };
    }
  }, [userDetails?.id, isAppReady, showAnimatedSplash]);

  useEffect(() => {
    const init = async () => {
      await createChannel();
    };

    init();

    const unsubscribe = onMessage(messaging, async (remoteMessage) => {
      if (!remoteMessage) return;

      const title = String(
        remoteMessage?.data?.title ??
        remoteMessage?.notification?.title ??
        "New Notification"
      );

      const body = String(
        remoteMessage?.data?.body ??
        remoteMessage?.notification?.body ??
        "You have a new message"
      );

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: 'default',
          style: {
            type: AndroidStyle.BIGTEXT,
            text: body,
          },
        },
      });
    });

    return unsubscribe;
  }, [messaging]);

  const handleRetry = async () => {
    initializedRef.current = false;
    setBootstrapError(null);
    await bootstrapApp();
  };

  const isLoading = !isAppReady || showAnimatedSplash;

  if (isLoading) {
    return (
      <AnimatedSplash
        error={bootstrapError}
        onRetry={handleRetry}
        onAnimationEnd={async () => {
          if (!bootstrapError) {
            await RNBootSplash.hide({ fade: false });
            setShowAnimatedSplash(false);
          }
        }}
      />
    );
  }

  return <MainNavigator initialRoute={initialRoute} />;
};

const App = () => {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const { colors } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView
        style={{
          flex: 1,
          backgroundColor: showAnimatedSplash ? colors.constant.white : colors.background.default,
        }}
      >
        <SafeAreaProvider>
          <AppContent
            showAnimatedSplash={showAnimatedSplash}
            setShowAnimatedSplash={setShowAnimatedSplash}
          />
          <Toast
            position="bottom"
            visibilityTime={1500}
            config={toastConfig}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

const AppWrapper = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default AppWrapper;