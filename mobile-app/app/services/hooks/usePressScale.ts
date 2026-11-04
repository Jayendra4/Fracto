import { useRef } from "react";
import { Animated } from "react-native";

export const usePressScale = (pressedScale = 0.9) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: pressedScale,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return {
        scale,
        onPressIn,
        onPressOut,
    };
};