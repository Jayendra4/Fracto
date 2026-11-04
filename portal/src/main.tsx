import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import App from './App.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient.ts';
import AuthProvider from './provider/AuthProvider.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => { });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>
);
