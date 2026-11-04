import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    Pressable,
    Animated,
} from 'react-native';
import { createStyles } from "./CreateYourAccount.style"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { useNavigation } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import Investors from "../../assets/icons/investors.svg";
import AssetOwner from "../../assets/icons/asset-owner.svg";
import Broker from "../../assets/icons/broker.svg";
import LinearGradient from 'react-native-linear-gradient';
import { SvgProps } from 'react-native-svg';
import { UserType } from '../../store/authSlice.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePressScale } from '../../services/hooks/usePressScale';

interface Props {
    userData: {
        typeIcon: React.FC<SvgProps>;
        title: string;
    }
    selected?: boolean;
    onPress?: () => void;
    scale: Animated.Value;
}

export const ACCOUNT_TYPE_KEY = "accountType";

export const userTypeData: Record<UserType, {
    title: UserType;
    typeIcon: React.FC<SvgProps>;
}> = {
    [UserType.Investor]: {
        title: UserType.Investor,
        typeIcon: Investors,
    },
    [UserType.AssetOwner]: {
        title: UserType.AssetOwner,
        typeIcon: AssetOwner,
    },
    [UserType.ChannelPartner]: {
        title: UserType.ChannelPartner,
        typeIcon: Broker,
    },
};

const SelectUserType = ({
    userData: { title, typeIcon: TypeIcon },
    selected,
    onPress,
    scale,
}: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <Pressable onPress={onPress}>
            <Animated.View style={{ transform: [{ scale }] }}>
                <LinearGradient
                    colors={['#2A5A8D', '#4F86C0']}
                    start={{ x: 0.1, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.typeWrapper, { borderWidth: selected ? 1 : 0 }]}
                >
                    <View style={styles.typeLogoRow}>
                        <View style={{ width: 40, height: 40 }}>
                            <LinearGradient
                                colors={['#4F86C0', '#2A5A8D']}
                                start={{ x: 0.1, y: 0 }}
                                end={{ x: 0.9, y: 1 }}
                                style={styles.gradientBorder}
                            >
                                <View style={styles.typeLogoWrapper}>
                                    <TypeIcon width={26} height={26} />
                                </View>
                            </LinearGradient>
                        </View>
                        <Text style={styles.typeTitle}>{title}</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
};

const CreateYourAccount = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const [selectedType, setSelectedType] = useState<UserType | null>(null);
    const { scale, onPressIn, onPressOut } = usePressScale();

    const scales = {
        [UserType.Investor]: useState(new Animated.Value(1))[0],
        [UserType.AssetOwner]: useState(new Animated.Value(1))[0],
        [UserType.ChannelPartner]: useState(new Animated.Value(1))[0],
    };

    const animateSelection = (type: UserType) => {
        Object.keys(scales).forEach(key => {
            const value = key === type ? 1 : 0.94;
            Animated.spring(scales[key as UserType], {
                toValue: value,
                useNativeDriver: true,
                friction: 5,
                tension: 80,
            }).start();
        });
    };

    const onSelectType = (type: UserType) => {
        setSelectedType(type);
        animateSelection(type);
    };

    const wayToLogin = useCallback(() => {
        navigation.navigate(Routes.ONBOARDING.LOGIN);
    }, [navigation]);

    const renderSelectedProfile = useCallback(async () => {
        await AsyncStorage.setItem(ACCOUNT_TYPE_KEY, String(selectedType === UserType.ChannelPartner ? "Broker" : selectedType));
        navigation.navigate(Routes.ONBOARDING.SHOWSELECTEDPROFILE, {
            selectedType
        });
    }, [navigation, selectedType]);

    const OnboardingScreen = colors.isLight ?
        require("../../assets/images/onboarding-screen-light.png") :
        require("../../assets/images/onboarding-screen.png")

    return (
        <ImageBackground
            source={OnboardingScreen}
            style={styles.wrapper}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.logoContainer}>
                    <Logo style={styles.logo} width={52} height={52} />
                </View>
                <View style={styles.details}>
                    <Text style={styles.title}>Create Your Account</Text>
                    <Text style={styles.emailInfo}>
                        Enter your details to get started. It only takes a few minutes...
                    </Text>
                </View>

                <View style={styles.typeRow}>
                    {Object.values(UserType).map(type => (
                        <SelectUserType
                            key={type}
                            userData={userTypeData[type]}
                            selected={selectedType === type}
                            onPress={() => onSelectType(type)}
                            scale={scales[type]}
                        />
                    ))}
                </View>

                <View style={styles.bottomContainer}>
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Already a member? </Text>
                        <Pressable
                            onPress={wayToLogin}
                            onPressIn={onPressIn}
                            onPressOut={onPressOut}
                        >
                            <Animated.Text
                                style={[styles.signupLink, { transform: [{ scale }] }]}>
                                Login Here
                            </Animated.Text>
                        </Pressable>
                    </View>
                    <ButtonPrimary
                        title={ButtonTextTypes.Create}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        onPress={renderSelectedProfile}
                        disabled={!selectedType}
                    />
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

export default CreateYourAccount;