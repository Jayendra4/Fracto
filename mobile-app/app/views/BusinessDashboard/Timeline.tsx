import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import Feather from "react-native-vector-icons/Feather";

interface Step {
    title: string;
    subTitle: string;
}

interface TimelineProps {
    activeStep: number;
}

const steps: Step[] = [
    { title: "Asset Owner Clearance (Legal)", subTitle: "Nov 30, 2025" },
    { title: "Valuation", subTitle: "Dec 2, 2025" },
    { title: "Company Approval", subTitle: "Dec 2, 2025" },
    { title: "Liquidation Start", subTitle: "Est. Liquidation Start Date:- Dec 28, 2025" },
];

const Timeline: React.FC<TimelineProps> = ({ activeStep }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.stepsContainer}>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === activeStep;
                const isCompleted = stepNumber < activeStep;

                return (
                    <View key={stepNumber} style={styles.stepItem}>
                        <View style={styles.stepRow}>
                            <View style={styles.stepCircleOuter}>
                                <View
                                    style={[
                                        styles.stepCircle,
                                        isActive && styles.stepCircleActive,
                                        isCompleted && styles.stepCircleCompleted,
                                    ]}
                                >
                                    {isCompleted ? (
                                        <Feather name="check-circle" size={14} color={colors.icon.green} />
                                    ) : isActive ? (
                                        <Feather name="clock" size={14} color={colors.text.primary} />
                                    ) : (
                                        <Feather name="circle" size={14} color={colors.icon.primary} />
                                    )}
                                </View>
                            </View>

                            <View style={styles.stepContent}>
                                <Text style={[
                                    styles.stepTitle,
                                    isActive && styles.stepTitleActive
                                ]}
                                >
                                    {step.title}
                                </Text>
                                <Text style={[
                                    styles.subTitle,
                                    isActive && styles.subTitleActive
                                ]}
                                >
                                    {isActive ? "In Progress" : step.subTitle}
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
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    stepsContainer: {
        justifyContent: 'space-between',
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    stepItem: {
        position: "relative",
    },
    stepCircleOuter: {
        width: 30,
        height: 30,
        borderRadius: 100,
        backgroundColor: colors.background.slightly,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        zIndex: 1,
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.border.divider,
        backgroundColor: '#F5F5F533',
        justifyContent: "center",
        alignItems: "center",
    },
    stepCircleActive: {
        borderColor: "#4F86C080",
        borderWidth: 1,
        backgroundColor: '#4F86C033',
    },
    stepCircleCompleted: {
        backgroundColor: "#33BD5633",
        borderColor: colors.border.green,
        borderWidth: 1,
    },
    stepNumber: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    stepNumberActive: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    stepNumberCompleted: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.green,
    },
    stepLine: {
        position: "absolute",
        left: 30,
        top: 48,
        width: 1.5,
        height: 60,
        backgroundColor: colors.text.lightGrey,
    },
    stepLineActive: {
        backgroundColor: colors.background.green,
    },
    stepContent: {
        flexShrink: 1,
    },
    stepLabel: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    stepTitle: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
        marginTop: 2,
    },
    stepTitleActive: {
        color: "#4F86C0",
        fontFamily: 'WorkSans-Medium',
    },
    subTitle: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        marginTop: 2,
    },
    subTitleActive: {
        color: "#4F86C0",
    },
});

export default Timeline;
