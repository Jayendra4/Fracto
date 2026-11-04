import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, StyleProp, TextStyle, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors, useTheme } from "./theme";

interface Props {
    step: number;
    totalSteps: number;
    size?: number;
    strokeWidth?: number;
    textStyle?: StyleProp<TextStyle>;
}

const StepProgressCircle = ({
    step,
    totalSteps,
    size = 84,
    strokeWidth = 5,
    textStyle,
}: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const progress = (step - 1) / totalSteps;

        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [step]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                <Circle
                    stroke="#D9D9D9"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                <AnimatedCircle
                    stroke="#4F86C0"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="square"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            <View style={styles.centerText}>
                <Text style={[styles.stepText, textStyle]}>
                    Step {step} of {totalSteps}
                </Text>
            </View>
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    centerText: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    stepText: {
        fontSize: 12,
        fontFamily: 'WorkSans-SemiBold',
        color: colors.text.default,
    },
});

export default StepProgressCircle;
