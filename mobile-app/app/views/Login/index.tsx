import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    Pressable,
    Animated,
    Keyboard,
    TextInput,
} from 'react-native';
import { createStyles } from "./Login.style"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import TextInputClassic, { TextInputType } from '../../components/TextInputClassic';
import Checkbox from '../../components/Checkbox';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import { Formik } from 'formik';
import { getLoginSchema } from '../../util/formValidationSchema';
import { useLoginApi, usePasswordCode, useSendCode } from '../../services/hooks/useApi';
import { getRememberedUser, saveAuthSession, UserOnboardingType } from '../../util/authStorage';
import Toast from 'react-native-toast-message';
import { usePressScale } from '../../services/hooks/usePressScale';
import { OtpInput } from 'react-native-otp-entry';
import { formatTime } from '../../util/helper';
import { AccountType, LoginPanel } from '../../store/authSlice.types';
import { login, refreshUser } from '../../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';
import * as Keychain from 'react-native-keychain';
import { USER_TYPE_KEY } from '../SelectRoleAsAssetOwner';
import AnimatedTabBar from '../../components/AnimatedTabBar';

interface UserTypes {
    email: string;
    mobile: string;
    password: string;
}

const tabs = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
];

const Login = () => {
    const [otpError, setOtpError] = useState<boolean>(false);
    const { colors } = useTheme();
    const styles = createStyles(colors, otpError);
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState<UserTypes>({
        email: '',
        mobile: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const { mutateAsync, isPending, error } = usePasswordCode();
    const { mutateAsync: sendCodeMutateAsync, isPending: sendCodePending, error: sendCodeError } = useSendCode();
    const { mutateAsync: loginMutateAsync, error: loginError } = useLoginApi();
    const [isLoginPending, setIsLoginPending] = useState(false);
    const forgotAnim = usePressScale();
    const signupAnim = usePressScale();
    const resendAnim = usePressScale();
    const [dialCode, setDialCode] = useState("+91");
    const [step, setStep] = useState<"login" | "otp">("login");
    const [timer, setTimer] = useState(120);
    const [verificationCode, setVerificationCode] = useState<string>('');
    const intervalRef = useRef<number | null>(null);
    const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
    const isEmailTabIsActive = activeTab === "email";
    const passwordRef = useRef<TextInput | null>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const loadRememberedUser = useCallback(async () => {
        const { rememberMe, email, mobile } = await getRememberedUser();

        if (rememberMe && (email || mobile)) {
            setRememberMe(true);
            setForm({
                email: email as string,
                mobile: mobile as string,
                password: '',
            });
        }
    }, []);

    useEffect(() => {
        loadRememberedUser();
    }, [loadRememberedUser]);

    useEffect(() => {
        if (step === "login") {
            setVerificationCode('');
            setOtpError(false);
        }
    }, [step]);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [timer]);

    const getTimerColor = () => {
        if (timer <= 15) return colors.danger.default;
        return colors.text.default;
    };

    const wayToDashboard = useCallback(async (values: UserTypes) => {
        try {
            setIsLoginPending(true);
            setOtpError(false);
            const identifier = isEmailTabIsActive ? values.email : values.mobile;
            const payload = {
                password: values.password,
                emailVerificationCode: verificationCode,
                loginPanel: LoginPanel.USER,
                ...(isEmailTabIsActive
                    ? { email: identifier }
                    : { mobile: identifier }),
            };
            const res = await loginMutateAsync(payload);

            const { accessToken, type } = res.data;

            await Keychain.setGenericPassword(identifier, accessToken, {
                service: 'accessToken',
            });
            Keyboard.dismiss();
            dispatch(login({ identifier }));
            dispatch(refreshUser())
            await saveAuthSession(
                isEmailTabIsActive ? values.email : "",
                !isEmailTabIsActive ? values.mobile : "",
                rememberMe,
            );
            await AsyncStorage.setItem(USER_TYPE_KEY, type);
            if (type === AccountType.Business) {
                return navigation.reset({
                    index: 0,
                    routes: [{ name: Routes.ONBOARDINGTAB.ROLEASASSETOWNER }],
                });
            }
            navigation.reset({
                index: 0,
                routes: [{ name: Routes.TABS.HOME }],
            });
        } catch (error: any) {
            setOtpError(true);
            Toast.show({
                type: 'error',
                text1: error?.message || loginError?.message || "Invalid Credentials",
            });
        } finally {
            setIsLoginPending(false);
        }
    }, [
        loginMutateAsync,
        verificationCode,
        dispatch,
        navigation,
        activeTab,
    ]);

    const startTimer = useCallback((seconds: number) => {
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

    const handleGenerateOtp = async (values: UserTypes) => {
        if (isPending || sendCodePending) return;
        try {
            const payload =
                isEmailTabIsActive
                    ? {
                        email: values.email,
                        password: values.password,
                    }
                    : {
                        mobile: values.mobile,
                        password: values.password,
                    };

            const res = await mutateAsync(payload);

            if (res?.status === 200 || res?.status === 201) {
                await requestForCode(values);
                setStep("otp");
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || error?.message || "Invalid Credentials",
            });
        }
    };

    const requestForCode = useCallback(async (values: UserTypes) => {
        try {
            await sendCodeMutateAsync({
                ...(isEmailTabIsActive
                    ? { email: values.email }
                    : { mobile: values.mobile, country: "india" }),
                type: UserOnboardingType.Login,
            });
            setOtpError(false);
            startTimer(120);

            Toast.show({
                type: 'success',
                text1: "OTP sent successfully!",
            });
        } catch (error: any) {
            setTimer(0);
            setOtpError(true);
            Toast.show({
                type: 'error',
                text1: error?.message || sendCodeError?.message || "Invalid Request For OTP",
            });
        }
    }, [sendCodeMutateAsync, startTimer, setOtpError, activeTab]);

    const wayToAccountCreation = useCallback(() => {
        navigation.navigate(Routes.ONBOARDING.CREATEYOURACCOUNT);
    }, [navigation]);

    const wayToForgotPassword = useCallback(() => {
        navigation.navigate(Routes.ONBOARDING.FORGOTPASSWORD);
    }, [navigation]);

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
                        <Logo width={64} height={64} />
                    </View>

                    <View style={styles.animatedTabs}>
                        <AnimatedTabBar
                            tabs={tabs}
                            activeKey={activeTab}
                            onChange={(key) => {
                                const tab = key as "email" | "phone";
                                setActiveTab(tab);
                            }}
                            indicatorColor="#2A5A8D"
                            activeTextColor="#FFFFFF"
                            inactiveTextColor={colors.isLight ? colors.constant.white : "#2A5A8D"}
                            variant="fixed"
                        />
                    </View>

                    <Formik
                        enableReinitialize
                        initialValues={form}
                        validationSchema={() => getLoginSchema(activeTab)}
                        context={{ activeTab }}
                        onSubmit={values => handleGenerateOtp(values)}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            setFieldValue,
                        }) => (
                            <>
                                <View style={styles.inputs}>
                                    {isEmailTabIsActive ? (
                                        <TextInputClassic
                                            label="Email"
                                            placeholder="Enter Your Email"
                                            value={values.email}
                                            onChangeText={handleChange('email')}
                                            onBlur={handleBlur('email')}
                                            error={errors.email && touched.email ? errors.email : undefined}
                                            returnKeyType="next"
                                            onSubmitEditing={() => passwordRef.current?.focus()}
                                        />
                                    ) : (
                                        <TextInputClassic
                                            label="Mobile Number"
                                            placeholder="Enter Your Mobile Number"
                                            type={TextInputType.Mobile}
                                            keyboardType="phone-pad"
                                            value={values.mobile}
                                            onChangeText={handleChange('mobile')}
                                            onBlur={handleBlur('mobile')}
                                            dialCode={dialCode}
                                            selectDialCode={(val) => {
                                                setDialCode(val);
                                                setFieldValue('mobile', '');
                                            }}
                                            error={errors.mobile && touched.mobile ? errors.mobile : undefined}
                                            returnKeyType="next"
                                            onSubmitEditing={() => passwordRef.current?.focus()}
                                        />
                                    )}

                                    <TextInputClassic
                                        ref={passwordRef}
                                        label="Password"
                                        placeholder="Enter Your Password"
                                        secureTextEntry
                                        value={values.password}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        error={errors.password && touched.password ? errors.password : undefined}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmit}
                                    />
                                </View>

                                {step === "login" && (
                                    <View style={styles.spaceHorizontal}>
                                        <View style={styles.row}>
                                            <View style={styles.row}>
                                                <Checkbox
                                                    checked={rememberMe}
                                                    onChange={setRememberMe}
                                                    label="Remember Me"
                                                />
                                            </View>

                                            <Pressable
                                                onPress={wayToForgotPassword}
                                                onPressIn={forgotAnim.onPressIn}
                                                onPressOut={forgotAnim.onPressOut}
                                            >
                                                <Animated.Text style={[styles.forgotText, { transform: [{ scale: forgotAnim.scale }] }]}>
                                                    Forgot Password
                                                </Animated.Text>
                                            </Pressable>
                                        </View>

                                        <ButtonPrimary
                                            title={ButtonTextTypes.Generate_OTP}
                                            width={ButtonWidthTypes.Full}
                                            align={ButtonAlignTypes.Center}
                                            onPress={handleSubmit}
                                            style={styles.primaryButton}
                                            loading={isPending}
                                        />
                                    </View>
                                )}

                                {step === "otp" && (
                                    <View style={styles.spaceHorizontal}>
                                        <Text style={styles.otpTitle}>Enter Your OTP</Text>
                                        <OtpInput
                                            numberOfDigits={6}
                                            onTextChange={setVerificationCode}
                                            focusColor={otpError ? colors.danger.default : colors.text.primary}
                                            type="numeric"
                                            textInputProps={{
                                                caretHidden: true,
                                                contextMenuHidden: true,
                                                selectTextOnFocus: false,
                                                showSoftInputOnFocus: true,
                                                onSubmitEditing: () => {
                                                    if (verificationCode.length === 6 && timer > 0) {
                                                        wayToDashboard(values);
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

                                        <View style={styles.timerRow}>
                                            <View style={styles.timerWrapper}>
                                                <Animated.Text
                                                    style={[
                                                        styles.timer,
                                                        { transform: [{ scale: scaleAnim }] },
                                                        { color: getTimerColor() },
                                                    ]}
                                                >
                                                    {timer > 0 ? formatTime(timer) : 'Expired'}
                                                </Animated.Text>
                                            </View>
                                            <Pressable
                                                disabled={timer > 0}
                                                onPress={() => requestForCode(values)}
                                                onPressIn={resendAnim.onPressIn}
                                                onPressOut={resendAnim.onPressOut}
                                            >
                                                <Animated.Text style={[
                                                    styles.resendLink,
                                                    timer > 0 && { opacity: 0.5 },
                                                    { transform: [{ scale: resendAnim.scale }] }
                                                ]}>
                                                    Resend OTP
                                                </Animated.Text>
                                            </Pressable>
                                        </View>

                                        <ButtonPrimary
                                            title={ButtonTextTypes.Login}
                                            width={ButtonWidthTypes.Full}
                                            align={ButtonAlignTypes.Center}
                                            onPress={() => wayToDashboard(values)}
                                            disabled={verificationCode?.length < 6 || timer <= 0}
                                            style={styles.loginButton}
                                            loading={isLoginPending}
                                        />
                                    </View>
                                )}
                            </>
                        )}
                    </Formik>

                    <View style={[styles.signupContainer, styles.spaceHorizontal]}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <Pressable
                            onPress={wayToAccountCreation}
                            onPressIn={signupAnim.onPressIn}
                            onPressOut={signupAnim.onPressOut}
                        >
                            <Animated.Text style={[styles.signupLink, {
                                transform: [{ scale: signupAnim.scale }],
                            }]}>
                                Signup
                            </Animated.Text>
                        </Pressable>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default Login;