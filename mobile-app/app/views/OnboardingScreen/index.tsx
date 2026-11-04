import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
    StyleSheet,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import Logo from "../../assets/icons/logo.svg";
import { Colors, useTheme } from '../../util/theme';
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Investor',
        description:
            'Smart investing through verified fractional assets, offering diversified exposure, lower entry barriers, transparent returns, and professionally managed real estate opportunities',
        image: require('../../assets/images/investor-onboarding.png'),
    },
    {
        id: '2',
        title: 'Asset Owner',
        description:
            'Unlock liquidity by fractionalizing your property, access a wider investor base, retain ownership control, and maximize asset value through structured, compliant listings',
        image: require('../../assets/images/assetowner-onboarding.png'),
    },
    {
        id: '3',
        title: 'Broker',
        description:
            'Grow commissions through seamless fractional property listings, faster deal closures, transparent commission tracking, and access to high-quality, investment-ready real estate assets',
        image: require('../../assets/images/broker-onboarding.png'),
    },
];

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentIndexRef = useRef(0);

    const handleNext = useCallback(async () => {
        const nextIndex = currentIndexRef.current + 1;

        if (nextIndex < slides?.length) {
            currentIndexRef.current = nextIndex;

            scrollViewRef.current?.scrollTo({
                x: width * nextIndex,
                animated: true,
            });

            setCurrentIndex(nextIndex);
        } else {
            await AsyncStorage.setItem('alreadyLaunched', 'true');
            navigation.replace(Routes.ONBOARDING.CREATEYOURACCOUNT);
        }
    }, [navigation]);

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const index = Math.round(
                event.nativeEvent.contentOffset.x / width,
            );

            currentIndexRef.current = index;
            setCurrentIndex(index);
        },
        []
    );

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.skipButton}
                onPress={async () => {
                    navigation.replace(Routes.ONBOARDING.CREATEYOURACCOUNT);
                    await AsyncStorage.setItem('alreadyLaunched', 'true');
                }}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View>
                <View style={styles.logoWrapper}>
                    <Logo width={45} height={45} />
                    <Text style={styles.logoText}>House Of Frac</Text>
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                >
                    {slides.map((item) => (
                        <View key={item.id} style={styles.slide}>
                            <View style={{ width: '80%', height: 292 }}>
                                <Image
                                    source={item.image}
                                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                                />

                                <LinearGradient
                                    colors={['transparent', '#F5F5F5']}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        height: 100,
                                        width: '100%',
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10,
                                    }}
                                />
                            </View>


                            <Text style={styles.title}>
                                {item.title}
                            </Text>

                            <Text style={styles.description}>
                                {item.description}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.paginationContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <Pressable
                onPress={handleNext}
                style={styles.nextButton}
            >
                <Text style={styles.nextText}>
                    Next
                </Text>
                <Ionicons
                    name="chevron-forward"
                    color={colors.icon.primary}
                    size={20}
                />
            </Pressable>
        </SafeAreaView>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        justifyContent: 'space-between',
        flex: 1,
    },
    skipButton: {
        alignSelf: 'flex-end',
        marginHorizontal: 16,
    },
    skipText: {
        color: colors.constant.black,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoText: {
        color: colors.text.darkBlue,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        marginTop: 6,
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: "80%",
        height: 292,
        resizeMode: 'cover',
        borderRadius: 10,
    },
    title: {
        color: colors.text.darkBlue,
        fontSize: 24,
        fontFamily: 'WorkSans-SemiBold',
        marginTop: 20,
    },
    description: {
        textAlign: 'center',
        marginHorizontal: 40,
        marginTop: 10,
        color: '#000000C2',
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 20,
        backgroundColor: '#D9D9D9',
        marginHorizontal: 8,
    },
    activeDot: {
        width: 8,
        height: 8,
        backgroundColor: colors.background.darkBlue,
    },
    nextButton: {
        backgroundColor: colors.background.darkBlue,
        marginHorizontal: 16,
        borderRadius: 4,
        flexDirection: 'row',
        columnGap: 6,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        paddingHorizontal: 16,
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    nextText: {
        color: colors.text.default,
        fontSize: 18,
        fontFamily: 'WorkSans-Medium',
    },
});