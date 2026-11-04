import { StyleSheet, Text, View } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import DashboardDropdown from "../DashboardDropdown";
import VerificationBanner from "../Banners/Verification";
import { InvestorDashboard } from "../../tabs/Dashboard";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { KycStatusType } from "../Navigation/TabBar/TabBar.types";
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import BrokerActivity from "../BrokerActivity";
import DashboardEarningsVelocity from "../DashboardEarningsVelocity";
import Ionicons from "react-native-vector-icons/Ionicons"
import { useGetBrokerCommissionApi, useGetBrokerDashboardApi } from "../../services/auth.service";

const overview = [
    'Channel Partner View',
    'Investor View',
];

const Overview = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const kycIsApproved = userDetails?.kycStatus === KycStatusType.Approved;
    const [selectedItem, setSelectedItem] = useState('Channel Partner View');
    const { data } = useGetBrokerDashboardApi();
    const { data: commission } = useGetBrokerCommissionApi();

    const completeVerification = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.KYC,
        });
    }, [navigation]);

    return (
        <View style={styles.wrapper}>

            <DashboardDropdown
                data={overview}
                value={selectedItem}
                onChange={setSelectedItem}
                containerStyle={{ marginHorizontal: 16 }}
            />

            {!kycIsApproved && (
                <VerificationBanner action={completeVerification} />
            )}

            {selectedItem === 'Investor View' ? (
                <InvestorDashboard />
            ) : (
                <>
                    <View style={styles.detailContainer}>
                        <View style={styles.detailCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailsCardTitle}>Active Leads</Text>
                                <Text style={styles.cardValue}>
                                    {data?.stats?.activeLeads || 0}
                                </Text>
                            </View>

                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, styles.successBadge]}>
                                    <Text style={[styles.badgeText, styles.successText]}>
                                        +12% this{"\n"} month
                                    </Text>
                                    <Ionicons name="trending-up" size={20} color={colors.icon.green} />
                                </View>
                                <View style={[styles.badge, styles.dangerBadge]}>
                                    <Text style={[styles.badgeText, styles.dangerText]}>
                                        {data?.stats?.totalLeads || 0} pending{"\n"} docs
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.detailCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailsCardTitle}>Asset In Progress</Text>
                                <Text style={styles.cardValue}>
                                    {data?.stats?.assetsInProgress || 0}
                                </Text>
                            </View>

                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, styles.neutralBadge]}>
                                    <Text style={[styles.badgeText, styles.successText]}>
                                        Onboarding
                                    </Text>
                                </View>
                                <View style={[styles.badge, styles.dangerBadge]}>
                                    <Text style={[styles.badgeText, styles.dangerText]}>
                                        2 need{"\n"} disclosure
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <DashboardEarningsVelocity data={data?.earnings} commission={commission} />
                    {/* <NeedsAttention /> */}
                    <BrokerActivity />
                </>
            )}
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    wrapper: {
        flex: 1,
        rowGap: 24,
        paddingTop: 10,
    },
    detailContainer: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    detailCard: {
        backgroundColor: colors.background.slightly,
        minHeight: 115,
        borderRadius: 4,
        width: '48%',
        paddingHorizontal: 10,
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: "#F5F5F533",
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailsCardTitle: {
        color: colors.text.extraLight,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    cardValue: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
    },
    badge: {
        borderRadius: 4,
        flexShrink: 1,
        paddingHorizontal: 4,
        justifyContent: 'center',
    },
    successBadge: {
        backgroundColor: "#33BD5629",
        flexDirection: 'row',
        alignItems: 'center',
    },
    dangerBadge: {
        backgroundColor: "#F03F2329",
    },
    neutralBadge: {
        backgroundColor: "#F5F5F529",
        paddingVertical: 1,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: 'WorkSans-Regular',
    },
    successText: {
        color: colors.text.green,
    },
    dangerText: {
        color: colors.text.danger,
    },
})

export default Overview;