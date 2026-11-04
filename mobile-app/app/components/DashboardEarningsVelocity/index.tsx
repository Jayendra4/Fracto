import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import { formatAmountWithCommas } from "../../util/helper";

const DashboardEarningsVelocity = ({ data, commission }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View>
                    <Text style={styles.title}>Earnings Velocity</Text>
                    <Text style={styles.amount}>
                        ₹{formatAmountWithCommas(data?.totalCommission || 0)}
                    </Text>
                    <Text style={styles.subtitle}>Total Commission Earned</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statAmount}>
                            ₹{formatAmountWithCommas(data?.last7Days || 0)}
                        </Text>
                        <Text style={styles.statLabel}>Last 7 Days</Text>
                    </View>

                    <View style={[styles.statBox, styles.holdBox]}>
                        <Text style={styles.statAmount}>
                            ₹{formatAmountWithCommas(data?.lockedCommission || 0)}
                        </Text>
                        <Text style={styles.statLabel}>Commission On Hold</Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Commission Locks</Text>

                <View style={styles.lockedTotal}>
                    <Text style={styles.lockedTotalText}>
                        ₹{formatAmountWithCommas(commission?.totalLockedAmount || 0)}
                    </Text>
                    <Text style={styles.lockedSubText}>Total Locked</Text>
                </View>

                <View style={styles.lockCardWrapper}>
                    {commission?.properties?.length > 0 && commission?.properties?.map((lock: any) => (
                        <View key={lock?.assetId} style={styles.lockCard}>
                            <Text style={styles.lockAmount}>
                                ₹{formatAmountWithCommas(lock?.lockedAmount)}
                            </Text>

                            {lock?.assetName && (
                                <Text style={styles.lockTitle}>{lock?.assetName}</Text>
                            )}

                            <View style={styles.row}>
                                <View>
                                    {lock?.reasons?.map((issue: string, index: number) => (
                                        <Text key={index} style={styles.lockIssue}>
                                            ✕ {issue}
                                        </Text>
                                    ))}
                                </View>

                                {/* <View style={styles.unlockBadge}>
                                    <Text style={styles.unlockText}>
                                        Est. Unlock: {lock.unlockIn}
                                    </Text>
                                </View> */}
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default DashboardEarningsVelocity;

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.slightly,
        padding: 16,
        marginHorizontal: 16,
        borderWidth: 1.4,
        borderColor: '#F5F5F51A',
        borderRadius: 8,
        rowGap: 16,
    },
    card: {
    },
    title: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Regular',
    },
    amount: {
        color: colors.text.default,
        fontSize: 24,
        fontFamily: 'WorkSans-Medium',
        marginTop: 10,
    },
    subtitle: {
        color: colors.text.extraLight,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
        marginTop: 2,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 16,
        marginTop: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.background.default,
        borderRadius: 6,
        borderWidth: colors.isLight ? 0 : 1,
        borderColor: '#F5F5F533',
        height: 77,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    holdBox: {
        backgroundColor: colors.isLight ? colors.constant.white : "#140300",
        borderColor: '#F03F2333',
    },
    statAmount: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
    },
    statLabel: {
        color: colors.text.extraLight,
        marginTop: 4,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
    },
    divider: {
        height: 1.4,
        backgroundColor: '#F5F5F533',
    },
    sectionTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
        marginBottom: 12,
    },
    lockedTotal: {
        backgroundColor: colors.isLight ? colors.constant.white : "#2a0e0e",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: colors.isLight ? 1 : 1.4,
        borderColor: colors.isLight ? colors.border.lightGrey : '#590C00',
    },
    lockedTotalText: {
        color: colors.text.danger,
        fontSize: 16,
        fontFamily: 'WorkSans-SemiBold',
    },
    lockedSubText: {
        color: colors.text.danger,
        fontFamily: 'WorkSans-Regular',
        marginTop: 4,
        fontSize: 12,
    },
    lockCardWrapper: {
        rowGap: 12,
    },
    lockCard: {
        backgroundColor: colors.isLight ? colors.constant.white : "#120a0a",
        paddingVertical: 18,
        borderRadius: 12,
        paddingHorizontal: 20,
        borderWidth: colors.isLight ? 0 : 1,
        borderColor: '#F5F5F533',
    },
    lockAmount: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-SemiBold',
    },
    lockTitle: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        marginTop: 2,
    },
    lockIssue: {
        color: colors.text.danger,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    unlockBadge: {
        backgroundColor: colors.isLight ? colors.background.darkBlue : "#F5F5F552",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        borderWidth: 0.8,
        borderColor: '#F5F5F566',
        marginLeft: 'auto',
    },
    unlockText: {
        color: colors.text.default,
        fontSize: 10,
        fontFamily: 'WorkSans-Medium',
    },
});
