import React, { useCallback, useRef } from 'react';
import {
    View,
    Text,
    ImageBackground,
    TextInput,
} from 'react-native';
import { createStyles } from "./CreatePassword.style"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import GoBack from '../../components/GoBack';
import TextInputClassic from '../../components/TextInputClassic';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import { PasswordSchema } from '../../util/formValidationSchema';
import { getPasswordStrength } from '../../constant/password';

export interface CreatePasswordState {
    password: string;
    confirmPassword: string;
}

const CreatePassword = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const routes = useRoute();
    const initialValues: CreatePasswordState = {
        password: '',
        confirmPassword: '',
    };
    const confirmPasswordRef = useRef<TextInput | null>(null);

    const wayToDualVerification = useCallback(
        (values: CreatePasswordState) => {
            navigation.navigate(Routes.ONBOARDING.DUALOTPVERIFICATION, {
                ...routes?.params,
                ...values,
            });
        }, [navigation, routes?.params]);

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
                        <Text style={styles.title}>Create Your Account</Text>
                        <Text style={styles.emailInfo}>
                            Enter your details to get started. It only takes a few minutes...
                        </Text>
                    </View>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={PasswordSchema}
                        onSubmit={values => wayToDualVerification(values)}
                    >
                        {({
                            values,
                            errors,
                            submitCount,
                            touched,
                            handleChange,
                            handleSubmit,
                        }) => {
                            const strength = getPasswordStrength(values.password);
                            return (
                                <>
                                    <View style={styles.inputs}>
                                        <TextInputClassic
                                            label="Create Password"
                                            placeholder="Enter Strong Password"
                                            value={values.password}
                                            secureTextEntry
                                            onChangeText={handleChange('password')}
                                            required
                                            error={(touched.password || submitCount > 0) ? errors.password : undefined}
                                            strength={values.password ? strength : null}
                                            returnKeyType='next'
                                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                        />
                                        <TextInputClassic
                                            ref={confirmPasswordRef}
                                            label="Re-enter Password"
                                            placeholder="Re-Enter Your Password"
                                            value={values.confirmPassword}
                                            secureTextEntry
                                            onChangeText={handleChange('confirmPassword')}
                                            required
                                            error={(touched.confirmPassword || submitCount > 0) ? errors.confirmPassword : undefined}
                                            returnKeyType='done'
                                            onSubmitEditing={handleSubmit}
                                        />
                                    </View>

                                    <View style={styles.passwordRules}>
                                        <Text style={styles.rulesTitle}>Passwords should have:</Text>

                                        <View style={styles.ruleItemRow}>
                                            <View
                                                style={[
                                                    styles.dot,
                                                    values.password?.length >= 8 && styles.validDot,
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.ruleItem,
                                                    values.password?.length >= 8 && styles.ruleValid,
                                                ]}
                                            >
                                                Minimum length at 8 characters
                                            </Text>
                                        </View>

                                        <View style={styles.ruleItemRow}>
                                            <View
                                                style={[
                                                    styles.dot,
                                                    /[A-Z]/.test(values.password) && styles.validDot,
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.ruleItem,
                                                    /[A-Z]/.test(values.password) && styles.ruleValid,
                                                ]}
                                            >
                                                At least one uppercase character is required
                                            </Text>
                                        </View>

                                        <View style={styles.ruleItemRow}>
                                            <View
                                                style={[
                                                    styles.dot,
                                                    /[a-z]/.test(values.password) && styles.validDot,
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.ruleItem,
                                                    /[a-z]/.test(values.password) && styles.ruleValid,
                                                ]}
                                            >
                                                At least one lowercase character is required
                                            </Text>
                                        </View>

                                        <View style={styles.ruleItemRow}>
                                            <View
                                                style={[
                                                    styles.dot,
                                                    /\d/.test(values.password) && styles.validDot,
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.ruleItem,
                                                    /\d/.test(values.password) && styles.ruleValid,
                                                ]}
                                            >
                                                Number character(s) is required
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.bottomContainer}>
                                        <ButtonPrimary
                                            title={ButtonTextTypes.Confirm}
                                            width={ButtonWidthTypes.Full}
                                            align={ButtonAlignTypes.Center}
                                            onPress={handleSubmit}
                                        />
                                    </View>
                                </>
                            )
                        }}
                    </Formik>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ImageBackground>
    )
};

export default CreatePassword;