import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface KycState {
  panNumber?: string;
  dateOfBirth?: string;
  panFile?: File | null;
  panFileUrl?: string;
  panFileName?: string;
  panFileType?: string;

  occupation?: string;
  occupationIndustry?: string;
  monthlyIncome?: string;

  residentialAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  addressProofType?: string;
  addressProofFile?: File | null;
  addressProofFileUrl?: string;
  addressProofFileName?: string;
  addressProofFileType?: string;

  selfie?: File | null;
  selfieUrl?: string;
  selfieFileName?: string;
  selfieFileType?: string;

  passportPhoto?: File | null;
  secondaryIdType?: string;
  secondaryIdFile?: File | null;
  secondaryIdFileUrl?: string;
  secondaryIdFileName?: string;
  secondaryIdFileType?: string;

  // Broker specific fields
  licenseNumber?: string;
  licenseExpiry?: string;
}

const initialState: KycState = {};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    updateKycData: (state, action: PayloadAction<Partial<KycState>>) => {
      if (action.payload.residentialAddress) {
        state.residentialAddress = {
          ...state.residentialAddress,
          ...action.payload.residentialAddress,
        };
      }
      Object.entries(action.payload).forEach(([key, value]) => {
        if (key !== 'residentialAddress') {
          (state as any)[key] = value;
        }
      });
    },
    setKycDataFromApi: (state, action: PayloadAction<Partial<KycState>>) => {
      Object.entries(action.payload).forEach(([key, value]) => {
        (state as any)[key] = value;
      });
    },
    resetKyc: () => {
      return {};
    },
  },
});

export const { updateKycData, resetKyc, setKycDataFromApi } = kycSlice.actions;
export default kycSlice.reducer;
