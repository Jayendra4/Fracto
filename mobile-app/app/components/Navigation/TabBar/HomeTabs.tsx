import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import Routes from "../../../constant/Routes";
import { KycStatusType, TabBarIconKey } from "./TabBar.types";
import TabBar from "./TabBar";
import Property from "../../../tabs/Property";
import Dashboard from "../../../tabs/Dashboard";
import Kyc from "../../../tabs/Kyc";
import Profile from "../../../tabs/Profile";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import KycSubmitted from "../../Banners/KycSubmitted";
import Funds from "../../../tabs/Funds";
import Asset from "../../../tabs/Asset";
import BusinessDashboard from "../../../views/BusinessDashboard";
import { AccountType } from "../../../store/authSlice.types";
import BrokerDashboard from "../../../views/BrokerDashboard";
import Onboarding from "../../../tabs/Onboarding";

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const [isKeyboardHidden, setIsKeyboardHidden] = useState(true);
    const kycIsSubmitted = userDetails?.kycStatus === KycStatusType.Submitted;
    const kycIsApproved = userDetails?.kycStatus === KycStatusType.Approved;

    const getOptions = useCallback((key: TabBarIconKey) => ({
        tabBarLabel: key,
        tabBarIconKey: key,
    }), []);

    const isCompany = userDetails?.type === AccountType.Company;
    const showKycTab = !kycIsApproved;

    const kycComponent = kycIsSubmitted ? KycSubmitted : (isCompany ? Onboarding : Kyc);
    const kycRouteName = isCompany ? Routes.TABS.ONBOARDING : Routes.TABS.KYC;
    const kycOptions = useMemo(() => {
        return isCompany
            ? getOptions(TabBarIconKey.Onboarding)
            : getOptions(TabBarIconKey.Kyc);
    }, [isCompany, getOptions]);

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const show = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardHidden(false));
        const hide = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardHidden(true));

        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    const renderTabBar = useCallback((props: BottomTabBarProps) => {
        if (!isKeyboardHidden) return null;

        return <TabBar {...props} />;
    }, [isKeyboardHidden]);

    const dashboardComponent = useMemo(() => {
        switch (userDetails?.type) {
            case AccountType.CorporateInvestor:
                return Dashboard;
            case AccountType.AssetOwner:
            case AccountType.Company:
                return BusinessDashboard;
            case AccountType.Broker:
                return BrokerDashboard;
            default:
                return Dashboard;
        }
    }, [userDetails?.type]);

    return (
        <Tab.Navigator
            initialRouteName={Routes.TABS.PROPERTY}
            tabBar={renderTabBar}
            screenOptions={{
                headerShown: false,
                animation: 'none',
            }}
            backBehavior="history"
        >
            <Tab.Screen
                name={Routes.TABS.DASHBOARD}
                options={getOptions(TabBarIconKey.Dashboard)}
                component={dashboardComponent}
            />
            <Tab.Screen
                name={Routes.TABS.PROPERTY}
                options={getOptions(TabBarIconKey.Property)}
                component={Property}
            />
            {showKycTab && (
                <Tab.Screen
                    name={kycRouteName}
                    options={kycOptions}
                    component={kycComponent}
                />
            )}
            {kycIsApproved && (
                <>
                    <Tab.Screen
                        name={Routes.TABS.FUNDS}
                        options={getOptions(TabBarIconKey.Funds)}
                        component={Funds}
                    />
                    <Tab.Screen
                        name={Routes.TABS.ASSET}
                        options={getOptions(TabBarIconKey.Asset)}
                        component={Asset}
                    />
                </>
            )}
            <Tab.Screen
                name={Routes.TABS.PROFILE}
                options={getOptions(TabBarIconKey.Profile)}
                component={Profile}
            />
        </Tab.Navigator>
    );
};

export default HomeTabs;