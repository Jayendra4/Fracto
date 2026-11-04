import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useCallback, useEffect, useState } from "react";
import WithdrawRequest from "../Modals/WithdrawRequest";
import { useGetBrokerCommissionHistoryApi, useGetCommissionSummaryApi, useUserWalletApi } from "../../services/auth.service";
import { formatAmountWithCommas } from "../../util/helper";
import { useBrokerCommissionPayoutApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import { Dropdown } from "../AssetFilterBar";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import SkeletonClassic from "../../util/SkeletonClassic";
import moment from "moment";

const commissionFilter = ['All-time', 'Today', 'This Week', 'This Month'];
const historyFilter = [
    { label: 'Investor', value: 'InvestorSignup' },
    { label: 'Asset Owner', value: 'AssetOwnerSignup' }
];

const getDateRange = (filter: string) => {
    switch (filter) {
        case "Today":
            return {
                fromDate: moment().format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
            };

        case "This Week":
            return {
                fromDate: moment().startOf("week").format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
            };

        case "This Month":
            return {
                fromDate: moment().startOf("month").format("YYYY-MM-DD"),
                toDate: moment().format("YYYY-MM-DD"),
            };

        default:
            return {
                fromDate: undefined,
                toDate: undefined,
            };
    }
};

const Commission = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const { data: wallet } = useUserWalletApi();
    const { mutateAsync, isPending, error } = useBrokerCommissionPayoutApi();

    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;
    const [allHistory, setAllHistory] = useState<any[]>([]);
    const [historyFilterType, setHistoryFilterType] = useState(historyFilter[0]);
    const {
        data: commissionHistory,
        isLoading: historyLoading,
    } = useGetBrokerCommissionHistoryApi({
        brokerId: String(userDetails?.id),
        skip,
        take: LIMIT,
        type: historyFilterType.value,
    });

    const [filter, setFilter] = useState(commissionFilter[0]);
    const { fromDate, toDate } = getDateRange(filter);
    const { data, refetch } = useGetCommissionSummaryApi({
        fromDate,
        toDate,
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [ishistoryFilterOpen, setIsHistoryFilterOpen] = useState(false);
    const haveAmountHold = data?.holdAmount > 0;

    useEffect(() => {
        if (!commissionHistory?.data) return;

        setAllHistory(prev =>
            page === 1
                ? commissionHistory?.data
                : [...prev, ...commissionHistory?.data]
        );
    }, [commissionHistory]);

    const handleLoadMore = () => {
        if (!historyLoading && commissionHistory?.data?.length === LIMIT) {
            setPage(prev => prev + 1);
        }
    };

    const submitPayoutRequest = useCallback(async (amount: string) => {
        try {
            await mutateAsync({ amount });
            refetch();
            setShowWithdrawModal(false);
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || error?.message || 'Invalid Request',
            });
        }
    }, [mutateAsync, refetch, error]);

    const showPropertyStatus = useCallback((item: any) => {
        const route = item?.referralUsesType === 'InvestorSignup'
            ? Routes.DASHBOARD.COMMISSIONRECEIPT
            : Routes.DASHBOARD.PROPERTYSTATUS;
        navigation.navigate(route, {
            data: item,
        });
    }, [navigation]);

    const renderStatus = (status: string) => {
        switch (status) {
            case "Confirmed": return "Released";
            case "Hold": return "On Hold";
            default: return "Pending";
        }
    };

    const renderItem = (item: any) => {
        const getStatusStyles = (status: string) => {
            switch (status) {
                case 'Confirmed':
                    return {
                        background: styles.released,
                        text: styles.releasedText,
                        dot: styles.releasedDot,
                    };
                case 'Hold':
                    return {
                        background: styles.onHold,
                        text: styles.onHoldText,
                        dot: styles.onHoldDot,
                    };
                default:
                    return {
                        background: styles.pending,
                        text: styles.pendingText,
                        dot: styles.pendingDot,
                    };
            }
        };

        const statusStyles = getStatusStyles(item.status);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.row}>
                        <Text style={styles.projectId}>ID: {item.commissionId}</Text>
                        <View style={[styles.statusBadge, statusStyles.background]}>
                            <View style={[styles.statusDot, statusStyles.dot]} />
                            <Text style={[styles.statusText, statusStyles.text]}>
                                {renderStatus(item.status)}
                            </Text>
                        </View>
                    </View>

                    <View>
                        <Text style={styles.projectTitle}>{item?.asset?.title}</Text>
                        <Text style={styles.owner}>{item?.investor?.name}</Text>
                    </View>

                    <ButtonPrimary
                        title={item?.referralUsesType === 'InvestorSignup'
                            ? ButtonTextTypes.View_Receipt : ButtonTextTypes.View_Status}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        buttonStyle={styles.button}
                        textStyle={styles.buttonText}
                        onPress={() => showPropertyStatus(item)}
                    />
                </View>
            </View>
        );
    };

    return (
        <>
            <View style={styles.mainWrapper}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.title}>Commission</Text>
                    <Text style={styles.subTitle}>
                        Commissions are released only after All investor + asset documents are approved. This ensures compliance and protects all parties involved.
                    </Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    <View style={styles.earnCard}>
                        <View style={styles.cardTitleWrapper}>
                            <View style={styles.cardTitleIcon}>
                                <Ionicons name="wallet-outline" size={12} color={colors.icon.primary} />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Total Earned</Text>
                            </View>
                            <Pressable
                                style={styles.dropdownTrigger}
                                onPress={() => setIsFilterOpen(true)}
                            >
                                <Text style={styles.filterText}>{filter}</Text>
                                <Feather name="chevron-down" size={16} color={colors.text.default} />
                            </Pressable>
                        </View>
                        <Text style={styles.amount}>
                            ₹{formatAmountWithCommas(data?.availableToWithdraw)}
                        </Text>

                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>+12% this month</Text>
                            <Ionicons name="trending-up" size={18} color={colors.icon.green} />
                        </View>
                        <ButtonPrimary
                            title={ButtonTextTypes.Withdraw_Fund}
                            width={ButtonWidthTypes.Full}
                            align={ButtonAlignTypes.Center}
                            buttonStyle={styles.withdrawButtonStyle}
                            textStyle={styles.withdrawTextStyle}
                            onPress={() => setShowWithdrawModal(true)}
                        />
                    </View>

                    <View style={styles.earnCard}>
                        <View style={styles.cardTitleWrapper}>
                            <View style={styles.cardTitleIcon}>
                                <Feather name="check-circle" size={12} color={colors.icon.primary} />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Estimated (potential)</Text>
                                <Text style={styles.cardSubTitle}>(Available in Wallet)</Text>
                            </View>
                        </View>
                        <Text style={styles.amount}>
                            ₹{formatAmountWithCommas(data?.estimatedAmount)}
                        </Text>
                    </View>

                    <View style={styles.earnCard}>
                        <View style={styles.cardTitleWrapper}>
                            <View style={styles.cardTitleIcon}>
                                <Feather name="check-circle" size={12} color={colors.icon.primary} />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Released</Text>
                                <Text style={styles.cardSubTitle}>(Available in Wallet)</Text>
                            </View>
                        </View>
                        <Text style={styles.amount}>
                            ₹{formatAmountWithCommas(data?.releasedAmount)}
                        </Text>
                    </View>

                    <View style={styles.earnCard}>
                        <View style={styles.cardTitleWrapper}>
                            <View style={styles.cardTitleIcon}>
                                <MaterialIcons name="access-time" size={12} color={colors.icon.primary} />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Pending</Text>
                                <Text style={styles.cardSubTitle}>(Processing)</Text>
                            </View>
                        </View>
                        <Text style={styles.amount}>
                            ₹{formatAmountWithCommas(data?.pendingWithdraw)}
                        </Text>
                    </View>

                    <View style={[styles.earnCard, haveAmountHold && styles.holdCard]}>
                        <View style={styles.cardTitleWrapper}>
                            <View style={styles.cardTitleIcon}>
                                <Feather name="lock" size={12} color={colors.icon.primary} />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>On Hold</Text>
                                <Text style={styles.cardSubTitle}>(Action Required)</Text>
                            </View>
                        </View>
                        <Text style={styles.amount}>
                            ₹{formatAmountWithCommas(data?.holdAmount)}
                        </Text>
                        {haveAmountHold && (
                            <Pressable style={styles.checkWrapper}>
                                <Text style={styles.checkText}>Check</Text>
                            </Pressable>
                        )}
                    </View>
                </ScrollView>

                <View style={styles.historyWrapper}>
                    <View style={styles.divider} />

                    <Pressable
                        style={styles.historyDropdownTrigger}
                        onPress={() => setIsHistoryFilterOpen(true)}
                    >
                        <Text style={styles.filterText}>{historyFilterType.label}</Text>
                        <Feather name="chevron-down" size={16} color={colors.text.default} />
                    </Pressable>

                    <FlatList
                        data={allHistory || []}
                        keyExtractor={(item) => item?.commissionId?.toString()}
                        renderItem={({ item }) => renderItem(item)}
                        contentContainerStyle={styles.list}
                        onEndReached={handleLoadMore}
                        scrollEnabled={false}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            historyLoading && page > 1 ? (
                                <SkeletonClassic
                                    height={148}
                                    borderRadius={10}
                                />
                            ) : null
                        }
                        ListEmptyComponent={
                            <>
                                <Text style={styles.emptyTitle}>
                                    No Commission Records
                                </Text>
                                <Text style={styles.emptySubTitle}>
                                    Try changing filters or search keywords. New commissions will appear here once someone signs up using your referral.
                                </Text>
                            </>
                        }
                    />
                </View>
            </View>
            <WithdrawRequest
                visible={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                data={{
                    walletAmount: wallet?.amount,
                    commission: data?.availableToWithdraw,
                }}
                onSubmit={submitPayoutRequest}
                isLoading={isPending}
            />
            {isFilterOpen && (
                <Dropdown
                    data={commissionFilter}
                    onSelect={setFilter}
                    onClose={() => setIsFilterOpen(false)}
                />
            )}
            {ishistoryFilterOpen && (
                <Dropdown
                    data={historyFilter}
                    onSelect={setHistoryFilterType}
                    onClose={() => setIsHistoryFilterOpen(false)}
                />
            )}
        </>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    mainWrapper: {
        rowGap: 24,
    },
    titleWrapper: {
        marginHorizontal: 24,
        rowGap: 4,
    },
    title: {
        color: colors.text.default,
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 20,
    },
    subTitle: {
        color: colors.text.extraLight,
        fontFamily: 'WorkSans-Regular',
        fontSize: 11,
    },
    list: {
        paddingHorizontal: 16,
        gap: 16,
    },
    card: {
        flexDirection: "row",
        backgroundColor: colors.isLight ? colors.background.darkBlue : "#020910",
        borderWidth: colors.isLight ? 0.6 : 1,
        borderColor: "#3D3D3D",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 18,
        gap: 12,
        minHeight: 148,
    },
    image: {
        width: 110,
        height: 110,
        borderRadius: 6,
    },
    cardContent: {
        flex: 1,
        gap: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    projectId: {
        color: colors.text.extraLight,
        fontSize: 14,
        fontFamily: "WorkSans-Regular",
    },
    projectTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: "WorkSans-SemiBold",
    },
    owner: {
        color: colors.text.extraLight,
        fontSize: 16,
        fontFamily: "WorkSans-Regular",
    },
    statusBadge: {
        paddingHorizontal: 8,
        borderRadius: 4,
        height: 22,
        flexDirection: 'row',
        borderWidth: 1,
        alignItems: 'center',
        columnGap: 6,
        justifyContent: 'center',
    },
    statusDot: {
        width: 4,
        height: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
    },
    released: {
        backgroundColor: "#33BD561F",
        borderColor: colors.border.green,
    },
    pending: {
        backgroundColor: "#E56B001F",
        borderColor: "#E56B00",
    },
    onHold: {
        backgroundColor: "#F03F231F",
        borderColor: colors.border.danger,
    },
    releasedDot: {
        backgroundColor: colors.border.green,
    },
    pendingDot: {
        backgroundColor: "#E56B00",
    },
    onHoldDot: {
        backgroundColor: colors.border.danger,
    },
    releasedText: {
        color: colors.text.green,
    },
    pendingText: {
        color: "#E56B00",
    },
    onHoldText: {
        color: colors.text.danger,
    },
    button: {
        marginTop: 3,
        borderRadius: 4,
        height: 30,
    },
    buttonText: {
        fontSize: 14,
    },
    divider: {
        backgroundColor: colors.background.darkBlue,
        height: 1,
        marginHorizontal: 16,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        columnGap: 16,
    },
    earnCard: {
        width: 260,
        height: 160,
        backgroundColor: colors.isLight ? colors.background.darkBlue : "#020910",
        borderRadius: 16,
        borderWidth: 1.4,
        borderColor: "#F5F5F51A",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    holdCard: {
        borderColor: "#590C00",
        backgroundColor: "#150300",
    },
    cardTitleWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    cardTitleIcon: {
        width: 16,
        height: 16,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F529',
        marginRight: 10,
        marginTop: 3,
    },
    cardTitle: {
        color: colors.text.extraLight,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    cardSubTitle: {
        color: colors.text.extraLight,
        fontSize: 10,
        fontFamily: 'WorkSans-Regular',
    },
    amount: {
        color: colors.text.default,
        fontSize: 24,
        fontFamily: 'WorkSans-Medium',
        marginTop: 10,
    },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#33BD5629",
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    badgeText: {
        color: colors.text.green,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
    },
    checkWrapper: {
        marginTop: 'auto',
        marginBottom: 10,
    },
    checkText: {
        color: colors.text.danger,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        textDecorationLine: 'underline',
    },
    withdrawButtonStyle: {
        height: 28,
        borderRadius: 4,
        marginTop: 10,
    },
    withdrawTextStyle: {
        fontSize: 14,
    },
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginLeft: 'auto',
    },
    historyWrapper: {
        rowGap: 8,
    },
    historyDropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        alignSelf: 'flex-end',
        marginHorizontal: 16,
    },
    filterText: {
        color: colors.text.default,
        fontSize: 13,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
        marginBottom: 2,
    },
    emptyTitle: {
        fontSize: 18,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        marginBottom: 10,
        textAlign: "center",
        marginTop: 20,
    },
    emptySubTitle: {
        textAlign: "center",
        fontFamily: 'WorkSans-Medium',
        fontSize: 12,
        color: colors.text.lightGrey,
        paddingHorizontal: 20,
        alignSelf: 'center',
    },
})

export default Commission;