import { ImageBackground, RefreshControl, ScrollView, Text, View } from "react-native"
import { useTheme } from "../../util/theme";
import { createStyles } from "./AccountBalance.style";
import AddBankAccount from "../Banners/AddBankAccount";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import ButtonSecondary from "../buttons/ButtonSecondary";
import PendingTransaction from "../Transactions";
import AddBankAccountModal from "../Modals/AddBankAccountModal";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { formatAmountWithCommas } from "../../util/helper";
import { useGetPaymentRequestApi, useUserWalletApi } from "../../services/auth.service";
import SkeletonClassic from "../../util/SkeletonClassic";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Dropdown } from "../AssetFilterBar";

export interface AccountBalance {
    id: string;
    type: 'Main' | string;
    amount: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    accountId: number;
    approvedAmount: string;
    pendingAmount: string;
    rejectedAmount: string;
    pendingTransactionCount: number;
}


const fundFilters = ["All", "Pending", "Deposit", "Withdraw",];

const AccountBalance = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const [showAddBank, setShowAddBank] = useState(false);
    const { data: wallet, isLoading, refetch } = useUserWalletApi();
    const [refreshing, setRefreshing] = useState(false);

    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;
    const [allTransactions, setAllTransactions] = useState([]);

    const [filterLabel, setFilterLabel] = useState("All");
    const [status, setStatus] = useState<string | undefined>();
    const [requestType, setRequestType] = useState<string | undefined>();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const {
        data: paymentRequests,
        isLoading: isPaymentRequestsLoading,
        refetch: refetchPaymentRequests
    } = useGetPaymentRequestApi({
        skip,
        take: LIMIT,
        status,
        requestType,
    });

    const FILTER_MAP: Record<string, { status?: string; requestType?: string }> = {
        All: {},
        Pending: { status: "PENDING" },
        Deposit: { requestType: "DEPOSIT" },
        Withdraw: { requestType: "WITHDRAW" },
    };

    const handleFilterSelect = (value: string) => {
        setFilterLabel(value);

        const selectedFilter = FILTER_MAP[value] || {};

        setStatus(selectedFilter.status);
        setRequestType(selectedFilter.requestType);

        setPage(1);
        setAllTransactions([]);
        setIsFilterOpen(false);
    };

    useEffect(() => {
        if (!paymentRequests?.data) return;

        setAllTransactions(prev =>
            page === 1
                ? paymentRequests.data
                : [...prev, ...paymentRequests.data]
        );
    }, [paymentRequests]);

    useFocusEffect(
        useCallback(() => {
            refetch();
            refetchPaymentRequests();
        }, [refetch, refetchPaymentRequests])
    );

    const enableAddBankModal = () => {
        setShowAddBank(true);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetch(),
                refetchPaymentRequests()
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [refetch, refetchPaymentRequests]);

    const addMoneyToWallet = useCallback(() => {
        if (!userDetails?.isBankAdded) return enableAddBankModal();
        navigation.navigate(Routes.FUNDS.ADDMONEY);
    }, [navigation, userDetails, enableAddBankModal]);

    const withdrawMoneyFromWallet = useCallback(() => {
        if (!userDetails?.isBankAdded) return enableAddBankModal();
        navigation.navigate(Routes.FUNDS.WITHDRAWMONEY);
    }, [navigation, userDetails, enableAddBankModal]);

    return (
        <>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.text.primary]}
                        tintColor={colors.text.default}
                    />
                }
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

                    const isCloseToBottom =
                        layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

                    if (
                        isCloseToBottom &&
                        !isPaymentRequestsLoading &&
                        paymentRequests?.data?.length === LIMIT
                    ) {
                        setPage(prev => prev + 1);
                    }
                }}
            >
                <View style={styles.upperContent}>
                    {!userDetails?.isBankAdded && <AddBankAccount action={enableAddBankModal} />}
                    <ImageBackground
                        source={require("../../assets/images/account_balance.png")}
                        style={styles.balanceWrapper}
                        resizeMode="cover"
                    >
                        <Text style={styles.title}>Available Balance</Text>
                        {isLoading ? (
                            <SkeletonClassic
                                width={140}
                                height={40}
                                borderRadius={8}
                                style={{ marginTop: 6 }}
                            />
                        ) : (
                            <Text style={styles.balance}>
                                ₹ {formatAmountWithCommas(wallet?.amount || 0)}
                            </Text>
                        )}
                    </ImageBackground>
                    <View style={styles.ctaRow}>
                        <ButtonPrimary
                            title={ButtonTextTypes.Add_Money}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Right}
                            buttonStyle={styles.buttonStyle}
                            textStyle={styles.textStyle}
                            onPress={addMoneyToWallet}
                        />
                        <ButtonSecondary
                            title={ButtonTextTypes.Withdraw}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Right}
                            buttonStyle={styles.secondaryButtonStyle}
                            textStyle={[styles.textStyle, styles.secondaryTextStyle]}
                            onPress={withdrawMoneyFromWallet}
                        />
                    </View>
                </View>
                <View style={styles.pendingWrapper}>
                    <Text style={styles.pendingTitle}>Pending Amount</Text>
                    {isLoading ? (
                        <SkeletonClassic
                            width={140}
                            height={40}
                            borderRadius={8}
                            style={{ marginTop: 10 }}
                        />
                    ) : (
                        <Text style={styles.pendingAmount}>
                            ₹ {formatAmountWithCommas(wallet?.pendingAmount || 0)}
                        </Text>
                    )}
                    <Text style={styles.pendingCount}>
                        Total Pending Transactions:
                        <Text style={styles.count}>
                            {" "}{wallet?.pendingTransactionCount || 0}
                        </Text>
                    </Text>
                </View>
                <PendingTransaction
                    title="Pending Request"
                    transactions={allTransactions}
                    loading={isPaymentRequestsLoading && page === 1}
                    filterLabel={filterLabel}
                    onFilterPress={() => setIsFilterOpen(true)}
                />
                {isFilterOpen && (
                    <Dropdown
                        data={fundFilters}
                        onSelect={handleFilterSelect}
                        onClose={() => setIsFilterOpen(false)}
                    />
                )}
            </ScrollView>
            <AddBankAccountModal
                visible={showAddBank}
                onClose={() => setShowAddBank(false)}
            />
        </>
    );
};

export default AccountBalance;