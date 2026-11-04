import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, useTheme } from "../../util/theme";

interface Step {
    title: string;
}

interface StepsContainerProps {
    activeStep: number;
}

const steps: Step[] = [
    { title: "Company KYB" },
    { title: "Directors KYC" },
];

const StepsContainer: React.FC<StepsContainerProps> = ({ activeStep }) => {
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
                        <View
                            style={[
                                styles.stepRow,
                                isActive && styles.stepRowActive,
                            ]}
                        >
                            <View
                                style={[
                                    styles.stepCircle,
                                    isActive && styles.stepCircleActive,
                                    isCompleted && styles.stepCircleCompleted,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.stepNumber,
                                        isActive && styles.stepNumberActive,
                                        isCompleted && styles.stepNumberCompleted,
                                    ]}
                                >
                                    {stepNumber}
                                </Text>
                            </View>

                            <View style={styles.stepContent}>
                                <Text style={styles.stepLabel}>
                                    Step {stepNumber}/{steps?.length}
                                </Text>
                                <Text style={[
                                    styles.stepTitle,
                                    isCompleted && styles.stepTitleCompleted
                                ]}
                                >
                                    {step.title}
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
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingVertical: 28,
        borderRadius: 12,
        backgroundColor: colors.isLight ? colors.background.secondary : '#020910',
        borderWidth: 1,
        borderColor: '#F5F5F529',
        marginTop: 20,
        height: 250,
        justifyContent: 'space-between',
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    stepRowActive: {
        backgroundColor: colors.isLight ? colors.constant.white : colors.background.slightly,
        borderWidth: 1,
        borderColor: "#F5F5F51A",
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 63,
        zIndex: 1,
    },
    stepItem: {
        position: "relative",
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.border.primary,
        backgroundColor: colors.background.default,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
        zIndex: 1,
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
        left: 34,
        top: 52,
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
    stepLabel: {
        color: colors.text.green,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    stepTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        marginTop: 2,
    },
    stepTitleCompleted: {
        color: colors.text.green,
    },
});

export default StepsContainer;
