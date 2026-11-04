import { combineReducers } from '@reduxjs/toolkit';
import authLogin from './authLoginSlice';
import kyb from './kybSlice';
import userKyc from './userKycSlice';
import directorKyc from './directorKycSlice';
import auth from './authSlice';
import rwaAsset from './rwaAssetSlice';
import userProfile from './rwaAssetSlice';
import ui from './uiSlice';

const appReducer = combineReducers({
  authLogin,
  kyb,
  userKyc,
  directorKyc,
  auth,
  rwaAsset,
  userProfile,
  ui,
});

export const rootReducer = (state: any, action: any) => {
  if (action.type === 'APP/RESET') {
    state = undefined;
  }
  return appReducer(state, action);
};
