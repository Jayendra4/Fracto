import { Pressable, ScrollView, Text, View } from "react-native";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./BrokerDashboard.style";
import { useTheme } from "../../util/theme";
import { useCallback, useEffect, useState } from "react";
import Overview from "../../components/BrokerDashboardTabs/Overview";
import Leads from "../../components/BrokerDashboardTabs/Leads";
import Commission from "../../components/BrokerDashboardTabs/Commission";
import AssetOnboarding from "../../components/BrokerDashboardTabs/AssetOnboarding";
import Referrals from "../../components/BrokerDashboardTabs/Referrals";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { KycStatusType } from "../../components/Navigation/TabBar/TabBar.types";
import CompleteKYC from "../../components/Modals/CompleteKYC";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import RWATab from "../../components/RWATab";

const tabs = ['Overview', 'Leads', 'Commission', 'RWA', 'Referrals'];

type BrokerDashboardRouteParams = {
    initialTab?: string;
    childTab?: string;
};

const BrokerDashboard = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const route = useRoute<RouteProp<Record<string, BrokerDashboardRouteParams>, string>>();
    const initialTabFromRoute = route.params?.initialTab;
    const childTabFromRoute = route.params?.childTab;
    const [activeTab, setActiveTab] = useState(
        initialTabFromRoute && tabs.includes(initialTabFromRoute)
            ? initialTabFromRoute
            : "Overview"
    );

    useEffect(() => {
        if (initialTabFromRoute) {
            setActiveTab(initialTabFromRoute);
        }
    }, [initialTabFromRoute]);

    const isKycModalActive = activeTab !== "Overview" &&
        userDetails?.kycStatus !== KycStatusType.Approved;

    const goToDashboard = useCallback(() => {
        navigation.replace(Routes.TABS.HOME, {
            screen: Routes.TABS.DASHBOARD,
            params: { initialTab: "Referrals", childTab: "Asset Owner Referrals" },
        })
    }, [navigation]);

    const goToReferral = useCallback(() => {
        navigation.navigate(Routes.BANNER.SUCCESS, {
            title: "Success",
            mainText: "Onboarding Request Submitted",
            subText: "Asset onboarding request has been submitted successfully.",
            onForward: goToDashboard,
        });
    }, [navigation]);

    const renderTab = useCallback(() => {
        switch (activeTab) {
            case "Overview": return <Overview />;
            case "Leads": return <Leads />;
            case "Commission": return <Commission />;
            case "RWA": return (<RWATab />);
            case "Referrals": return <Referrals
                {...(childTabFromRoute ? { childTab: childTabFromRoute } : {})}
            />;
            default: return <Overview />;
        }
    }, [activeTab]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.scrollContainer,
                    {
                        ...(isKycModalActive && { paddingBottom: 0 }),
                        backgroundColor: ['Leads', 'Asset Onboarding'].includes(activeTab)
                            ? colors.background.slightly
                            : colors.background.default,
                    }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.topHeader}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tabsContainer}
                        >
                            {tabs.map(tab => {
                                const isActive = activeTab === tab;
                                return (
                                    <Pressable
                                        key={tab}
                                        onPress={() => setActiveTab(tab)}
                                        style={[
                                            styles.tabPill,
                                            isActive && styles.activeTabPill,
                                        ]}
                                    >
                                        <Text style={styles.tabText}>{tab}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={styles.viewportSlot}>
                        {renderTab()}
                        <CompleteKYC visible={isKycModalActive} />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default BrokerDashboard;