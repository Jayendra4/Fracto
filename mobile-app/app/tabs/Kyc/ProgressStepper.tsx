import { Fragment, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colors, useTheme } from "../../util/theme";

const ProgressStepper = ({ step }: { step: number }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const steps = [1, 2, 3, 4];

    const lineAnimations = useRef(
        steps.map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        lineAnimations.forEach((anim, index) => {
            const shouldBeFilled = index + 1 < step;

            Animated.timing(anim, {
                toValue: shouldBeFilled ? 1 : 0,
                duration: 400,
                useNativeDriver: false,
            }).start();
        });
    }, [step]);

    return (
        <View style={styles.stepperContainer}>
            {steps.map((s, index) => {
                const preCompleted = s <= step;
                const completed = step > s;
                return (
                    <Fragment key={s}>
                        <Animated.View style={[styles.stepCircle, preCompleted ? styles.stepCompleted : null, {
                            backgroundColor: completed ? colors.border.green : 'transparent'
                        }]}>
                            {completed ? (
                                <Feather name="check" size={20} color={colors.constant.white} />
                            ) : (
                                <Text
                                    style={[
                                        styles.stepText, preCompleted ?
                                            styles.stepTextCompleted : null
                                    ]}
                                >
                                    {s}
                                </Text>
                            )}
                        </Animated.View>
                        {index !== steps?.length - 1 && (
                            <View style={styles.stepLineBackground}>
                                <Animated.View
                                    style={[
                                        styles.stepLineFill,
                                        {
                                            width: lineAnimations[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ["0%", "100%"],
                                            }),
                                            backgroundColor: colors.border.green,
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </Fragment>
                );
            })}
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    stepperContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.border.darkBlue,
        justifyContent: "center",
        alignItems: "center",
    },
    stepCompleted: {
        borderColor: colors.border.green,
    },
    stepText: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 22,
    },
    stepTextCompleted: {
        color: colors.text.green,
    },
    stepLineBackground: {
        flex: 1,
        height: 3,
        backgroundColor: colors.background.darkBlue,
        overflow: "hidden",
    },
    stepLineFill: {
        height: 3,
    },
})

export default ProgressStepper;