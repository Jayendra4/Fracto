import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formSignupState } from "../views/SignUp";
import { CreatePasswordState } from "../views/CreatePassword";
import { UserType } from "../store/authSlice.types";

export type HomeTabsParamList = {
    DASHBOARD: undefined;
    PROPERTY: undefined;
    KYC: undefined;
    PROFILE: undefined;
    FUNDS: undefined;
    ASSET: undefined;
    ONBOARDING: undefined;
};

export const Routes = {
    ONBOARDING: {
        LOGIN: 'LOGIN',
        CREATEYOURACCOUNT: 'CREATEYOURACCOUNT',
        SELECTACCOUNTTYPE: 'SELECTACCOUNTTYPE',
        SIGNUP: 'SIGNUP',
        CREATEPASSWORD: 'CREATEPASSWORD',
        DUALOTPVERIFICATION: 'DUALOTPVERIFICATION',
        FORGOTPASSWORD: 'FORGOTPASSWORD',
        RESETPASSWORD: 'RESETPASSWORD',
        SHOWSELECTEDPROFILE: 'SHOWSELECTEDPROFILE',
        ONBOARDINGSCREEN: "ONBOARDINGSCREEN",
    },
    TABS: {
        HOME: 'HOME',
        DASHBOARD: 'DASHBOARD',
        PROPERTY: 'PROPERTY',
        KYC: 'KYC',
        FUNDS: 'FUNDS',
        ASSET: 'ASSET',
        PROFILE: 'PROFILE',
        ONBOARDING: 'ONBOARDING',
    },
    PROPERTY: {
        NOTIFICATION: 'NOTIFICATION',
        DETAILS: 'DETAILS',
        BUYFRACTION: "BUYFRACTION",
        SAVEDASSET: "SAVEDASSET",
        ONBOARDEDINSIGHTSHISTORY: "ONBOARDEDINSIGHTSHISTORY",
    },
    BANNER: {
        SUCCESS: 'SUCCESS',
        SUBMITTED: 'SUBMITTED',
    },
    PROFILE: {
        PERSONALINFORMATION: 'PERSONALINFORMATION',
        DOCUMENTS: 'DOCUMENTS',
        BANKDETAILS: 'BANKDETAILS',
        TRANSACTIONHISTORY: 'TRANSACTIONHISTORY',
        PREVIEWDOCUMENT: 'PREVIEWDOCUMENT',
        BROKERPERSONALINFORMATION: 'BROKERPERSONALINFORMATION',
    },
    FUNDS: {
        ADDMONEY: "ADDMONEY",
        WITHDRAWMONEY: "WITHDRAWMONEY",
    },
    ONBOARDINGTAB: {
        COMPANYKYB: 'COMPANYKYB',
        DIRECTORSKYCSTEPS: 'DIRECTORSKYCSTEPS',
        MASTERRWA: 'MASTERRWA',
        ROLEASASSETOWNER: 'ROLEASASSETOWNER',
        VENDORLIST: "VENDORLIST",
    },
    DASHBOARD: {
        INVESTORDETAILS: 'INVESTORDETAILS',
        PROPERTYSTATUS: 'PROPERTYSTATUS',
        COMMISSIONRECEIPT: 'COMMISSIONRECEIPT',
        REFERRALDETAILS: 'REFERRALDETAILS',
        REALWORLDHISTORY: 'REALWORLDHISTORY',
        BROKER_REFERRED_ASSETS: "BROKER_REFERRED_ASSETS",
        ASSETHISTORYDETAILS: 'ASSETHISTORYDETAILS',
    },
    BROKER: {
        CHATS: "CHATS",
        CHATSCREEN: "CHATSCREEN",
        SELECTIONOFUSER: "SELECTIONOFUSER",
    },
} as const;

export type OnboardingStackParamList = {
    LOGIN: undefined;
    CREATEYOURACCOUNT: undefined;
    SELECTACCOUNTTYPE: { selectedType: UserType };
    SIGNUP: undefined;
    CREATEPASSWORD: formSignupState;
    DUALOTPVERIFICATION: formSignupState | CreatePasswordState;
    FORGOTPASSWORD: undefined;
    RESETPASSWORD: { userEmail: string, mobile: string, type: "email" | "phone" };
    SHOWSELECTEDPROFILE: { selectedType: UserType | null };
    ONBOARDINGSCREEN: undefined;
    HOME: { screen?: keyof HomeTabsParamList, params?: any } | undefined;
    BROKER_REFERRED_ASSETS: { type?: string } | undefined;
    NOTIFICATION: undefined;
    SUCCESS: {
        title?: string;
        mainText?: string;
        subText?: string;
        onForward?: () => void;
    };
    SUBMITTED: undefined;
    PERSONALINFORMATION: undefined;
    DOCUMENTS: undefined;
    BANKDETAILS: undefined;
    PREVIEWDOCUMENT: {
        title: string;
        imageUrl: string;
    };
    TRANSACTIONHISTORY: undefined;
    ADDMONEY: { requiredAmount?: number, onAction?: () => void; } | undefined;
    WITHDRAWMONEY: undefined;
    DETAILS: { propertyId: number };
    BUYFRACTION: { propertyId: number };
    SAVEDASSET: undefined;
    ONBOARDEDINSIGHTSHISTORY: { propertyId: number };
    COMPANYKYB: undefined;
    DIRECTORSKYCSTEPS: undefined;
    MASTERRWA: undefined;
    INVESTORDETAILS: { leadId: string, investorId: string };
    PROPERTYSTATUS: { data: any };
    COMMISSIONRECEIPT: { data: any };
    BROKERPERSONALINFORMATION: undefined;
    ROLEASASSETOWNER: undefined;
    REFERRALDETAILS: { data: any };
    CHATS: undefined;
    CHATSCREEN: { user: any };
    SELECTIONOFUSER: undefined;
    REALWORLDHISTORY: undefined;
    ASSETHISTORYDETAILS: {
        propertyId: number,
        fromBrokerReferred?: boolean;
        tab?: string;
    };
    VENDORLIST: undefined;
};

export type NavigationProp = NativeStackNavigationProp<
    OnboardingStackParamList
>;

export default Routes;
