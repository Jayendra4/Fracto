import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import { Colors, useTheme } from '../../util/theme';
import SuccessCheck from "../../assets/icons/success-check-star.svg";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AccountType } from '../../store/authSlice.types';

const KycSubmitted = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const scaleAnim = useRef(new Animated.Value(1)).current;

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
            onPress={() => navigation.navigate(Routes.TABS.HOME)}
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
                    <SuccessCheck width={60} height={60} />
                </Animated.View>

                <View style={styles.textWrapper}>
                    <Text style={styles.title}>
                        {userDetails?.type === AccountType.Company ? 'KYB/KYC Submitted' : 'KYC Submitted'}
                    </Text>

                    <Text style={styles.mainText}>
                        Your details have been submitted
                    </Text>

                    <Text style={styles.subText}>
                        Our team is reviewing your information.
                    </Text>
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
        height: 235,
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
        gap: 6,
    },
    title: {
        color: colors.text.green,
        fontSize: 30,
        marginTop: 10,
        fontFamily: 'WorkSans-Medium',
    },
    mainText: {
        color: colors.constant.white,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        textAlign: 'center',
    },
    subText: {
        color: '#BDBDBD',
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        textAlign: 'center',
    },
});

export default KycSubmitted;
