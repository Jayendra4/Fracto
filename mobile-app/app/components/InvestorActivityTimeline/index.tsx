import { StyleSheet, Text, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import { useGetInvestorActivityApi } from "../../services/auth.service";
import moment from "moment";

const InvestorActivityTimeline = ({ investorId }: { investorId: string }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { data: activity } = useGetInvestorActivityApi(investorId);

    return (
        <View style={styles.stepsContainer}>
            <Text style={styles.title}>Activity Timeline</Text>
            <View style={styles.stepsWrapper}>
                {activity?.data?.map((item: any, index: number) => {
                    const stepNumber = index + 1;
                    return (
                        <View key={stepNumber} style={styles.stepItem}>
                            <View style={styles.stepRow}>
                                <View style={styles.stepCircleWrapper}>
                                    <View style={styles.stepCircle}>
                                        <View style={styles.circle} />
                                    </View>
                                </View>

                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>
                                        {item?.label}
                                    </Text>
                                    <View style={styles.subTitleRow}>
                                        <Text style={styles.stepLabel}>
                                            {moment(item?.createdAt).format("YYYY-MM-DD hh:mm A")}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {stepNumber !== activity?.data?.length && (
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
    },
    title: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Regular',
    },
    stepsWrapper: {
        rowGap: 20,
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
        width: 24,
        height: 24,
        borderRadius: 100,
        backgroundColor: colors.background.slightly,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 18,
        zIndex: 1,
        overflow: 'hidden',
        marginTop: 6,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 100,
        backgroundColor: '#33BD561F',
        justifyContent: "center",
        alignItems: "center",
    },
    circle: {
        width: 12,
        height: 12,
        borderRadius: 100,
        backgroundColor: colors.background.green,
    },
    stepNumber: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    stepLine: {
        position: "absolute",
        left: 28,
        top: 44,
        width: 1,
        height: 80,
        backgroundColor: colors.border.green,
    },
    stepContent: {
        flexShrink: 1,
        rowGap: 4,
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

export default InvestorActivityTimeline;