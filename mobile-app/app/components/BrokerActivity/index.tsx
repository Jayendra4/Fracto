import { StyleSheet, Text, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import Feather from "react-native-vector-icons/Feather";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useGetInvestorActivityApi } from "../../services/auth.service";
import { timeAgo } from "../../util/helper";

const BrokerActivity = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const { data } = useGetInvestorActivityApi(String(userDetails?.id));

    return (
        <View style={styles.stepsContainer}>
            <Text style={styles.title}>Recent Activity</Text>
            <View style={styles.stepsWrapper}>
                {data?.data?.map((item: any, index: number) => {
                    const stepNumber = index + 1;
                    return (
                        <View key={stepNumber} style={styles.stepItem}>
                            <View style={styles.stepRow}>
                                <View style={styles.stepCircleWrapper}>
                                    <View style={styles.stepCircle}>
                                        <Feather name="check-circle" size={20} color={colors.icon.green} />
                                    </View>
                                </View>

                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle} numberOfLines={4}>
                                        {item?.label}
                                    </Text>
                                    <View style={styles.subTitleRow}>
                                        {item?.metadata?.amount && (
                                            <Text style={styles.amount}>
                                                ₹{item?.metadata?.amount}
                                            </Text>
                                        )}
                                        <Text style={styles.stepLabel}>
                                            {timeAgo(item?.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {stepNumber !== data?.data?.length && (
                                <View style={styles.stepLine} />
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    stepsContainer: {
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 12,
        borderRadius: 8,
        backgroundColor: colors.background.slightly,
        borderWidth: 1.4,
        borderColor: '#F5F5F51A',
    },
    title: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Regular',
    },
    stepsWrapper: {
        marginTop: 10,
        rowGap: 10,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    stepItem: {
        position: "relative",
    },
    stepCircleWrapper: {
        width: 44,
        height: 44,
        borderRadius: 6,
        backgroundColor: colors.background.slightly,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
        zIndex: 1,
        overflow: 'hidden',
    },
    stepCircle: {
        width: 44,
        height: 44,
        borderRadius: 6,
        backgroundColor: '#33BD561F',
        justifyContent: "center",
        alignItems: "center",
    },
    stepNumber: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    stepLine: {
        position: "absolute",
        left: 38,
        top: 56,
        width: 1,
        height: 98,
        backgroundColor: colors.border.green,
    },
    stepContent: {
        flexShrink: 1,
        rowGap: 8,
    },
    amount: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.green,
    },
    subTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    stepLabel: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
    },
    stepTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
});

export default BrokerActivity;