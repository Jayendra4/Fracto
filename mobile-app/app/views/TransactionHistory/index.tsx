import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import PropertyHeader from "../../components/Property/PropertyHeader"
import GoBack from "../../components/GoBack"
import { useTheme } from "../../util/theme";
import { createStyles } from "./TransactionHistory.style";
import PendingTransaction from "../../components/Transactions";
import { useGetPaymentRequestApi } from "../../services/auth.service";
import { useMemo } from "react";

const TransactionHistory = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { data: paymentRequests, isLoading: isPaymentRequestsLoading } =
        useGetPaymentRequestApi();

    const allTransactions = paymentRequests?.data || [];

    const pendingTransactions = useMemo(() => {
        return allTransactions.filter(
            (item: any) => item.status === "PENDING"
        );
    }, [allTransactions]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                <ScrollView contentContainerStyle={styles.wrapper}>
                    <View style={styles.headerRow}>
                        <GoBack withoutText />
                        <Text style={styles.headerTitle}>Transaction History</Text>
                    </View>
                    <PendingTransaction
                        title="All Transaction"
                        transactions={allTransactions}
                        loading={isPaymentRequestsLoading}
                        enableSeeAll
                    />
                    <PendingTransaction
                        title="Pending Request"
                        transactions={pendingTransactions}
                        loading={isPaymentRequestsLoading}
                        enableSeeAll
                    />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default TransactionHistory;