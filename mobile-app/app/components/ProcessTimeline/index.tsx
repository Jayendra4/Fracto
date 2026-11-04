import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";

interface Step {
    title: string;
    subTitle: string;
}

interface ProcessTimelineProps {
    activeStep: number;
}

const steps: Step[] = [
    { title: "Investor KYC Verification", subTitle: "Jan 25, 2026" },
    { title: "Risk Assessment approval", subTitle: "Jan 25, 2026" },
    { title: "Asset Owner Approval", subTitle: "Jan 25, 2026" },
    { title: "Trustee Review", subTitle: "Jan 25, 2026" },
    { title: "Trustee Review", subTitle: "Jan 25, 2026" },
];

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ activeStep }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.stepsContainer}>
            <Text style={styles.title}>Process Timeline</Text>
            <View style={styles.stepsWrapper}>
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === activeStep;
                    const isCompleted = stepNumber < activeStep;

                    return (
                        <View key={stepNumber} style={styles.stepItem}>
                            <View style={styles.stepRow}>
                                <View style={styles.stepCircleWrapper}>
                                    {isCompleted && (
                                        <View
                                            style={[
                                                styles.stepCircle,
                                                styles.stepCircleCompleted,
                                            ]}
                                        >
                                            <Feather
                                                name="check"
                                                size={12}
                                                color={colors.icon.green}
                                            />
                                        </View>
                                    )}
                                    {isActive && (
                                        <Entypo
                                            name="back-in-time"
                                            size={18}
                                            color={"#E56B00"}
                                        />
                                    )}
                                    {!isCompleted && !isActive && (
                                        <AntDesign
                                            name="warning"
                                            size={18}
                                            color={"#E56B00"}
                                        />
                                    )}
                                </View>

                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>
                                        {step.title}
                                    </Text>
                                    <View style={styles.subTitleRow}>
                                        <Text style={[
                                            styles.stepLabel,
                                            isActive && styles.stepSubTitleActive,
                                            isCompleted && styles.stepSubTitleCompleted,
                                        ]}>
                                            {step.subTitle}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[
                                    styles.statusBadge,
                                    isCompleted && styles.statusBadgeCompleted
                                ]}>
                                    <View style={[
                                        styles.statusDot,
                                        isCompleted && styles.statusDotCompleted
                                    ]} />
                                    <Text style={[
                                        styles.statusText,
                                        isCompleted && styles.statusTextCompleted
                                    ]}>
                                        {
                                            isCompleted ?
                                                'Completed' :
                                                isActive ?
                                                    "In Progress" :
                                                    "Pending"
                                        }
                                    </Text>
                                </View>
                            </View>

                            {stepNumber !== steps?.length && (
                                <View
                                    style={[
                                        styles.stepLine,
                                        isCompleted && styles.stepLineActive,
                                    ]}
                                />
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
        paddingHorizontal: 10,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: colors.background.default,
        borderWidth: 1,
        borderColor: '#F5F5F529',
        justifyContent: 'space-between',
    },
    title: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        textAlign: 'center',
        marginBottom: 12,
    },
    stepsWrapper: {
        rowGap: 24,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
    },
    stepItem: {
        position: "relative",
    },
    stepCircleWrapper: {
        width: 36,
        height: 36,
        borderRadius: 100,
        backgroundColor: colors.background.default,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 4,
        zIndex: 1,
        overflow: 'hidden',
    },
    stepCircle: {
        width: 18,
        height: 18,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.border.primary,
        backgroundColor: colors.background.default,
        justifyContent: "center",
        alignItems: "center",
    },
    stepCircleActive: {
        borderColor: colors.border.green,
        borderWidth: 2,
    },
    stepCircleCompleted: {
        backgroundColor: "#33BD5633",
        borderColor: colors.border.green,
        borderWidth: 2,
    },
    stepNumber: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    stepNumberActive: {
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
    },
    stepNumberCompleted: {
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.green,
    },
    stepLine: {
        position: "absolute",
        left: 18,
        top: 45,
        width: 1.5,
        height: 86,
        backgroundColor: colors.text.lightGrey,
    },
    stepLineActive: {
        backgroundColor: colors.background.green,
    },
    stepContent: {
        flexShrink: 1,
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
        marginRight: 8,
    },
    stepSubTitleActive: {
        color: '#E56B00',
    },
    stepSubTitleCompleted: {
        color: colors.text.green,
    },
    statusBadge: {
        paddingHorizontal: 8,
        borderRadius: 15,
        height: 24,
        flexDirection: 'row',
        borderWidth: 1,
        alignItems: 'center',
        columnGap: 6,
        justifyContent: 'center',
        backgroundColor: '#E56B001F',
        borderColor: '#E56B00',
        marginLeft: 'auto',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 20,
        backgroundColor: '#E56B00',
    },
    statusDotCompleted: {
        backgroundColor: colors.background.green,
    },
    statusText: {
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
        color: '#E56B00',
    },
    statusBadgeCompleted: {
        backgroundColor: '#33BD561F',
        borderColor: '#33BD5699',
    },
    statusTextCompleted: {
        color: colors.text.green,
    },
});

export default ProcessTimeline;