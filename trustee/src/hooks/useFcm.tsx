import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import toast from 'react-hot-toast';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setHasUnread } from '@/store/slices/notificationSlice';

export const useFcm = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!messaging) return;
        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = onMessage(messaging, (payload: any) => {
                console.log('Foreground message received:', payload);
                if (payload.notification) {
                    dispatch(setHasUnread(true));

                    toast.custom(
                        (t) => (
                            <div
                                className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                            >
                                <div className="flex-1 w-0 p-4">
                                    <div className="flex items-start">
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                {payload.notification?.title}
                                            </p>
                                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                {payload.notification?.body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex border-l border-zinc-200 dark:border-zinc-800">
                                    <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 focus:outline-none"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ),
                        {
                            duration: 5000,
                            position: 'top-right',
                        }
                    );
                }
            });
        } catch (e) {
            console.warn('FCM onMessage setup skipped:', e);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [dispatch]);
};
