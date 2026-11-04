import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    TextInput,
} from 'react-native';
import { createStyles } from "./SignUp.style"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { useNavigation } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import GoBack from '../../components/GoBack';
import TextInputClassic, { TextInputType } from '../../components/TextInputClassic';
import { Formik } from 'formik';
import { SignUpSchema } from '../../util/formValidationSchema';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIdentifierApi } from '../../services/hooks/useApi';
import Toast from 'react-native-toast-message';

export interface formSignupState {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
}

const SignUp = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const form = {
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
    };
    const [dialCode, setDialCode] = useState<string>('');
    const { mutateAsync, isPending, error } = useIdentifierApi();
    const lastNameRef = useRef<TextInput | null>(null);
    const emailRef = useRef<TextInput | null>(null);
    const mobileRef = useRef<TextInput | null>(null);

    useEffect(() => {
        const getCountryData = async () => {
            try {
                const dialCodeValue = await AsyncStorage.getItem('dialCode');
                setDialCode(dialCodeValue || '');
            } catch (error) {
                console.log('Failed to load country data', error);
            }
        };

        getCountryData();
    }, []);

    const wayToCreatePassword = useCallback(
        async (values: formSignupState) => {
            try {
                const { email, mobile } = values;

                const response = await mutateAsync({ email, mobile });
                const exists = response?.data?.exists;
                const message =
                    response?.data?.message ||
                    'An account with this email or mobile number already exists.';

                if (exists) {
                    Toast.show({
                        type: 'error',
                        text1: message,
                    });
                    return;
                }

                navigation.navigate(Routes.ONBOARDING.CREATEPASSWORD, values);
            } catch (err: any) {
                const errorMessage =
                    err?.message ||
                    error?.message ||
                    'Failed to create account. Please try again.';

                Toast.show({
                    type: 'error',
                    text1: errorMessage,
                });
            }
        },
        [mutateAsync, navigation, error]
    );

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
                <Formik
                    initialValues={form}
                    validationSchema={SignUpSchema}
                    onSubmit={values => wayToCreatePassword(values)}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                    }) => (
                        <>
                            <KeyboardAwareScrollView
                                contentContainerStyle={{ flexGrow: 1 }}
                                keyboardShouldPersistTaps="always"
                                keyboardDismissMode="none"
                                enableAutomaticScroll
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.inputs}>
                                    <View style={styles.logoContainer}>
                                        <View style={styles.goBack}>
                                            <GoBack />
                                        </View>
                                        <Logo style={styles.logo} width={52} height={52} />
                                    </View>
                                    <View style={styles.details}>
                                        <Text style={styles.title}>Create Your Account</Text>
                                        <Text style={styles.emailInfo}>
                                            Enter your details to get started. It only takes a few minutes...
                                        </Text>
                                    </View>
                                    <TextInputClassic
                                        label="First Name"
                                        placeholder="Enter Your First Name"
                                        value={values.firstName}
                                        onChangeText={handleChange('firstName')}
                                        onBlur={handleBlur('firstName')}
                                        required
                                        error={errors.firstName && touched.firstName ? errors.firstName : undefined}
                                        returnKeyType='next'
                                        onSubmitEditing={() => lastNameRef.current?.focus()}
                                    />
                                    <TextInputClassic
                                        ref={lastNameRef}
                                        label="Last Name"
                                        placeholder="Enter Your Last Name"
                                        value={values.lastName}
                                        onChangeText={handleChange('lastName')}
                                        onBlur={handleBlur('lastName')}
                                        required
                                        error={errors.lastName && touched.lastName ? errors.lastName : undefined}
                                        returnKeyType='next'
                                        onSubmitEditing={() => emailRef.current?.focus()}
                                    />
                                    <TextInputClassic
                                        ref={emailRef}
                                        label="Email"
                                        placeholder="Enter Your Email"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={values.email}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        extraInfo="We'll never share your email"
                                        required
                                        error={errors.email && touched.email ? errors.email : undefined}
                                        returnKeyType='next'
                                        onSubmitEditing={() => mobileRef.current?.focus()}
                                    />
                                    <TextInputClassic
                                        ref={mobileRef}
                                        label="Mobile Number"
                                        placeholder="Enter Your Mobile Number"
                                        type={TextInputType.Mobile}
                                        keyboardType="phone-pad"
                                        value={values.mobile}
                                        dialCode={dialCode}
                                        onChangeText={handleChange('mobile')}
                                        onBlur={handleBlur('mobile')}
                                        required
                                        error={errors.mobile && touched.mobile ? errors.mobile : undefined}
                                        returnKeyType='done'
                                        onSubmitEditing={handleSubmit}
                                    />
                                </View>
                            </KeyboardAwareScrollView>

                            <View style={styles.bottomContainer}>
                                <ButtonPrimary
                                    title={ButtonTextTypes.Confirm}
                                    width={ButtonWidthTypes.Full}
                                    align={ButtonAlignTypes.Center}
                                    loading={isPending}
                                    onPress={handleSubmit}
                                />
                            </View>
                        </>
                    )}
                </Formik>
            </SafeAreaView>
        </ImageBackground>
    )
}

export default SignUp;