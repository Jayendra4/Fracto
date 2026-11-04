import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyCvYGYcYkfjuXtB_P-ym5HEbBvg3aanYKE',
  authDomain: 'hof-portal.firebaseapp.com',
  projectId: 'hof-portal',
  storageBucket: 'hof-portal.firebasestorage.app',
  messagingSenderId: '762864996498',
  appId: '1:762864996498:web:863cebe3ed316d0af0564b',
  measurementId: 'G-T8S8DNQ76Q',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);
