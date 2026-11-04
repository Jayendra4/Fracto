import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './authSlice.types';
import api from '../services/api';

interface AuthState {
    user?: User;
    isLoggedIn: boolean;
    identifier?: string;
    loading: boolean,
}

const initialState: AuthState = {
    user: undefined,
    isLoggedIn: false,
    identifier: undefined,
    loading: false,
};

export const refreshUser = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    'auth/refreshUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<User>('/accounts/me');
            console.log(response)
            return response.data;
        } catch (error: any) {
            console.log(error, 'auth error');
            if (error?.statusCode === 401) {
                return rejectWithValue('Unauthorized');
            }
            return rejectWithValue('Something went wrong');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<{ identifier: string }>) {
            state.isLoggedIn = true;
            state.identifier = action.payload.identifier;
        },
        logout(state) {
            state.isLoggedIn = false;
            state.identifier = undefined;
            state.user = undefined;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(refreshUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(refreshUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(refreshUser.rejected, (state) => {
                state.loading = false;
                state.user = undefined;
            });
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
