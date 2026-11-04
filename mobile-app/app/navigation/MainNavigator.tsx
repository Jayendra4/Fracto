import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../views/Login';
import Routes, { OnboardingStackParamList } from '../constant/Routes';
import CreateYourAccount from '../views/CreateYourAccount';
import SelectAccountType from '../views/SelectAccountType';
import SignUp from '../views/SignUp';
import CreatePassword from '../views/CreatePassword';
import DualOtpVerification from '../views/DualOtpVerification';
import HomeTabs from '../components/Navigation/TabBar/HomeTabs';
import Notification from '../views/Notification';
import PersonalInformation from '../views/PersonalInformation';
import Documents from '../views/Documents';
import KycSubmitted from '../components/Banners/KycSubmitted';
import AddMoneyToWallet from '../views/AddMoneyToWallet';
import WithdrawMoney from '../views/WithdrawMoney';
import TransactionHistory from '../views/TransactionHistory';
import PreviewDocument from '../views/PreviewDocument';
import PropertyDetails from '../views/PropertyDetails';
import Success from '../components/Banners/Success';
import ForgotPassword from '../views/ForgotPassword';
import ResetPassword from '../views/ResetPassword';
import CompanyKYB from '../views/CompanyKYB';
import DirectorsKYCSteps from '../views/DirectorsKYCSteps';
import MasterRWA from '../views/MasterRWA';
import ShowSelectedProfile from '../views/ShowSelectedProfile';
import InvestorDetails from '../views/InvestorDetails';
import PropertyStatus from '../views/PropertyStatus';
import BrokerProfileInformation from '../views/BrokerProfileInformation';
import SelectRoleAsAssetOwner from '../views/SelectRoleAsAssetOwner';
import ReferralDetails from '../views/ReferralDetails';
import CommissionReceipt from '../views/CommissionReceipt';
import Chats from '../views/Chats';
import BuyFraction from '../views/BuyFraction';
import ChatScreen from '../views/ChatScreen';
import OnboardingScreen from '../views/OnboardingScreen';
import SelectionOfUser from '../views/SelectionOfUser';
import BankDetails from '../views/BankDetails';
import SavedAsset from '../views/SavedAsset';
import OnboardedInsightsHistory from '../views/OnboardedInsightsHistory';
import RealAssetHistory from '../views/RealAssetHistory';
import AssetHistoryDetails from '../views/AssetHistoryDetails';
import VendorList from '../views/VendorList';
import BrokerReferredAssets from '../views/BrokerReferredAssets';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const MainNavigator = ({ initialRoute }: { initialRoute?: keyof OnboardingStackParamList }) => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                    headerShown: false,
                    animation: 'fade'
                }}
            >
                <Stack.Screen
                    name={Routes.ONBOARDING.ONBOARDINGSCREEN}
                    component={OnboardingScreen}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.LOGIN}
                    component={LoginScreen}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.FORGOTPASSWORD}
                    component={ForgotPassword}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.RESETPASSWORD}
                    component={ResetPassword}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.CREATEYOURACCOUNT}
                    component={CreateYourAccount}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.SHOWSELECTEDPROFILE}
                    component={ShowSelectedProfile}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.SELECTACCOUNTTYPE}
                    component={SelectAccountType}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.SIGNUP}
                    component={SignUp}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.CREATEPASSWORD}
                    component={CreatePassword}
                />
                <Stack.Screen
                    name={Routes.ONBOARDING.DUALOTPVERIFICATION}
                    component={DualOtpVerification}
                />
                <Stack.Screen
                    name={Routes.TABS.HOME}
                    component={HomeTabs}
                />
                <Stack.Screen
                    name={Routes.PROPERTY.NOTIFICATION}
                    component={Notification}
                />
                <Stack.Screen
                    name={Routes.BANNER.SUCCESS}
                    component={Success}
                />
                <Stack.Screen
                    name={Routes.BANNER.SUBMITTED}
                    component={KycSubmitted}
                />
                <Stack.Screen
                    name={Routes.PROFILE.PERSONALINFORMATION}
                    component={PersonalInformation}
                />
                <Stack.Screen
                    name={Routes.PROFILE.DOCUMENTS}
                    component={Documents}
                />
                <Stack.Screen
                    name={Routes.PROFILE.BANKDETAILS}
                    component={BankDetails}
                />
                <Stack.Screen
                    name={Routes.PROFILE.PREVIEWDOCUMENT}
                    component={PreviewDocument}
                />
                <Stack.Screen
                    name={Routes.FUNDS.ADDMONEY}
                    component={AddMoneyToWallet}
                />
                <Stack.Screen
                    name={Routes.FUNDS.WITHDRAWMONEY}
                    component={WithdrawMoney}
                />
                <Stack.Screen
                    name={Routes.PROFILE.TRANSACTIONHISTORY}
                    component={TransactionHistory}
                />
                <Stack.Screen
                    name={Routes.PROPERTY.DETAILS}
                    component={PropertyDetails}
                />
                <Stack.Screen
                    name={Routes.PROPERTY.BUYFRACTION}
                    component={BuyFraction}
                />
                <Stack.Screen
                    name={Routes.ONBOARDINGTAB.COMPANYKYB}
                    component={CompanyKYB}
                />
                <Stack.Screen
                    name={Routes.ONBOARDINGTAB.DIRECTORSKYCSTEPS}
                    component={DirectorsKYCSteps}
                />
                <Stack.Screen
                    name={Routes.ONBOARDINGTAB.MASTERRWA}
                    component={MasterRWA}
                />
                <Stack.Screen
                    name={Routes.DASHBOARD.INVESTORDETAILS}
                    component={InvestorDetails}
                />
                <Stack.Screen
                    name={Routes.DASHBOARD.PROPERTYSTATUS}
                    component={PropertyStatus}
                />
                <Stack.Screen
                    name={Routes.DASHBOARD.COMMISSIONRECEIPT}
                    component={CommissionReceipt}
                />
                <Stack.Screen
                    name={Routes.PROFILE.BROKERPERSONALINFORMATION}
                    component={BrokerProfileInformation}
                />
                <Stack.Screen
                    name={Routes.ONBOARDINGTAB.ROLEASASSETOWNER}
                    component={SelectRoleAsAssetOwner}
                />
                <Stack.Screen
                    name={Routes.DASHBOARD.REFERRALDETAILS}
                    component={ReferralDetails}
                />
                <Stack.Screen
                    name={Routes.BROKER.CHATS}
                    component={Chats}
                />
                <Stack.Screen
                    name={Routes.BROKER.CHATSCREEN}
                    component={ChatScreen}
                />
                <Stack.Screen
                    name={Routes.BROKER.SELECTIONOFUSER}
                    component={SelectionOfUser}
                />
                <Stack.Screen
                    name={Routes.PROPERTY.SAVEDASSET}
                    component={SavedAsset}
                />
                <Stack.Screen
                    name={Routes.PROPERTY.ONBOARDEDINSIGHTSHISTORY}
                    component={OnboardedInsightsHistory}
                />
                <Stack.Screen
                    name={Routes.DASHBOARD.REALWORLDHISTORY}
                    component={RealAssetHistory}
                />
                <Stack.Screen
                    name={Routes.DASHBOARD.BROKER_REFERRED_ASSETS}
                    component={BrokerReferredAssets}
                />
                <Stack.Screen
                    name={Routes.DASHBOARD.ASSETHISTORYDETAILS}
                    component={AssetHistoryDetails}
                />
                <Stack.Screen
                    name={Routes.ONBOARDINGTAB.VENDORLIST}
                    component={VendorList}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default MainNavigator;
