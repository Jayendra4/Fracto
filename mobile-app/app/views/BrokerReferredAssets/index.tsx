import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import AnimatedTabBar from "../../components/AnimatedTabBar";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Table from "../../components/Table";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createBrokerReferredStyles } from "./BrokerReferredAssets.style";
import { useBrokerReferredAssets } from "../../services/auth.service";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useNavigation } from "@react-navigation/native";

const tabs = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

const BrokerReferredAssets = () => {
    const { colors } = useTheme();
    const styles = createBrokerReferredStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState("pending");
    const [listData, setListData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const LIMIT = 10;
    const { data } = useBrokerReferredAssets(activeTab, page, LIMIT);

    const handleLoadMore = () => {
        if (loadingMore) return;

        if (data?.data?.length === LIMIT) {
            setLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (data?.data) {
            setListData(prev =>
                page === 1 ? data.data : [...prev, ...data.data]
            );
            setLoadingMore(false);
        }
    }, [data]);

    useEffect(() => {
        setPage(1);
        setListData([]);
    }, [activeTab]);

    const wayToAssetDetails = useCallback((propertyId: number) => {
        navigation.navigate(Routes.DASHBOARD.ASSETHISTORYDETAILS, {
            propertyId,
            fromBrokerReferred: true,
            tab: activeTab,
        })
    }, [navigation, activeTab]);

    const getStatusStyle = (value: string) => {
        switch (value) {
            case "pending":
                return {
                    container: styles.draftContainer,
                    text: styles.draftText,
                };

            case "approved":
                return {
                    container: styles.approvedContainer,
                    text: styles.approvedText,
                };

            case "rejected":
                return {
                    container: styles.rejectedContainer,
                    text: styles.rejectedText,
                };

            default:
                return {
                    container: styles.defaultContainer,
                    text: styles.defaultText,
                };
        }
    };

    const columns = [
        { key: "title", title: "Asset Title", width: 200 },
        { key: "type", title: "Type", width: 150 },
        { key: "location", title: "Location", width: 150 },
        { key: "broker", title: "Broker", width: 200 },
        { key: "commission", title: "Commission", width: 150 },

        {
            key: "status",
            title: "Your Status",
            width: 150,
            render: (value: string) => {
                const { container, text } = getStatusStyle(value);

                return (
                    <View style={[styles.statusBadge, container]}>
                        <Text style={[styles.statusText, text]}>
                            {value?.toUpperCase()}
                        </Text>
                    </View>
                );
            },
        },

        {
            key: "action",
            title: "Action",
            width: 150,
            render: (_: any, row: any) => (
                <Pressable
                    style={styles.action}
                    onPress={() => wayToAssetDetails(row?.id)}
                >
                    <Text style={styles.detailsText}>Details</Text>
                    <Ionicons
                        name="chevron-forward"
                        color={styles.detailsText.color}
                        size={14}
                    />
                </Pressable>
            ),
        },
    ];

    const tableData = useMemo(() => {
        if (!data?.data) return [];

        return data.data.map((item: any) => ({
            id: item?.id,
            title: item?.asset?.assetTitle,
            type: item?.asset?.assetType,
            owner: `${item?.assetOwnerDetails?.firstName || ""} ${item?.assetOwnerDetails?.lastName || ""}`,
            location: item?.propertyDetails?.city,
            broker: `${item?.brokerEmail || ""}`,
            commission: `${item?.proposedCommissionPct}%`,
            status: item?.adminStatus?.toLowerCase(),
            action: "Details",
        }));
    }, [data?.data, listData]);

    const filteredData = tableData.filter(
        (item: any) => item.status?.toLowerCase() === activeTab
    );



    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />

                <View style={styles.main}>
                    <View style={styles.divider} />

                    <View style={styles.card}>
                        <Text style={styles.title}>Broker Referred Assets</Text>

                        <Text style={styles.subtitle}>
                            Assets referred to you by brokers — review and take action.
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.animatedTabs}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ borderRadius: 20 }}
                        >
                            <AnimatedTabBar
                                tabs={tabs}
                                activeKey={activeTab}
                                onChange={(key) => setActiveTab(key)}
                                indicatorColor="#2A5A8D"
                                activeTextColor="#FFFFFF"
                                inactiveTextColor={
                                    colors.isLight
                                        ? colors.constant.white
                                        : "#2A5A8D"
                                }
                                labelStyle={{ fontSize: 14 }}
                                containerStyle={{ alignSelf: "flex-start" }}
                                variant="scroll"
                            />
                        </ScrollView>
                    </View>
                    {filteredData?.length > 0 ? (
                        <Table columns={columns} data={filteredData} onEndReached={handleLoadMore} loadingMore={loadingMore} />
                    ) : (
                        <Text style={styles.noHistoryText}>
                            No data found for {tabs.find(tab => tab.key === activeTab)?.label} assets.
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default BrokerReferredAssets;