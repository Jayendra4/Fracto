import { View, ScrollView, Text, Pressable } from "react-native";
import { useTheme } from "../../util/theme";
import { createStyles } from "./Dashboard.style";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { KycStatusType } from "../../components/Navigation/TabBar/TabBar.types";
import VerificationBanner from "../../components/Banners/Verification";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import PortfolioGraph from "../../components/PortfolioGraph";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from "react-native-vector-icons/FontAwesome6";
import DashboardIncomeList from "../../components/DashboardIncomeList";
import { Dropdown } from "../../components/AssetFilterBar";

const TotalPortfolioCard = ({ colors, styles }: any) => (
    <LinearGradient
        colors={["#14406E", "#002A57"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.totalCard}
    >
        <View style={{ flexShrink: 1 }}>
            <Text style={styles.totalTitle}>Total Portfolio Value</Text>
            <Text style={styles.totalValue} numberOfLines={1}>
                ₹ 238845.09
            </Text>
        </View>

        <View style={styles.growthBadge}>
            <Text style={styles.growthText}>+15%</Text>
            <Ionicons name="trending-up" size={12} color={colors.icon.green} />
        </View>
    </LinearGradient>
);

const StatCard = ({
    label,
    title,
    value,
    positive,
    styles,
    colors,
    action,
}: any) => (
    <View style={styles.statCard}>
        <Pressable style={styles.statFilterWrapper} onPress={action}>
            <Text style={styles.statLabel}>{label}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.text.lightGrey} />
        </Pressable>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue} numberOfLines={1}>
            {value}
        </Text>

        <View
            style={[
                styles.growthBadge,
                positive ? styles.positiveBadge : styles.negativeBadge,
            ]}
        >
            <Text
                style={[
                    styles.growthText,
                    !positive && styles.negativeText,
                ]}
            >
                +15%
            </Text>
            <Ionicons
                name={positive ? 'trending-up' : 'trending-down'}
                size={12}
                color={positive ? colors.icon.green : colors.icon.danger}
            />
        </View>
    </View>
);

const NoticeSection = ({ styles, colors }: any) => (
    <View style={styles.noticeWrapper}>
        <View style={styles.noticeHeader}>
            <View style={styles.noticeRow}>
                <Text style={styles.noticeTitle}>Notice</Text>
                <MaterialIcons
                    name="info-outline"
                    size={16}
                    color={colors.icon.primary}
                />
            </View>

            <View style={styles.filterWrapper}>
                <FontAwesome
                    name="sliders"
                    size={12}
                    color={colors.text.default}
                    style={styles.sliderRotate}
                />
                <Text style={styles.filterText}>Filter</Text>
            </View>
        </View>

        <View style={styles.noticeContent}>
            <Text style={styles.emptyNotice}>No Notice Found</Text>
        </View>
    </View>
);

const statFilter = ["Past 24 Hours", "Past 7 Days", "Past 30 Days"]

export const InvestorDashboard = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [asset, setAsset] = useState("Past 24 Hours");
    const [pnl, setPnl] = useState("Past 24 Hours");
    const [assetFilter, setAssetFilter] = useState(false);
    const [pnlFilter, setPnlFilter] = useState(false);

    return (
        <View style={styles.statWrapper}>
            <TotalPortfolioCard styles={styles} colors={colors} />

            <View style={styles.row}>
                <StatCard
                    label={asset}
                    title="Asset Appreciation"
                    value="₹ 12,50012.09"
                    positive
                    styles={styles}
                    colors={colors}
                    action={() => setAssetFilter(true)}
                />

                <StatCard
                    label={pnl}
                    title="Realized Profit/Loss"
                    value="₹ 4,56,999.00"
                    positive={false}
                    styles={styles}
                    colors={colors}
                    action={() => setPnlFilter(true)}
                />
            </View>

            <PortfolioGraph />

            <DashboardIncomeList />

            <NoticeSection styles={styles} colors={colors} />

            {assetFilter && (
                <Dropdown
                    data={statFilter}
                    onSelect={setAsset}
                    onClose={() => setAssetFilter(false)}
                />
            )}

            {pnlFilter && (
                <Dropdown
                    data={statFilter}
                    onSelect={setPnl}
                    onClose={() => setPnlFilter(false)}
                />
            )}
        </View>
    )
}

const Dashboard = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const navigation = useNavigation<NavigationProp>();

    const userDetails = useSelector((state: RootState) => state.auth.user);
    const kycIsApproved = userDetails?.kycStatus === KycStatusType.Approved;

    const completeVerification = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.KYC,
        });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {!kycIsApproved && (
                        <VerificationBanner action={completeVerification} />
                    )}
                    <InvestorDashboard />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Dashboard;
