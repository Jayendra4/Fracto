import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCvYGYcYkfjuXtB_P-ym5HEbBvg3aanYKE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hof-portal.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hof-portal',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hof-portal.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '762864996498',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:762864996498:web:863cebe3ed316d0af0564b',
  measurementId: 'G-T8S8DNQ76Q',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : (null as any);

export default app;
