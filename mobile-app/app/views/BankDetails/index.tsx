import { Animated, Dimensions, FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./BankDetails.style";
import { useState, useCallback, useRef, useEffect } from "react";
import BankCard from "../../components/BankCard";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import Feather from "react-native-vector-icons/Feather";
import { useGetBankAccountApi, useGetUpiIdApi } from "../../services/auth.service";
import UpiCard from "../../components/UpiCard";
import AddBankAccountModal from "../../components/Modals/AddBankAccountModal";
import AddUpiIdModal from "../../components/Modals/AddUpiIdModal";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../constant/Routes";
import SkeletonClassic from "../../util/SkeletonClassic";
import AnimatedTabBar from "../../components/AnimatedTabBar";

const tabs = [
    { key: "bank", label: "Bank Account" },
    { key: "upi", label: "UPI ID" },
];

export interface BankAccount {
    id: number;
    paymentOwnerId: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isActive: boolean;
    ifscCode: string;
    fundAccountId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpiAccount {
    id: number;
    paymentOwnerId: number;
    upiId: string;
    qrCode: string | null;
    fundAccountId: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

const BankDetails = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();

    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"bank" | "upi">("bank");
    const [showAddBank, setShowAddBank] = useState(false);
    const [showAddUpi, setShowAddUpi] = useState(false);
    const isBankTab = activeTab === "bank";

    const { data: bankAccountList, isPending: bankAccountPending, refetch: refetchBankAccounts } =
        useGetBankAccountApi();
    const { data: upiData, isPending: upiPending, refetch: refetchUpi } = useGetUpiIdApi();

    const isLoading = bankAccountPending && isBankTab || upiPending && !isBankTab;

    const tabWidth = (Dimensions.get("window").width / 2) - 20;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const index = activeTab === "bank" ? 0 : 1;

        Animated.spring(translateX, {
            toValue: index * tabWidth,
            useNativeDriver: true,
            friction: 20,
            tension: 80,
        }).start();
    }, [activeTab]);

    useFocusEffect(
        useCallback(() => {
            refetchBankAccounts();
            refetchUpi();
        }, [refetchBankAccounts, refetchUpi])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (isBankTab) {
                refetchBankAccounts();
            } else {
                refetchUpi();
            }
        } finally {
            setRefreshing(false);
        }
    }, [refetchBankAccounts, refetchUpi]);

    const renderItem = useCallback(
        ({ item }: any) => {
            if (isLoading) {
                return (
                    <SkeletonClassic
                        width="auto"
                        height={isBankTab ? 177 : 101}
                        borderRadius={10}
                        style={{ marginHorizontal: 16 }}
                    />
                );
            }

            if (isBankTab) {
                const bank: BankAccount = item;
                return (
                    <BankCard
                        bankDetails={bank}
                        reFetchBankAccountList={refetchBankAccounts}
                    />
                );
            } else {
                const upi: UpiAccount = item;
                return <UpiCard upiDetails={upi} reFetchUpiIdList={refetchUpi} />;
            }
        },
        [isBankTab, isLoading, refetchBankAccounts, refetchUpi]
    );

    return (
        <>
            <SafeAreaView style={styles.root}>
                <View style={styles.container}>
                    <PropertyHeader enableBack />

                    <View style={styles.container}>
                        <View style={styles.animatedTabs}>
                            <AnimatedTabBar
                                tabs={tabs}
                                activeKey={activeTab}
                                onChange={(key) => setActiveTab(key as "bank" | "upi")}
                                indicatorColor="#2A5A8D"
                                activeTextColor="#FFFFFF"
                                inactiveTextColor={colors.isLight ? colors.constant.white : "#2A5A8D"}
                                variant="fixed"
                            />
                        </View>

                        <ButtonPrimary
                            title={isBankTab ? ButtonTextTypes.Add_Bank_Account : ButtonTextTypes.Add_UPI_ID}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Right}
                            icon={<Feather name="plus-circle" size={16} color={colors.constant.white} />}
                            style={{ width: "auto" }}
                            buttonStyle={styles.addButton}
                            textStyle={styles.addButtonText}
                            onPress={() => isBankTab ? setShowAddBank(true) : setShowAddUpi(true)}
                        />

                        <FlatList
                            data={isLoading ? Array.from({ length: 5 }) : isBankTab ? bankAccountList : upiData}
                            keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : item.id?.toString()}
                            contentContainerStyle={styles.cardList}
                            ListEmptyComponent={!isLoading ? (
                                <Text style={styles.emptyMessage}>
                                    {isBankTab ? "No bank accounts added yet." : "No UPI IDs added yet."}
                                </Text>
                            ) : null}
                            renderItem={renderItem}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={[colors.text.primary]}
                                    tintColor={colors.text.default}
                                />
                            }
                        />
                    </View>
                </View>
            </SafeAreaView>

            <AddBankAccountModal
                visible={showAddBank}
                onClose={() => setShowAddBank(false)}
                onAction={() => {
                    refetchBankAccounts();
                    navigation.goBack();
                }}
            />

            <AddUpiIdModal
                visible={showAddUpi}
                onClose={() => setShowAddUpi(false)}
                onAction={() => {
                    refetchUpi();
                    navigation.goBack();
                }}
            />
        </>
    );
};

export default BankDetails;