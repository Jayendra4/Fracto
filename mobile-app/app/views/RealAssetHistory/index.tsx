import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./RealAssetHistory.style";
import AnimatedTabBar from "../../components/AnimatedTabBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OnboardedTypeStatus, useOnboardedAssetApi } from "../../services/auth.service";
import Table from "../../components/Table";
import { capitalizeWords } from "../../util/helper";
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";

const tabs = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "available", label: "Available" },
    { key: "funded", label: "Funded" },
    { key: "exited", label: "Exited" },
];

const RealAssetHistory = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState("all");
    const [page, setPage] = useState(1);
    const [assetList, setAssetList] = useState<any[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const LIMIT = 10;
    const { data } = useOnboardedAssetApi({
        ...(activeTab !== 'all' && { assetStatus: capitalizeWords(activeTab) as OnboardedTypeStatus }),
        skip: (page - 1) * LIMIT,
        take: LIMIT,
    })

    const handleLoadMore = () => {
        if (loadingMore) return;

        if (data?.data?.length < LIMIT) return;

        setLoadingMore(true);
        setPage(prev => prev + 1);
    };

    useEffect(() => {
        if (!data?.data) return;

        setAssetList(prev => {
            if (page === 1) return data.data;

            const merged = [...prev, ...data.data];

            const unique = Array.from(
                new Map(merged.map(item => [item.id, item])).values()
            );

            return unique;
        });

        setLoadingMore(false);
    }, [data, page]);

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    const wayToAssetDetails = useCallback((propertyId: number) => {
        navigation.navigate(Routes.DASHBOARD.ASSETHISTORYDETAILS, {
            propertyId,
        })
    }, [navigation]);

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "draft":
                return {
                    container: styles.draftContainer,
                    text: styles.draftText,
                };
            case "available":
                return {
                    container: styles.availableContainer,
                    text: styles.availableText,
                };
            case "funded":
                return {
                    container: styles.fundedContainer,
                    text: styles.fundedText,
                };
            case "exited":
                return {
                    container: styles.exitedContainer,
                    text: styles.exitedText,
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
        { key: "owner", title: "Owner", width: 200 },
        {
            key: "status",
            title: "Status",
            width: 150,
            render: (value: string) => {
                const style = getStatusStyle(value);

                return (
                    <View style={[styles.statusBadge, style.container]}>
                        <Text style={[styles.statusText, style.text]} numberOfLines={1}>
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
        if (!assetList?.length) return [];

        return assetList.map((item: any) => ({
            id: item?.id,
            title: item?.assetTitle,
            type: item?.assetType,
            owner: item?.currentOwnerName,
            status: item?.status,
            action: "Details",
        }));
    }, [assetList]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />

                <View style={styles.main}>
                    <View style={styles.divider} />

                    <View style={styles.card}>
                        <Text style={styles.title}>History</Text>

                        <Text style={styles.subtitle}>
                            Manage and view your previously submitted Real World assets
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
                                inactiveTextColor={colors.isLight ? colors.constant.white : "#2A5A8D"}
                                labelStyle={{ fontSize: 14 }}
                                containerStyle={{ alignSelf: "flex-start" }}
                                variant="scroll"
                            />
                        </ScrollView>
                    </View>

                    {tableData?.length > 0 ? (
                        <Table
                            columns={columns}
                            data={tableData}
                            onEndReached={handleLoadMore}
                            loadingMore={loadingMore}
                        />
                    ) : (
                        <Text style={styles.noHistoryText}>
                            History not found.
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default RealAssetHistory;