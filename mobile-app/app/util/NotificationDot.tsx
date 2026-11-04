import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

interface Props {
    visible: boolean;
    color?: string;
    size?: number;
    children: React.ReactNode;
}

const NotificationDot = ({
    visible,
    color = "red",
    size = 6,
    children,
}: Props) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!visible) return;

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.4,
                    duration: 500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        pulse.start();

        return () => pulse.stop();
    }, [visible]);

    return (
        <View style={styles.container}>
            {children}

            {visible && (
                <View style={styles.dotWrapper}>
                    <Animated.View
                        style={[
                            styles.ripple,
                            {
                                backgroundColor: color,
                                width: size * 2.5,
                                height: size * 2.5,
                                borderRadius: size * 2,
                                transform: [{ scale: scaleAnim }],
                                opacity: scaleAnim.interpolate({
                                    inputRange: [1, 1.4],
                                    outputRange: [0.5, 0],
                                }),
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: color,
                                width: size,
                                height: size,
                                borderRadius: size,
                            },
                        ]}
                    />
                </View>
            )}
        </View>
    );
};

export default NotificationDot;

const styles = StyleSheet.create({
    container: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    dotWrapper: {
        position: "absolute",
        right: 5,
        top: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    ripple: {
        position: "absolute",
    },
    dot: {},
});