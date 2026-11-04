import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Animated,
    Easing,
    View,
    ActivityIndicator,
    Pressable,
    Text,
} from "react-native";
import { Colors, useTheme } from "../../util/theme";

type Props = {
    onAnimationEnd: () => void;
    onRetry?: () => void;
    error?: string | null;
};

const AnimatedSplash = ({ onAnimationEnd, error, onRetry }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const rotate = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const bgColor = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textScaleX = useRef(new Animated.Value(0)).current;
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        Animated.sequence([
            Animated.delay(800),

            Animated.parallel([
                Animated.timing(rotate, {
                    toValue: 5.5,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1.25,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),

            Animated.parallel([
                Animated.timing(rotate, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),

            Animated.timing(bgColor, {
                toValue: 1,
                duration: 400,
                useNativeDriver: false,
            }),

            Animated.parallel([
                Animated.timing(textScaleX, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            setShowLoader(true);
            setTimeout(onAnimationEnd, 400);
        });

    }, []);

    const rotateInterpolate = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "25deg"],
    });

    const backgroundInterpolate = bgColor.interpolate({
        inputRange: [0, 1],
        outputRange: ["#FFFFFF", "#4F86C0"],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: backgroundInterpolate },
            ]}
        >
            <Animated.Image
                source={require("../../assets/images/logo.png")}
                style={[
                    styles.logo,
                    {
                        transform: [
                            { rotate: rotateInterpolate },
                            { scale: scale },
                        ],
                    },
                ]}
                resizeMode="contain"
            />

            <Animated.Text
                style={[
                    styles.text,
                    {
                        opacity: textOpacity,
                        transform: [{ scaleX: textScaleX }],
                    },
                ]}
            >
                HOUSE OF FRAC
            </Animated.Text>
            {error ? (
                <View style={styles.topSpace}>
                    <Pressable onPress={onRetry} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            ) : showLoader ? (
                <View style={styles.topSpace}>
                    <ActivityIndicator size="large" color={colors.constant.white} />
                </View>
            ) : null}
        </Animated.View>
    );
};

export default AnimatedSplash;

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 60,
        height: 60,
    },
    text: {
        marginTop: 12,
        fontSize: 24,
        fontFamily: 'WorkSans-SemiBold',
        color: colors.constant.white,
    },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
    },
    retryText: {
        color: "#4F86C0",
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    topSpace: {
        marginTop: 16,
    },
});
