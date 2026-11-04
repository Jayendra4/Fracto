import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import authLoginReducer from './slices/authLoginSlice';
import kybReducer from './slices/kybSlice';
import rwaAssetReducer from '@/redux/slices/rwaAssetSlice';
import userKycReducer from '@/redux/slices/userKycSlice';
import userKycNew from '@/redux/slices/UserKycNewSlice';
import directorKycReducer from '@/redux/slices/directorKycSlice';
import userProfileReducer from './slices/userProfileSlice';
import uiSliceReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import modeReducer from './slices/modeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    authLogin: authLoginReducer,
    kyb: kybReducer,
    rwaAsset: rwaAssetReducer,
    userProfile: userProfileReducer,
    userKyc: userKycReducer,
    userKycNew: userKycNew,
    ui: uiSliceReducer,
    directorKyc: directorKycReducer,
    notifications: notificationReducer,
    mode: modeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
