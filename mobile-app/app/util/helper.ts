import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from '@react-native-clipboard/clipboard';
import { Alert, Linking, PermissionsAndroid, Platform, ToastAndroid } from "react-native";
import {
    getMessaging,
    requestPermission,
    AuthorizationStatus,
    getToken,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { fcmToken } from "../services/auth.service";
import { KYC_STEP_KEY, KYC_STORAGE_KEY } from "../tabs/Kyc";
import { MASTER_RWA_STEP_KEY, MASTER_RWA_STORAGE_KEY } from "../views/MasterRWA";
import { DIRECTOR_KYC_STEP_KEY } from "../views/DirectorsKYCSteps";
import { COMPANY_ID_KEY, COMPANY_KYB_DATA_KEY, COMPANY_KYB_STEP_KEY } from "../views/CompanyKYB";
import { ONBOARDING_STEP_KEY } from "../tabs/Onboarding";
import { USER_TYPE_KEY } from "../views/SelectRoleAsAssetOwner";
import { ACCOUNT_TYPE_KEY } from "../views/CreateYourAccount";
import { COUNTRY_KEY, COUNTRYINDEX_KEY, DIALCODE_KEY, REFER_KEY } from "../views/SelectAccountType";
import moment from "moment";
import Config from "react-native-config";

const api_url = Config.API_URL;

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatAmountWithCommas = (
    amount?: number | string | null
): string => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
        return '0';
    }

    const value = Math.trunc(Number(amount));
    return new Intl.NumberFormat('en-IN').format(value);
};

export const capitalizeWords = (text?: string) => {
    if (!text) return undefined;

    return text
        .toLowerCase()
        .split(" ")
        .map(
            word =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};

export const timeAgo = (dateString: string) => {
    return moment(dateString).fromNow();
};

export const formatDate = (isoDate: string) => {
    if (!isoDate) return '';

    const date = new Date(isoDate);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

export const clearStorage = async () => {
    try {
        await AsyncStorage.multiRemove([
            COUNTRY_KEY,
            DIALCODE_KEY,
            COUNTRYINDEX_KEY,
            ACCOUNT_TYPE_KEY,
            REFER_KEY,
            USER_TYPE_KEY,
            ONBOARDING_STEP_KEY,
            COMPANY_KYB_STEP_KEY,
            DIRECTOR_KYC_STEP_KEY,
            MASTER_RWA_STEP_KEY,
            MASTER_RWA_STORAGE_KEY,
            KYC_STORAGE_KEY,
            KYC_STEP_KEY,
            COMPANY_KYB_DATA_KEY,
            COMPANY_KYB_STEP_KEY,
            COMPANY_ID_KEY,
        ]);
    } catch (e) {
        console.error("Error clearing storage", e);
    }
};

export const copyToClipboard = (text: string, message = 'Copied to clipboard') => {
    Clipboard.setString(text);

    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        Alert.alert(message);
    }
};

export const openWebsite = (url: string) => {
    const link = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(link);
};

export const renderProfileImageUrl = (url: string) => {
    return url?.startsWith("http") ? url :
        `${api_url}/storage/user/profile/${url}`;
};

export const renderNormalUrl = (url: string) => {
    return url?.startsWith("http") ? url :
        `${api_url}/storage/${url}`;
};

export async function requestUserPermission() {
    const messaging = getMessaging();

    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            return false;
        }
    }

    if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(messaging);

        const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
            console.log('iOS notification permission denied');
            return false;
        }
    }

    const token = await getToken(messaging);

    await fcmToken({ token });

    return true;
}

export async function createChannel() {
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });
};