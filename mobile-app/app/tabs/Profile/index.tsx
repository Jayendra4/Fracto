import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { setThemeMode, useTheme } from "../../util/theme";
import { createStyles } from "./Profile.style";
import ProfileVerified from "../../components/Banners/ProfileVerified";
import SettingDrawer from "../../components/SettingDrawer";
import ProfileIcon from "../../assets/icons/profile.svg";
import ProfileLightIcon from "../../assets/icons/profile-light.svg";
import Document from "../../assets/icons/document.svg";
import DocumentLight from "../../assets/icons/document-light.svg";
import History from "../../assets/icons/history.svg";
import HistoryLight from "../../assets/icons/history-light.svg";
import Sun from "../../assets/icons/sun.svg";
import Moon from "../../assets/icons/moon-light.svg";
import Settings from "../../assets/icons/setting.svg";
import SettingsLight from "../../assets/icons/setting-light.svg";
import Logout from "../../assets/icons/logout.svg";
import LogoutLight from "../../assets/icons/logout-light.svg";
import Bank from "../../assets/icons/bank.svg";
import BankLight from "../../assets/icons/bank-light.svg";
import * as Keychain from "react-native-keychain";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useCallback } from "react";
import { clearStorage } from "../../util/helper";
import { RootState } from "../../store";
import { AccountType } from "../../store/authSlice.types";

const Profile = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);

    const handleLogout = useCallback(async () => {
        await Keychain.resetGenericPassword({ service: 'accessToken' });
        dispatch(logout());
        clearStorage();

        navigation.reset({
            index: 0,
            routes: [{ name: Routes.ONBOARDING.LOGIN }],
        });
    }, [navigation, dispatch, logout]);

    const wayToPersonalInformation = useCallback(() => {
        const route = userDetails?.type === AccountType.Broker ?
            Routes.PROFILE.BROKERPERSONALINFORMATION : Routes.PROFILE.PERSONALINFORMATION
        navigation.navigate(route);
    }, [navigation]);

    const wayToDocuments = useCallback(() => {
        navigation.navigate(Routes.PROFILE.DOCUMENTS);
    }, [navigation]);

    const themeSwitch = useCallback(async () => {
        const mode = colors.isLight ? "dark" : "light";
        await setThemeMode(mode);
    }, [colors, setThemeMode]);

    const wayToBankDetails = useCallback(() => {
        navigation.navigate(Routes.PROFILE.BANKDETAILS);
    }, [navigation]);

    const wayToActivityView = useCallback(() => {
        navigation.navigate(Routes.PROFILE.TRANSACTIONHISTORY);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <ProfileVerified />
                <ScrollView
                    contentContainerStyle={styles.drawer}
                    showsVerticalScrollIndicator={false}
                >
                    <SettingDrawer
                        icon={colors.isLight ? ProfileLightIcon : ProfileIcon}
                        title="Personal Information"
                        action={wayToPersonalInformation}
                    />
                    <SettingDrawer
                        icon={colors.isLight ? DocumentLight : Document}
                        title="Document"
                        action={wayToDocuments}
                    />
                    <SettingDrawer
                        icon={colors.isLight ? BankLight : Bank}
                        title="Bank Details"
                        action={wayToBankDetails}
                    />
                    <SettingDrawer
                        icon={colors.isLight ? HistoryLight : History}
                        title="Transaction History"
                        action={wayToActivityView}
                    />
                    <SettingDrawer
                        icon={colors.isLight ? Moon : Sun}
                        title={colors.isLight ? "Switch To Dark Mode" : "Switch To Light Mode"}
                        action={themeSwitch}
                        isSwitch
                    />
                    {/* <SettingDrawer
                        icon={colors.isLight ? SettingsLight : Settings}
                        title="Settings"
                        action={() => { }}
                    /> */}
                    <SettingDrawer
                        icon={colors.isLight ? LogoutLight : Logout}
                        title="Logout"
                        action={handleLogout}
                    />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Profile;