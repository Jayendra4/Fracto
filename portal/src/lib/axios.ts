import axios from 'axios';
import Cookies from 'js-cookie';
import { store } from '@/redux/store';
import { logout } from '@/redux/slices/authLoginSlice';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get('hof_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const isLoginPage = window.location.pathname.includes('/login');
      if (!isLoginPage) {
        Cookies.remove('hof_token');
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
