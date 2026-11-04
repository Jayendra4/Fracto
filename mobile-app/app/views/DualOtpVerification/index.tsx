import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    Pressable,
    Keyboard,
    Animated,
    TextInput,
} from 'react-native';
import { createStyles } from "./DualOtpVerification.style"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import GoBack from '../../components/GoBack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { OtpInput } from 'react-native-otp-entry';
import { useRegisterApi, useSendCode } from '../../services/hooks/useApi';
import { formSignupState } from '../SignUp';
import { UserOnboardingType } from '../../util/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime } from '../../util/helper';
import Toast from 'react-native-toast-message';
import { CreatePasswordState } from '../CreatePassword';
import * as Keychain from 'react-native-keychain';
import { useDispatch } from 'react-redux';
import { login, refreshUser } from '../../store/authSlice';
import { AppDispatch } from '../../store';
import { AccountType, DialCode } from '../../store/authSlice.types';
import { USER_TYPE_KEY } from '../SelectRoleAsAssetOwner';
import { ACCOUNT_TYPE_KEY } from '../CreateYourAccount';
import { COUNTRYINDEX_KEY, DIALCODE_KEY, REFER_KEY } from '../SelectAccountType';
import { usePressScale } from '../../services/hooks/usePressScale';

const OTP_TIMER_SECONDS = 120;

const selectAccountType: Record<string, string> = {
    Investor: "CorporateInvestor",
    "Asset Owner": "Business",
    Broker: "Broker",
};

const DualOtpVerification = () => {
    const [error, setError] = useState<boolean>(false);
    const [emailTimer, setEmailTimer] = useState<number>(OTP_TIMER_SECONDS);
    const [mobileTimer, setMobileTimer] = useState<number>(OTP_TIMER_SECONDS);
    const [emailVerificationCode, setEmailVerificationCode] = useState<string>('');
    const [mobileVerificationCode, setMobileVerificationCode] = useState<string>('');
    const { mutateAsync, error: codeApiError } = useSendCode();
    const { mutateAsync: registerMutateAsync, error: registerApiError, isPending } =
        useRegisterApi();
    const { colors } = useTheme();
    const { scale, onPressIn, onPressOut } = usePressScale();
    const styles = createStyles(colors, error);
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<AppDispatch>();
    const routes = useRoute();
    const { firstName, lastName, email, mobile, password } = routes?.params as
        formSignupState & CreatePasswordState;

    const emailIntervalRef = useRef<number | null>(null);
    const mobileIntervalRef = useRef<number | null>(null);
    const emailScaleAnim = useRef(new Animated.Value(1)).current;
    const mobileScaleAnim = useRef(new Animated.Value(1)).current;
    const mobileOtpRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (emailIntervalRef.current) clearInterval(emailIntervalRef.current);
            if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
        };
    }, []);

    const startTimer = useCallback((
        type: 'email' | 'mobile',
        seconds: number = OTP_TIMER_SECONDS
    ) => {
        const setTimer = type === 'email' ? setEmailTimer : setMobileTimer;
        const intervalRef = type === 'email' ? emailIntervalRef : mobileIntervalRef;

        setTimer(seconds);

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const requestEmailOtp = useCallback(async () => {
        try {
            setError(false);
            await mutateAsync({
                email,
                type: UserOnboardingType.Register,
            });

            startTimer('email');
            Toast.show({
                type: 'success',
                text1: "OTP sent successfully!",
            });
        } catch (err: any) {
            setEmailTimer(0);
            Toast.show({
                type: 'error',
                text1: err?.message || codeApiError?.message || 'Invalid Request',
            });
        }
    }, [mutateAsync, email, codeApiError, startTimer]);

    const requestMobileOtp = useCallback(async () => {
        try {
            setError(false);
            const country = await AsyncStorage.getItem('country');

            await mutateAsync({
                mobile,
                country: String(country),
                type: UserOnboardingType.Register,
            });

            startTimer('mobile');
            Toast.show({
                type: 'success',
                text1: "OTP sent successfully!",
            });
        } catch (err: any) {
            setMobileTimer(0);
            Toast.show({
                type: 'error',
                text1: err?.message || codeApiError?.message || 'Invalid Request',
            });
        }
    }, [mutateAsync, mobile, codeApiError, startTimer]);

    useEffect(() => {
        requestEmailOtp();
        requestMobileOtp();
    }, []);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(emailScaleAnim, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(emailScaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [emailScaleAnim]);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(mobileScaleAnim, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(mobileScaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [mobileScaleAnim]);

    const getTimerColor = (timer: number) => {
        if (timer <= 15) return colors.danger.default;
        return colors.text.default;
    };

    const wayToDashboard = useCallback(async () => {
        const dialCodeValue = await AsyncStorage.getItem(DIALCODE_KEY);
        const countryIndexValue = await AsyncStorage.getItem(COUNTRYINDEX_KEY);
        const accountType = await AsyncStorage.getItem(ACCOUNT_TYPE_KEY);
        const accountTypeValue = accountType ?? "";
        const referralCode = await AsyncStorage.getItem(REFER_KEY);
        const selectedAccountType =
            selectAccountType[accountTypeValue as keyof typeof selectAccountType] ??
            accountTypeValue;
        try {
            setError(false);

            const res = await registerMutateAsync({
                firstname: firstName.trim(),
                lastname: lastName.trim(),
                email,
                password,
                dialCode: dialCodeValue || DialCode.INDIA,
                mobile,
                countryId: countryIndexValue ? Number(countryIndexValue) : 1,
                accountType: selectedAccountType as AccountType,
                emailVerificationCode,
                mobileVerificationCode,
                ...(referralCode && { referralCode }),
            });
            const { accessToken, type } = res.data;

            await Keychain.setGenericPassword(email, accessToken, {
                service: 'accessToken',
            });
            Keyboard.dismiss();
            dispatch(login({ identifier: email }));
            dispatch(refreshUser())
            await AsyncStorage.setItem(USER_TYPE_KEY, type);
            if (type === AccountType.Business) {
                return navigation.reset({
                    index: 0,
                    routes: [{ name: Routes.ONBOARDINGTAB.ROLEASASSETOWNER }],
                });
            }
            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Congratulation!",
                subText: "Your account has been created, Let’s continue with the next step...",
                onForward: () => navigation.reset({
                    index: 0,
                    routes: [{ name: Routes.TABS.HOME }],
                }),
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || registerApiError?.message || 'Invalid Request',
            });
        }
    }, [
        registerMutateAsync,
        firstName,
        lastName,
        email,
        password,
        mobile,
        emailVerificationCode,
        mobileVerificationCode,
        registerApiError,
        dispatch,
        navigation,
    ]);

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
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                    enableAutomaticScroll
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.logoContainer}>
                        <View style={styles.goBack}>
                            <GoBack />
                        </View>
                        <Logo style={styles.logo} width={52} height={52} />
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.title}>OTP Verification</Text>
                        <Text style={[styles.emailInfo, { maxWidth: '85%' }]}>
                            Enter OTP received in your email and phone No. start your journey!
                        </Text>
                    </View>

                    <View style={styles.verfication}>
                        <View style={styles.emailVerfiyWrapper}>
                            <Text style={styles.title}>Verify Email</Text>
                            <Text style={styles.emailInfo}>
                                Enter OTP received in your email {email}
                            </Text>

                            <OtpInput
                                numberOfDigits={6}
                                onTextChange={setEmailVerificationCode}
                                focusColor={error ? colors.danger.default : colors.text.primary}
                                autoFocus={true}
                                type='numeric'
                                textInputProps={{
                                    caretHidden: true,
                                    contextMenuHidden: true,
                                    selectTextOnFocus: false,
                                    showSoftInputOnFocus: true,
                                    returnKeyType: 'next',
                                    onSubmitEditing: () => {
                                        if (emailVerificationCode?.length === 6) {
                                            mobileOtpRef.current?.focus();
                                        }
                                    },
                                }}
                                theme={{
                                    containerStyle: styles.otpContainer,
                                    pinCodeTextStyle: styles.pinCodeText,
                                    pinCodeContainerStyle: styles.pinCodeContainer,
                                    focusStickStyle: styles.focusStick,
                                }}
                            />
                            <View style={styles.otpResendWrapper}>
                                <Text style={styles.dontReceive}>Don't receive the OTP? </Text>
                                <View style={styles.timerWrapper}>
                                    <Animated.Text
                                        style={[
                                            styles.timer,
                                            { transform: [{ scale: emailScaleAnim }] },
                                            { color: getTimerColor(emailTimer) },
                                        ]}
                                    >
                                        {emailTimer > 0 ? formatTime(emailTimer) : 'Expired'}
                                    </Animated.Text>
                                    <Pressable disabled={emailTimer > 0} onPress={requestEmailOtp}>
                                        <Text style={[styles.resendLink, emailTimer > 0 && { opacity: 0.5 }]}>
                                            Resend
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                            {error && (
                                <View style={styles.errorWrapper}>
                                    <Text style={styles.errordiff}>
                                        <Text style={styles.errorText}>Oops, </Text>
                                        OTP is Wrong...!
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={[styles.emailVerfiyWrapper, {
                            flexGrow: 1, justifyContent: 'center',
                        }]}>
                            <Text style={styles.title}>Verify Mobile Number</Text>
                            <Text style={styles.emailInfo}>
                                Enter OTP received ******{mobile?.slice(-4)}
                            </Text>

                            <OtpInput
                                ref={mobileOtpRef}
                                numberOfDigits={6}
                                onTextChange={setMobileVerificationCode}
                                focusColor={error ? colors.danger.default : colors.text.primary}
                                autoFocus={false}
                                type='numeric'
                                textInputProps={{
                                    caretHidden: true,
                                    contextMenuHidden: true,
                                    selectTextOnFocus: false,
                                    showSoftInputOnFocus: true,
                                    returnKeyType: 'done',
                                }}
                                theme={{
                                    containerStyle: styles.otpContainer,
                                    pinCodeTextStyle: styles.pinCodeText,
                                    pinCodeContainerStyle: styles.pinCodeContainer,
                                    focusStickStyle: styles.focusStick,
                                }}
                            />
                            <View style={styles.otpResendWrapper}>
                                <Text style={styles.dontReceive}>Don't receive the OTP? </Text>
                                <View style={styles.timerWrapper}>
                                    <Animated.Text
                                        style={[
                                            styles.timer,
                                            { transform: [{ scale: mobileScaleAnim }] },
                                            { color: getTimerColor(mobileTimer) },
                                        ]}
                                    >
                                        {mobileTimer > 0 ? formatTime(mobileTimer) : 'Expired'}
                                    </Animated.Text>
                                    <Pressable
                                        disabled={mobileTimer > 0}
                                        onPress={requestMobileOtp}
                                        onPressIn={onPressIn}
                                        onPressOut={onPressOut}
                                    >
                                        <Animated.Text style={[styles.resendLink, mobileTimer > 0 && { opacity: 0.5 }, { transform: [{ scale }] }]}>
                                            Resend
                                        </Animated.Text>
                                    </Pressable>
                                </View>
                            </View>
                            {error && (
                                <View style={styles.errorWrapper}>
                                    <Text style={styles.errordiff}>
                                        <Text style={styles.errorText}>Oops, </Text>
                                        OTP is Wrong...!
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.bottomContainer}>
                        <ButtonPrimary
                            title={ButtonTextTypes.Confirm}
                            width={ButtonWidthTypes.Full}
                            align={ButtonAlignTypes.Center}
                            onPress={wayToDashboard}
                            loading={isPending}
                            disabled={emailVerificationCode?.length < 6 || emailTimer <= 0 || mobileVerificationCode?.length < 6 || mobileTimer <= 0}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ImageBackground>
    )
};

export default DualOtpVerification;