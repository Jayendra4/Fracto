import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import { Colors, useTheme } from '../../util/theme';
import SuccessCheck from "../../assets/icons/success-check-star.svg";

interface Props {
    title: string;
    mainText: string;
    subText: string;
    onForward?: () => void;
}

const Success = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    const params = route?.params as Props | undefined;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const {
        title,
        mainText,
        subText,
        onForward,
    } = params ?? {};

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onForward) {
                onForward();
            } else {
                navigation.navigate(Routes.TABS.HOME);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.15,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        );

        pulse.start();

        return () => pulse.stop();
    }, []);

    return (
        <Pressable
            style={styles.overlay}
            onPress={() => onForward ? onForward() : navigation.navigate(Routes.TABS.HOME)}
        >
            <LinearGradient
                colors={['#0F3359', '#37689C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.card}
            >
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                    }}
                >
                    <SuccessCheck width={48} height={48} />
                </Animated.View>

                <View style={styles.textWrapper}>
                    {title && (
                        <Text style={styles.title}>{title}</Text>
                    )}

                    {mainText && (
                        <Text style={styles.mainText}>
                            {mainText}
                        </Text>
                    )}

                    {subText && (
                        <Text style={styles.subText}>
                            {subText}
                        </Text>
                    )}
                </View>
            </LinearGradient>
        </Pressable>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.background.banner,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    card: {
        width: '100%',
        minHeight: 235,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#9C9C9C',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#818181',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.25,
        shadowRadius: 7,
        elevation: 8,
    },
    textWrapper: {
        alignItems: 'center',
    },
    title: {
        color: colors.text.green,
        fontSize: 28,
        fontFamily: 'WorkSans-Medium',
        marginTop: 10,
        textAlign: 'center',
    },
    mainText: {
        color: colors.constant.white,
        fontSize: 18,
        fontFamily: 'WorkSans-Medium',
        textAlign: 'center',
    },
    subText: {
        color: '#BDBDBD',
        fontSize: 16,
        marginTop: 8,
        fontFamily: 'WorkSans-Medium',
        textAlign: 'center',
    },
});

export default Success;
