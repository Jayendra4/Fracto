import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import Config from 'react-native-config';

const api = axios.create({
    baseURL: Config.API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    response => response,
    error => {
        return Promise.reject(error?.response?.data || error);
    }
);

api.interceptors.request.use(async (config) => {
    const credentials = await Keychain.getGenericPassword({ service: 'accessToken' });
    if (credentials) {
        const token = credentials.password;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
