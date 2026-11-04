import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./Property.style";
import PropertyHeader from "../../components/Property/PropertyHeader";
import VerificationBanner from "../../components/Banners/Verification";
import { useTheme } from "../../util/theme";
import PropertyListing from "../../components/Property/PropertyListing";
import { useCallback, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { KycStatusType } from "../../components/Navigation/TabBar/TabBar.types";
import { AccountType } from "../../store/authSlice.types";

const Property = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const kycIsApproved = userDetails?.kycStatus === KycStatusType.Approved;

    const completeVerification = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: userDetails?.type === AccountType.Company ?
                Routes.TABS.ONBOARDING : Routes.TABS.KYC,
        });
    }, [navigation, userDetails]);

    const selectRole = useCallback(() => {
        navigation.navigate(Routes.ONBOARDINGTAB.ROLEASASSETOWNER);
    }, [navigation]);

    useEffect(() => {
        if (userDetails?.type === AccountType.Business) {
            selectRole();
        }
    }, [userDetails, selectRole]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                {!kycIsApproved && (
                    <VerificationBanner action={completeVerification} />
                )}
                <PropertyListing />
            </View>
        </SafeAreaView>
    )
};

export default Property;