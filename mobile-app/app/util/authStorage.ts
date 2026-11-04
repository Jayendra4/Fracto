import AsyncStorage from '@react-native-async-storage/async-storage';

export const REMEMBER_ME_KEY = 'REMEMBER_ME';
export const REMEMBER_USER_EMAIL_KEY = 'REMEMBER_EMAIL_USER';
export const REMEMBER_USER_MOBILE_KEY = 'REMEMBER_MOBILE_USER';

export enum UserOnboardingType {
    Login = 'login',
    Register = 'register',
    ResetPassword = 'resetpassword',
}

export const saveAuthSession = async (
    email: string,
    mobile: string,
    rememberMe: boolean
) => {
    if (rememberMe) {
        await AsyncStorage.multiSet([
            [REMEMBER_ME_KEY, 'true'],
            [REMEMBER_USER_EMAIL_KEY, email],
            [REMEMBER_USER_MOBILE_KEY, mobile],
        ]);
    } else {
        await AsyncStorage.multiRemove([
            REMEMBER_ME_KEY,
            REMEMBER_USER_EMAIL_KEY,
            REMEMBER_USER_MOBILE_KEY,
        ]);
    }
};

export const clearAuthSession = async () => {
    await AsyncStorage.multiRemove([
        'AUTH_TOKEN',
        REMEMBER_ME_KEY,
        REMEMBER_USER_EMAIL_KEY,
        REMEMBER_USER_MOBILE_KEY,
    ]);
};

export const getRememberedUser = async (): Promise<{
    rememberMe: boolean;
    email: string | null;
    mobile: string | null;
}> => {
    try {
        const [rememberMe, email, mobile] = await AsyncStorage.multiGet([
            REMEMBER_ME_KEY,
            REMEMBER_USER_EMAIL_KEY,
            REMEMBER_USER_MOBILE_KEY,
        ]);

        return {
            rememberMe: rememberMe[1] === 'true',
            email: email[1],
            mobile: mobile[1],
        };
    } catch (error) {
        return {
            rememberMe: false,
            email: null,
            mobile: null,
        };
    }
};