import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { clearOnLogout } from '@/utils/clearOnLogout';

interface AuthState {
  token: string | null;
  role: string | null;
  user: any | null;
  company: any | null;
  assets: any[] | null;
  bankAccounts: number | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: Cookies.get('hof_token') || null,
  role: Cookies.get('hof_role') || null,

  user: localStorage.getItem('hof_user')
    ? JSON.parse(localStorage.getItem('hof_user')!)
    : null,

  company: localStorage.getItem('hof_company')
    ? JSON.parse(localStorage.getItem('hof_company')!)
    : null,

  assets: Cookies.get('hof_assets')
    ? JSON.parse(Cookies.get('hof_assets')!)
    : null,

  bankAccounts: Cookies.get('hof_bank')
    ? JSON.parse(Cookies.get('hof_bank')!)
    : null,

  isAuthenticated: !!Cookies.get('hof_token'),
};

const authLoginSlice = createSlice({
  name: 'authLogin',
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      const payload = action.payload || {};

      if ('token' in payload) {
        state.token = payload.token;
        Cookies.set('hof_token', payload.token, {
          expires: 7,
          secure: true,
          sameSite: 'Strict',
        });
      }

      if ('role' in payload) {
        state.role = payload.role;
        Cookies.set('hof_role', payload.role, {
          expires: 7,
          secure: true,
          sameSite: 'Strict',
        });
      }

      if ('user' in payload) {
        state.user = payload.user;
        localStorage.setItem('hof_user', JSON.stringify(payload.user));
      }

      if (payload.company !== undefined) {
        state.company = payload.company;
        localStorage.setItem('hof_company', JSON.stringify(payload.company));
      }

      if (payload.assets !== undefined) {
        state.assets = payload.assets;
        Cookies.set('hof_assets', JSON.stringify(payload.assets), {
          expires: 7,
          secure: true,
          sameSite: 'Strict',
        });
      }

      if (payload.bankAccounts !== undefined) {
        state.bankAccounts = payload.bankAccounts;
        Cookies.set('hof_bank', JSON.stringify(payload.bankAccounts), {
          expires: 7,
          secure: true,
          sameSite: 'Strict',
        });
      }

      if (typeof payload.isAuthenticated === 'boolean') {
        state.isAuthenticated = payload.isAuthenticated;
      }
    },

    updateAuthToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;

      Cookies.set('hof_token', action.payload, {
        expires: 1,
        secure: true,
        sameSite: 'Strict',
      });
    },

    updateAuthRole: (state, action) => {
      state.role = action.payload;

      Cookies.set('hof_role', action.payload, {
        expires: 1,
        secure: true,
        sameSite: 'Strict',
      });
    },

    logout: (state) => {
      state.token = null;
      state.role = null;
      state.user = null;
      state.company = null;
      state.assets = null;
      state.bankAccounts = null;
      state.isAuthenticated = false;

      clearOnLogout();
    },
  },
});

export const { setAuthData, logout, updateAuthToken, updateAuthRole } =
  authLoginSlice.actions;
export default authLoginSlice.reducer;
