import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    Pressable,
    Animated,
} from 'react-native';
import { createStyles } from "./ForgotPassword.style";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import { useNavigation } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import GoBack from '../../components/GoBack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik, FormikProps } from 'formik';
import { getForgotSchema } from '../../util/formValidationSchema';
import TextInputClassic, { TextInputType } from '../../components/TextInputClassic';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { useForgotApi } from '../../services/hooks/useApi';
import Toast from 'react-native-toast-message';
import { usePressScale } from '../../services/hooks/usePressScale';
import AnimatedTabBar from '../../components/AnimatedTabBar';

const tabs = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
];

const ForgotPassword = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const { mutateAsync, isPending, error } = useForgotApi();
    const { scale, onPressIn, onPressOut } = usePressScale();
    const [dialCode, setDialCode] = useState("+91");
    const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
    const formikRef = useRef<FormikProps<{ email: string; mobile: string }>>(null);

    const wayToResetPassword = useCallback(
        async (values: { email: string; mobile: string }) => {
            try {
                const payload =
                    activeTab === "email"
                        ? { email: values.email }
                        : { mobile: values.mobile };

                await mutateAsync(payload);

                navigation.navigate(Routes.ONBOARDING.RESETPASSWORD, {
                    userEmail: values.email,
                    mobile: values.mobile,
                    type: activeTab,
                });

            } catch (err: any) {
                Toast.show({
                    type: "error",
                    text1: err?.message || error?.message || "Invalid Details",
                });
            }
        },
        [mutateAsync, navigation, error, activeTab]
    );

    const wayToLogin = useCallback(() => {
        navigation.navigate(Routes.ONBOARDING.LOGIN);
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
                        <View style={styles.goBack}>
                            <GoBack />
                        </View>
                        <Logo style={styles.logo} width={52} height={52} />
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.emailInfo}>
                            Securely recover your account
                        </Text>
                    </View>

                    <View style={styles.animatedTabs}>
                        <AnimatedTabBar
                            tabs={tabs}
                            activeKey={activeTab}
                            onChange={(key) => {
                                setActiveTab(key as "email" | "phone");
                                formikRef.current?.setFieldValue("email", "");
                                formikRef.current?.setFieldValue("mobile", "");
                            }}
                            variant="fixed"
                            indicatorColor="#2A5A8D"
                            activeTextColor="#FFFFFF"
                            inactiveTextColor={colors.isLight ? colors.constant.white : "#2A5A8D"}
                        />
                    </View>

                    <Formik
                        innerRef={formikRef}
                        initialValues={{ email: '', mobile: '' }}
                        validationSchema={getForgotSchema(activeTab)}
                        onSubmit={(values) => wayToResetPassword(values)}
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
                            <View style={styles.inputs}>
                                {activeTab === 'email' ? (
                                    <TextInputClassic
                                        label="Email Address"
                                        placeholder="Enter Your Email Address"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={values.email}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        required
                                        error={errors.email && touched.email ? errors.email : undefined}
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
                                        required
                                        error={errors.mobile && touched.mobile ? errors.mobile : undefined}
                                    />
                                )}

                                <View style={styles.bottomContainer}>
                                    <View style={styles.signupContainer}>
                                        <Text style={styles.signupText}>Already a member? </Text>
                                        <Pressable
                                            onPress={wayToLogin}
                                            onPressIn={onPressIn}
                                            onPressOut={onPressOut}
                                        >
                                            <Animated.Text style={[styles.signupLink, { transform: [{ scale }] }]}>
                                                Login Here
                                            </Animated.Text>
                                        </Pressable>
                                    </View>

                                    <ButtonPrimary
                                        title={ButtonTextTypes.Generate_OTP}
                                        width={ButtonWidthTypes.Full}
                                        align={ButtonAlignTypes.Center}
                                        onPress={handleSubmit}
                                        loading={isPending}
                                    />
                                </View>
                            </View>
                        )
                        }
                    </Formik>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default ForgotPassword;