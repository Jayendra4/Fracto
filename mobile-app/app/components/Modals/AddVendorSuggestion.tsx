import React, { useCallback, useEffect, useState } from "react";
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
import TextInputClassic, { TextInputType } from "../TextInputClassic";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import { Formik } from "formik";
import { AddVendorSuggestionSchema } from "../../util/formValidationSchema";
import { useAddVendorSuggestionApi } from "../../services/hooks/useApi";
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

interface AddVendorSuggestionPayload {
    vendorName: string;
    category: string;
    description: string;
    website: string;
    email: string;
    mobile: string;
}

const categoryOptions = [
    { label: "Legal", value: "Legal" },
    { label: "Valuation", value: "Valuation" },
    { label: "Audit", value: "Audit" },
    { label: "Trustee", value: "Trustee" },
    { label: "Compliance", value: "Compliance" },
];

const AddVendorSuggestion = ({ visible, onClose, onAction }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const { mutateAsync, isPending, error } = useAddVendorSuggestionApi();
    const [dialCode, setDialCode] = useState("+91");

    const initialValues: AddVendorSuggestionPayload = {
        vendorName: "",
        category: "",
        description: "",
        website: "",
        email: "",
        mobile: "",
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

    const addBankAccount = useCallback(async (values: AddVendorSuggestionPayload) => {
        try {
            await mutateAsync(values);
            onClose();
            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Success",
                subText: "Your suggestion has been submitted successfully. It will appear in the list once approved by the admin.",
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
        navigation.replace(Routes.TABS.HOME, {
            screen: Routes.TABS.PROPERTY,
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
                        <Text style={styles.title}>Add Suggestion</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                            <Feather name="x" size={16} color={colors.icon.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={AddVendorSuggestionSchema}
                        onSubmit={(values) => addBankAccount(values)}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
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
                                            case "vendorName":
                                                return (
                                                    <TextInputClassic
                                                        label="Vendor Name"
                                                        placeholder="Enter The Vendor Name"
                                                        value={values.vendorName}
                                                        onChangeText={handleChange("vendorName")}
                                                        onBlur={handleBlur("vendorName")}
                                                        error={errors.vendorName && touched.vendorName ? errors.vendorName : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={styles.inputField}
                                                        inputStyle={styles.inputText}
                                                        required
                                                        activateMini
                                                    />
                                                );

                                            case "category":
                                                return (
                                                    <TextInputClassic
                                                        label="Category"
                                                        placeholder="Select Your Category"
                                                        value={values.category}
                                                        options={categoryOptions}
                                                        onSelect={(v) => setFieldValue("category", v)}
                                                        type={TextInputType.Dropdown}
                                                        onBlur={handleBlur("category")}
                                                        error={errors.category && touched.category ? errors.category : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={styles.inputField}
                                                        inputStyle={styles.inputText}
                                                        required
                                                        activateMini
                                                    />
                                                );

                                            case "description":
                                                return (
                                                    <TextInputClassic
                                                        label="Description"
                                                        placeholder="Brief Description Of Services"
                                                        value={values.description}
                                                        onChangeText={handleChange("description")}
                                                        onBlur={handleBlur("description")}
                                                        error={errors.description && touched.description ? errors.description : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={[styles.inputField, { height: 60, alignItems: 'flex-start' }]}
                                                        inputStyle={styles.inputText}
                                                        activateMini
                                                        multiline
                                                    />
                                                );

                                            case "website":
                                                return (
                                                    <TextInputClassic
                                                        label="Website"
                                                        placeholder="https://example.com"
                                                        value={values.website}
                                                        onChangeText={handleChange("website")}
                                                        onBlur={handleBlur("website")}
                                                        error={errors.website && touched.website ? errors.website : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={styles.inputField}
                                                        inputStyle={styles.inputText}
                                                        activateMini
                                                    />
                                                );

                                            case "email":
                                                return (
                                                    <TextInputClassic
                                                        label="Email"
                                                        placeholder="Contact@example.com"
                                                        value={values.email}
                                                        onChangeText={handleChange("email")}
                                                        onBlur={handleBlur("email")}
                                                        error={errors.email && touched.email ? errors.email : undefined}
                                                        labelStyle={styles.labelInput}
                                                        style={styles.inputField}
                                                        inputStyle={styles.inputText}
                                                        required
                                                        activateMini
                                                    />
                                                );

                                            case "mobile":
                                                return (
                                                    <TextInputClassic
                                                        label="Mobile"
                                                        placeholder="Enter Mobile Number"
                                                        value={values.mobile}
                                                        type={TextInputType.Mobile}
                                                        keyboardType="phone-pad"
                                                        onChangeText={handleChange("mobile")}
                                                        onBlur={handleBlur("mobile")}
                                                        dialCode={dialCode}
                                                        selectDialCode={(val) => {
                                                            setDialCode(val);
                                                            setFieldValue('mobile', '');
                                                        }}
                                                        error={errors.mobile && touched.mobile ? errors.mobile : undefined}
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
                                            title={ButtonTextTypes.Submit_Suggestion}
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

export default AddVendorSuggestion;

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
        height: 36,
        marginTop: 10,
    },
    textStyles: {
        fontSize: 14,
    },
});
