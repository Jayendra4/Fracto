import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    Pressable,
    Animated,
} from 'react-native';
import { createStyles } from "./ResetPassword.style";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import { useNavigation, useRoute } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import GoBack from '../../components/GoBack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import TextInputClassic from '../../components/TextInputClassic';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { OtpInput } from 'react-native-otp-entry';
import { formatTime } from '../../util/helper';
import { useResetApi, useSendCode } from '../../services/hooks/useApi';
import { UserOnboardingType } from '../../util/authStorage';
import { getPasswordStrength } from '../../constant/password';
import { ResetSchema } from '../../util/formValidationSchema';
import Toast from 'react-native-toast-message';
import { usePressScale } from '../../services/hooks/usePressScale';

export interface ResetPasswordState {
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

interface Params {
    userEmail: string;
    mobile: string;
    type: "email" | "phone";
}

const ResetPassword = () => {
    const [timer, setTimer] = useState<number>(120);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const { colors } = useTheme();
    const styles = createStyles(colors, !!errorMsg);
    const { mutateAsync, error: sendCodeError } = useSendCode();
    const { mutateAsync: resetMutateAsync, isPending, error: resetApiError } = useResetApi();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    const { userEmail, mobile, type } = route?.params as Params;
    const intervalRef = useRef<number | null>(null);
    const { scale, onPressIn, onPressOut } = usePressScale();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const initialValues: ResetPasswordState = {
        otp: '',
        newPassword: '',
        confirmPassword: '',
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

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

    const requestForCode = useCallback(async () => {
        try {
            const payload = type === "email"
                ? { email: userEmail, type: UserOnboardingType.ResetPassword }
                : { mobile, country: "india", type: UserOnboardingType.ResetPassword }

            await mutateAsync(payload);
            setErrorMsg('');
            startTimer(120);
            Toast.show({
                type: 'success',
                text1: "OTP sent successfully!",
            });
        } catch (error: any) {
            setTimer(0);
            setErrorMsg(error?.message);
            Toast.show({
                type: 'error',
                text1: error?.message || sendCodeError?.message || "Invalid Request For OTP",
            });
        }
    }, [mutateAsync, userEmail, startTimer, mobile, type, sendCodeError]);

    const wayToResetPassword = useCallback(async (values: ResetPasswordState) => {
        try {
            const payload =
                type === "email"
                    ? {
                        email: userEmail,
                        code: values.otp,
                        newPassword: values.newPassword,
                    }
                    : {
                        mobile,
                        code: values.otp,
                        newPassword: values.newPassword,
                    };

            await resetMutateAsync(payload);
            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Success",
                mainText: "Congratulation!! You’re success",
                subText: "You can login with new credentials",
                onForward: wayToLogin,
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || resetApiError?.message || "Invalid Email",
            });
        }
    }, [
        mutateAsync,
        navigation,
        resetApiError,
        userEmail,
        mobile,
        type,
    ]);

    const wayToLogin = useCallback(() => {
        navigation.replace(Routes.ONBOARDING.LOGIN);
    }, [navigation]);

    useEffect(() => {
        startTimer(120);
    }, []);

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
                        <Text style={styles.emailInfo}>
                            Enter OTP received in your {type === "email" ? `email ${userEmail}` : `mobile ${mobile}`}
                        </Text>
                    </View>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={ResetSchema}
                        onSubmit={values => wayToResetPassword(values)}
                    >
                        {({
                            values,
                            errors,
                            submitCount,
                            touched,
                            handleChange,
                            handleSubmit,
                            setFieldValue,
                        }) => {
                            const strength = getPasswordStrength(values.newPassword);
                            return (
                                <>
                                    <OtpInput
                                        numberOfDigits={6}
                                        onTextChange={(code) => setFieldValue('otp', code)}
                                        focusColor={errorMsg ? colors.danger.default : colors.text.primary}
                                        type="numeric"
                                        textInputProps={{
                                            caretHidden: true,
                                            contextMenuHidden: true,
                                            selectTextOnFocus: false,
                                            showSoftInputOnFocus: true,
                                            returnKeyType: 'next',
                                        }}
                                        theme={{
                                            containerStyle: styles.otpContainer,
                                            pinCodeTextStyle: styles.pinCodeText,
                                            pinCodeContainerStyle: styles.pinCodeContainer,
                                            focusStickStyle: styles.focusStick,
                                        }}
                                    />
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

                                    {(touched.otp || submitCount > 0) && errors?.otp && !errorMsg && (
                                        <View style={styles.errorWrapper}>
                                            <Text style={styles.errordiff}>
                                                {errors?.otp}
                                            </Text>
                                        </View>
                                    )}

                                    {errorMsg && (
                                        <View style={styles.errorWrapper}>
                                            <Text style={styles.errordiff}>
                                                <Text style={styles.errorText}>Oops, </Text>
                                                {errorMsg}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.inputs}>
                                        <TextInputClassic
                                            label="New Password"
                                            placeholder="Enter Your New Password"
                                            value={values.newPassword}
                                            secureTextEntry
                                            onChangeText={handleChange('newPassword')}
                                            required
                                            error={(touched.newPassword || submitCount > 0) ? errors.newPassword : undefined}
                                            strength={values.newPassword ? strength : null}
                                            returnKeyType="next"
                                        />
                                        <TextInputClassic
                                            label="Re-enter Password"
                                            placeholder="Re-Enter Your Password"
                                            value={values.confirmPassword}
                                            secureTextEntry
                                            onChangeText={handleChange('confirmPassword')}
                                            required
                                            error={(touched.confirmPassword || submitCount > 0) ? errors.confirmPassword : undefined}
                                            returnKeyType="done"
                                        />
                                    </View>

                                    <View style={styles.bottomContainer}>
                                        <View style={styles.signupContainer}>
                                            <Text style={styles.signupText}>Didn't receive the OTP? </Text>
                                            <Pressable
                                                disabled={timer > 0}
                                                onPress={requestForCode}
                                                onPressIn={onPressIn}
                                                onPressOut={onPressOut}
                                            >
                                                <Animated.Text style={[styles.signupLink, timer > 0 && { opacity: 0.5 }, { transform: [{ scale }] }]}>
                                                    Resend OTP
                                                </Animated.Text>
                                            </Pressable>
                                        </View>

                                        <ButtonPrimary
                                            title={ButtonTextTypes.Verify}
                                            width={ButtonWidthTypes.Full}
                                            align={ButtonAlignTypes.Center}
                                            loading={isPending}
                                            disabled={values.otp?.length < 6 || timer <= 0}
                                            onPress={handleSubmit}
                                        />
                                    </View>
                                </>
                            );
                        }}
                    </Formik>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default ResetPassword;
