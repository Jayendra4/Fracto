import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type UserProfileStep = 1 | 2 | 3 | 4 | 5;

/* ---------- Header Stepper Meta ---------- */
interface HeaderStepperState {
    currentStep: number;
    totalSteps: number;
    title: string;
    nextTitle?: string;

    steps: {
        step: number;
        title: string;
        completed: boolean;
    }[];
}


/* ---------- Slice State ---------- */
interface UserProfileState {
    step: UserProfileStep;
    headerStepper?: HeaderStepperState;
}

/* ---------- LocalStorage Restore ---------- */
const savedStep =
    typeof window !== 'undefined'
        ? (JSON.parse(
            localStorage.getItem('user_profile_step') || '1'
        ) as UserProfileStep)
        : 1;

/* ---------- Initial State ---------- */
const initialState: UserProfileState = {
    step: savedStep,
};

/* ---------- Slice ---------- */
export const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState,
    reducers: {
        /* Current step control */
        saveUserProfileStep: (
            state,
            action: PayloadAction<UserProfileStep>
        ) => {
            state.step = action.payload;
            localStorage.setItem(
                'user_profile_step',
                JSON.stringify(action.payload)
            );
        },

        /* Header-only stepper data */
        setHeaderStepper: (
            state,
            action: PayloadAction<HeaderStepperState>
        ) => {
            state.headerStepper = action.payload;
        },

        /* Reset on logout */
        resetUserProfile: (state) => {
            state.step = 1;
            state.headerStepper = undefined;

            localStorage.removeItem('user_profile_step');
        },
    },
});

export const {
    saveUserProfileStep,
    setHeaderStepper,
    resetUserProfile,
} = userProfileSlice.actions;

export default userProfileSlice.reducer;
