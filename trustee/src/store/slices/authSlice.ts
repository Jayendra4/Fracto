import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Admin } from '@/types';
import { isTokenExpired } from '@/utils';
import { RWA_STORAGE_KEY } from '@/utils/constants';

interface AuthState {
  trusteeAccessToken: string | null;
  role: 'Trustee' | 'admin' | 'user' | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      trusteeAccessToken: null,
      role: null,
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  const storedToken = localStorage.getItem('trusteeAccessToken');
  const storedRole = localStorage.getItem('role');
  const storedAdmin = localStorage.getItem('admin');

  const isTokenValid = storedToken && !isTokenExpired(storedToken);

  return {
    trusteeAccessToken: isTokenValid ? storedToken : null,
    role: isTokenValid ? (storedRole as 'Trustee' | 'admin' | 'user') : null,
    admin: isTokenValid && storedAdmin ? JSON.parse(storedAdmin) : null,
    isAuthenticated: Boolean(isTokenValid),
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    setAuthCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; type: 'Trustee' | 'admin' | 'user' }>
    ) => {
      state.trusteeAccessToken = action.payload.accessToken;
      state.role = action.payload.type;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.setItem('trusteeAccessToken', action.payload.accessToken);
        localStorage.setItem('role', action.payload.type);
      }
    },

    setAdminProfile: (state, action: PayloadAction<Admin>) => {
      state.admin = action.payload;

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin', JSON.stringify(action.payload));
      }
    },

    logout: (state) => {
      state.trusteeAccessToken = null;
      state.role = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('trusteeAccessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('admin');
        localStorage.removeItem(RWA_STORAGE_KEY);
      }
    },

    clearAuth: (state) => {
      state.trusteeAccessToken = null;
      state.role = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('trusteeAccessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('admin');
        localStorage.removeItem(RWA_STORAGE_KEY);
      }
    },
  },
});

export const { setLoading, setError, setAuthCredentials, setAdminProfile, logout, clearAuth } =
  authSlice.actions;

export default authSlice.reducer;
