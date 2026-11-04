import React, { useCallback, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    BackHandler,
} from "react-native";
import { Colors, useTheme } from "../../util/theme";
import Feather from "react-native-vector-icons/Feather"
import TextInputClassic from "../TextInputClassic";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import { Formik } from "formik";
import { ChangePasswordSchema } from "../../util/formValidationSchema";
import { useChangePasswordApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { toastConfig } from "../../util/toast";

interface Props {
    visible: boolean;
    onClose: () => void;
    onAction?: () => void;
}

interface ChangePassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const ChangePassword = ({ visible, onClose, onAction }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const { mutateAsync, isPending, error } = useChangePasswordApi();

    const initialValues: ChangePassword = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    };

    useEffect(() => {
        if (visible) {
            const backAction = () => {
                onClose();
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );

            return () => backHandler.remove();
        }
    }, [visible, onClose]);

    const addBankAccount = useCallback(async (values: ChangePassword) => {
        try {
            await mutateAsync({
                oldPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            onClose();
            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Success",
                mainText: "Password Changed Successfully",
                subText: "Your password has been changed successfully.",
                onForward,
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || error?.message || 'Something went wrong',
            });
        }
    }, [mutateAsync, error, dispatch, navigation, onClose]);

    const onForward = useCallback(() => {
        if (onAction) return onAction();
        navigation.replace(Routes.TABS.HOME, {
            screen: Routes.TABS.FUNDS,
        });
    }, [navigation, onAction]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
                <View style={[styles.container, { backgroundColor: colors.background.slightly }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Change Password</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                            <Feather name="x" size={16} color={colors.icon.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={ChangePasswordSchema}
                        onSubmit={(values) => addBankAccount(values)}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                        }) => (
                            <>
                                <FlatList
                                    data={Object.keys(initialValues)}
                                    keyExtractor={(item) => item}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={[styles.inputs, styles.scrollContent]}
                                    renderItem={({ item }) => {
                                        switch (item) {
                                            case "currentPassword":
                                                return (
                                                    <TextInputClassic
                                                        label="Current Password"
                                                        placeholder="Enter Your Current Password"
                                                        value={values.currentPassword}
                                                        onChangeText={handleChange("currentPassword")}
                                                        onBlur={handleBlur('currentPassword')}
                                                        error={errors.currentPassword && touched.currentPassword ? errors.currentPassword : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={styles.inputField}
                                                        inputStyle={styles.inputText}
                                                        required
                                                        activateMini
                                                    />
                                                );
                                            case "newPassword":
                                                return (
                                                    <TextInputClassic
                                                        label="New Password"
                                                        placeholder="Enter Your New Password"
                                                        value={values.newPassword}
                                                        onChangeText={handleChange("newPassword")}
                                                        onBlur={handleBlur('newPassword')}
                                                        error={errors.newPassword && touched.newPassword ? errors.newPassword : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={styles.inputField}
                                                        inputStyle={styles.inputText}
                                                        required
                                                        activateMini
                                                    />
                                                );
                                            case "confirmPassword":
                                                return (
                                                    <TextInputClassic
                                                        label="Confirm Password"
                                                        placeholder="Confirm Your New Password"
                                                        value={values.confirmPassword}
                                                        onChangeText={handleChange("confirmPassword")}
                                                        onBlur={handleBlur('confirmPassword')}
                                                        error={errors.confirmPassword && touched.confirmPassword ? errors.confirmPassword : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={styles.inputField}
                                                        inputStyle={styles.inputText}
                                                        required
                                                        activateMini
                                                    />
                                                );
                                            default:
                                                return null;
                                        }
                                    }}
                                    ListFooterComponent={
                                        <ButtonPrimary
                                            title={ButtonTextTypes.Continue}
                                            width={ButtonWidthTypes.Full}
                                            align={ButtonAlignTypes.Center}
                                            buttonStyle={styles.buttonStyle}
                                            textStyle={styles.textStyles}
                                            loading={isPending}
                                            onPress={handleSubmit}
                                        />
                                    }
                                />
                            </>
                        )}
                    </Formik>
                </View>
                <Toast position="bottom" visibilityTime={1500} config={toastConfig} />
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ChangePassword;

const createStyles = (colors: Colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "85%",
        maxHeight: "85%",
        borderRadius: 8,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 15,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    subtitle: {
        fontSize: 9,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Regular',
    },
    divider: {
        width: '100%',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#343F4B',
        marginVertical: 14,
    },
    scrollContent: {
        paddingBottom: 10,
    },
    labelInput: {
        fontFamily: 'WorkSans-Medium',
        fontSize: 14,
        color: colors.text.default,
        marginBottom: 6,
    },
    inputs: {
        rowGap: 20,
    },
    inputField: {
        borderWidth: 0.8,
        height: 40,
        borderRadius: 3,
    },
    inputText: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
    },
    buttonStyle: {
        borderRadius: 3,
        height: 40,
        marginTop: 10,
    },
    textStyles: {
        fontSize: 16,
    },
});
