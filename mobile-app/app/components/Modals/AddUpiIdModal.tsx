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
import { AddUPIIDSchema } from "../../util/formValidationSchema";
import { useAddUpiIDApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { refreshUser } from "../../store/authSlice";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { toastConfig } from "../../util/toast";

interface Props {
    visible: boolean;
    onClose: () => void;
    onAction?: () => void;
}

interface AddUpiAccountPayload {
    upiId: string;
}

const AddUpiIdModal = ({ visible, onClose, onAction }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const { mutateAsync, isPending, error } = useAddUpiIDApi();

    const initialValues: AddUpiAccountPayload = {
        upiId: "",
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

    const addUpiAccount = useCallback(async (values: AddUpiAccountPayload) => {
        try {
            await mutateAsync({
                upiId: values.upiId,
            });
            onClose();
            dispatch(refreshUser());
            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Success",
                mainText: "UPI ID Added Successfully",
                subText: "Your UPI ID has been added successfully.",
                onForward,
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || error?.message || 'Invalid Request',
            });
        }
    }, [mutateAsync, error, dispatch, navigation, onClose]);

    const onForward = useCallback(() => {
        if (onAction) return onAction();
        navigation.goBack();
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
                        <Text style={styles.title}>Add Your UPI ID</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                            <Feather name="x" size={16} color={colors.icon.primary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>
                        We need to add your UPI ID to start your investment journey
                    </Text>

                    <View style={styles.divider} />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={AddUPIIDSchema}
                        onSubmit={(values) => addUpiAccount(values)}
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
                                            case "upiId":
                                                return (
                                                    <TextInputClassic
                                                        label="UPI ID"
                                                        placeholder="Enter Your UPI ID"
                                                        value={values.upiId}
                                                        onChangeText={handleChange("upiId")}
                                                        onBlur={handleBlur('upiId')}
                                                        error={errors.upiId && touched.upiId ? errors.upiId : undefined}
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

export default AddUpiIdModal;

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
