import React, { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useTheme } from "../../util/theme";
import { createStyles } from "./Transactions.style";
import { formatAmountWithCommas, formatDate } from "../../util/helper";
import SkeletonClassic from "../../util/SkeletonClassic";
import Feather from "react-native-vector-icons/Feather";

interface Props {
    title: string;
    transactions: any[];
    loading: boolean;
    enableSeeAll?: boolean;

    filterLabel?: string;
    onFilterPress?: () => void;
}

const Transactions = ({ title,
    transactions,
    loading,
    enableSeeAll,
    filterLabel,
    onFilterPress, }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [showAll, setShowAll] = useState(false);


    const visibleTransactions =
        enableSeeAll && !showAll
            ? transactions.slice(0, 3)
            : transactions;

    const STATUS_MAP: Record<string, { text: string; badgeStyle: any; textStyle: any }> = {
        COMPLETED: {
            text: "COMPLETED",
            badgeStyle: styles.approved,
            textStyle: styles.approvedText,
        },
        APPROVED: {
            text: "APPROVED",
            badgeStyle: styles.approved,
            textStyle: styles.approvedText,
        },
        PENDING: {
            text: "PENDING",
            badgeStyle: styles.pending,
            textStyle: styles.pendingText,
        },
        REJECTED: {
            text: "REJECTED",
            badgeStyle: styles.rejected,
            textStyle: styles.rejectedText,
        },
    };

    const renderStatus = (status: string) => {
        const { text, badgeStyle, textStyle } = STATUS_MAP[status] || STATUS_MAP["REJECTED"];

        return (
            <View style={[styles.statusBadge, badgeStyle]}>
                <Text style={[styles.statusText, textStyle]}>{text}</Text>
            </View>
        );
    };

    const requestType = (type: string) => {
        switch (type) {
            case "DEPOSIT":
                return "Deposit";
            case "WITHDRAW":
                return "Withdrawal";
            default:
                return type;
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.left}>
                <Text style={styles.title}>Wallet {requestType(item?.requestType)}</Text>
                <Text style={styles.subText}>{`${item?.requestType} ${item?.methodType}`}</Text>
                <Text style={styles.subText}>
                    {item?.bankAccount?.bankName ? (
                        `${item?.bankAccount?.bankName} ****${item?.bankAccount?.accountNumber?.slice(-4)}`
                    ) : (
                        item?.methodType
                    )}
                </Text>
                <Text style={styles.subText}>{formatDate(item?.createdAt)}</Text>
            </View>

            <View style={styles.right}>
                <Text style={styles.amount}>₹ {formatAmountWithCommas(item.amount)}</Text>
                {renderStatus(item.status)}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.titleWrapper}>
                <Text style={styles.header}>{title}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {onFilterPress && (
                        <Pressable
                            style={styles.dropdownTrigger}
                            onPress={onFilterPress}
                        >
                            <Text style={styles.filterText}>
                                {filterLabel || "All"}
                            </Text>
                            <Feather
                                name="chevron-down"
                                size={16}
                                color={colors.text.default}
                            />
                        </Pressable>
                    )}

                    {enableSeeAll && transactions?.length > 3 && (
                        <Pressable
                            style={styles.seeAll}
                            onPress={() => setShowAll((prev) => !prev)}
                            disabled={loading || visibleTransactions.length === 0}
                        >
                            <Text style={styles.seeAllText}>
                                {showAll ? "See Less" : "See All"}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>
            <FlatList
                data={loading ? [1, 2, 3] : visibleTransactions}
                keyExtractor={(item) =>
                    loading ? item.toString() : item.id.toString()}
                renderItem={
                    loading
                        ? () => (
                            <SkeletonClassic
                                height={100}
                                width="auto"
                                borderRadius={2}
                            />
                        )
                        : renderItem
                }
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No transactions found
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Transactions;
