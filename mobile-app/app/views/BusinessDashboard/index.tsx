import { useNavigation } from "@react-navigation/native";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import Routes, { NavigationProp } from "../../constant/Routes";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./BusinessDashboard.style";
import { useTheme } from "../../util/theme";
import LinearGradient from "react-native-linear-gradient";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Timeline from "./Timeline";
import Ionicons from "react-native-vector-icons/Ionicons"
import VerificationBanner from "../../components/Banners/Verification";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { KycStatusType } from "../../components/Navigation/TabBar/TabBar.types";
import DashboardDropdown from "../../components/DashboardDropdown";
import { InvestorDashboard } from "../../tabs/Dashboard";
import RWATab from "../../components/RWATab";

interface AssetCardProps {
    asset: { name: string; finish: string };
    isOpen: boolean;
    toggle: () => void;
}

const assets = [
    { name: "Residential Complex Aurora", finish: "Mar 12, 2025" },
    { name: "J Tower", finish: "Mar 12, 2025" },
];

const overview = [
    'Business View',
    'Investor View',
];

const AssetCard: React.FC<AssetCardProps> = memo(({ asset, isOpen, toggle }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedRotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue: isOpen ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(animatedRotate, {
                toValue: isOpen ? 1 : 0,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isOpen, animatedHeight, animatedRotate]);

    const heightInterpolate = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 320],
    });

    const rotateInterpolate = animatedRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View style={styles.card}>
            <View>
                <Text style={styles.assetNameText}>Asset Name:</Text>
                <View style={styles.dropdownWrapper}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Pressable
                        style={styles.dropdownButton}
                        onPress={toggle}
                    >
                        <Animated.View
                            style={{ transform: [{ rotate: rotateInterpolate }] }}
                        >
                            <Ionicons name="chevron-down" size={24} color={colors.icon.primary} />
                        </Animated.View>
                    </Pressable>
                </View>
                <Text style={styles.assetStatus}>(Liquidation In Progress)</Text>
            </View>

            <Animated.View
                style={{
                    overflow: 'hidden',
                    height: heightInterpolate,
                }}
            >
                <View style={[styles.divider, { marginVertical: 10 }]} />
                <View style={{ marginTop: 6 }}>
                    <Text style={styles.assetNameText}>Asset Status</Text>
                    <View style={styles.liquidatedRow}>
                        <Text style={styles.liquidatedText}>
                            50% Liquidated
                        </Text>
                        <Text style={styles.amount}>$2,500,000 of $5,000,000</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={styles.progressFill} />
                    </View>
                </View>

                <View>
                    <View style={styles.projectionWrapper}>
                        <Text style={styles.assetNameText}>Asset Projection</Text>
                        <Text style={styles.assetName}>
                            Estimated Completion and Value
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Days Remaining</Text>
                            <Text style={styles.statValue}>45</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Total Investors</Text>
                            <Text style={styles.statValue}>27</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Expected Finish</Text>
                            <Text style={styles.statValue}>{asset.finish}</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
});

const BusinessDashboard = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const kycIsApproved = useMemo(
        () => userDetails?.kycStatus === KycStatusType.Approved,
        [userDetails?.kycStatus]
    );
    const [selectedItem, setSelectedItem] = useState('Business View');
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"Overview" | "RWA">("Overview");
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const toggleDropdown = (index: number) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    const completeVerification = useCallback(() => {
        const innerRoute = userDetails?.type === "Company" ?
            Routes.TABS.ONBOARDING :
            Routes.TABS.KYC;
        navigation.navigate(Routes.TABS.HOME, {
            screen: innerRoute,
        });
    }, [navigation, userDetails]);

    const handleDropdownChange = (value: string) => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();

        setSelectedItem(value);
    };

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.topHeader}>
                        <Pressable style={[
                            styles.masterPill,
                            activeTab === "Overview" && styles.overviewPill
                        ]}
                            onPress={() => setActiveTab("Overview")}
                        >
                            <Text style={[
                                styles.headerTitle,
                                activeTab === 'Overview' && styles.activeTabTitle,
                            ]}>
                                Overview
                            </Text>
                        </Pressable>

                        <Pressable style={[
                            styles.masterPill,
                            activeTab === "RWA" && styles.overviewPill
                        ]}
                            onPress={() => setActiveTab("RWA")}
                        >
                            <Text style={[
                                styles.headerTitle,
                                activeTab === 'RWA' && styles.activeTabTitle,
                            ]}>
                                Master RWA Form
                            </Text>
                        </Pressable>
                    </View>

                    {activeTab === 'Overview' && (
                        <>
                            <View style={{ marginHorizontal: 16 }}>
                                <DashboardDropdown
                                    data={overview}
                                    value={selectedItem}
                                    onChange={handleDropdownChange}
                                />
                            </View>

                            {!kycIsApproved && (
                                <VerificationBanner action={completeVerification} />
                            )}

                            <Animated.View style={{ opacity: fadeAnim }}>
                                {selectedItem === 'Investor View' ? (
                                    <InvestorDashboard />
                                ) : (
                                    <View style={{ gap: 12 }}>
                                        <View style={styles.summaryRow}>
                                            <LinearGradient
                                                colors={['#14406E', '#002A57']}
                                                start={{ x: 1, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                                style={[styles.summaryCard, {
                                                    borderWidth: colors.isLight ? 0 : 1,
                                                }]}
                                            >
                                                <View style={styles.titleRow}>
                                                    <Text style={[styles.summaryTitle, styles.constantWhite]}>
                                                        Total Assets
                                                    </Text>
                                                    <Text style={[styles.summaryValue, styles.constantWhite]}>
                                                        03
                                                    </Text>
                                                </View>
                                                <Text style={styles.summarySub}>
                                                    2 Open For Investment  |  1 Fully Liquidated
                                                </Text>
                                            </LinearGradient>

                                            <View style={styles.summaryCard}>
                                                <View style={styles.titleRow}>
                                                    <Text style={styles.summaryTitle}>Total Volume</Text>
                                                    <Text style={styles.summaryValue}>₹ 12.5 Cr</Text>
                                                </View>
                                                <Text style={[styles.summarySub, styles.lightGray]}>
                                                    2 Open For Investment  |  1 Fully Liquidated
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.card}>
                                            <Text style={styles.cardTitle}>Process Timeline</Text>
                                            <Text style={styles.cardSubtitle}>
                                                Asset Liquidation Workflow Stages
                                            </Text>
                                            <View style={styles.divider} />
                                            <Timeline activeStep={3} />
                                        </View>

                                        {assets.map((asset, index) => (
                                            <AssetCard
                                                key={index}
                                                asset={asset}
                                                isOpen={openIndex === index}
                                                toggle={() => toggleDropdown(index)}
                                            />
                                        ))}
                                    </View>
                                )}
                            </Animated.View>
                        </>
                    )}

                    {activeTab === "RWA" && (
                        <RWATab />
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default BusinessDashboard;