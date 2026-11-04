import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import { CompanyKYBStep2Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import moment from "moment";
import { useUpdateCompanyTaxApi } from "../../services/hooks/useApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Step2Props {
    initialValues: Step2FormValues;
    companyId: string;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export interface Step2FormValues {
    panNumber: string;
    gstNumber: string;
    tanNumber: string;
    expiryDate: string;
    placeOfBusinessProofType: string;
}

const proofTypeOptions = [
    { label: "Municipality DOC", value: "Municipality DOC" },
    { label: "Rent Agreement", value: "Rent Agreement" },
    { label: "Utility Bill", value: "Utility Bill" },
];

const Step2: React.FC<Step2Props> = ({ initialValues, companyId, onNext, onBack }) => {
    const { colors } = useTheme();

    const styles = createStyles(colors);
    const { mutateAsync, isPending } = useUpdateCompanyTaxApi();

    const buildCompanyTaxPayload = (values: Step2FormValues) => {
        return {
            panNumber: values.panNumber,
            gstNumber: values.gstNumber,
            tanNumber: values.tanNumber,
            tradeLicenseExpiryDate: moment(
                values.expiryDate,
                "DD/MM/YYYY"
            ).toISOString(),
            placeOfBusinessProofType: values.placeOfBusinessProofType,
        };
    };

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={CompanyKYBStep2Schema}
            onSubmit={async (values) => {
                try {
                    const payload = buildCompanyTaxPayload(values);

                    await mutateAsync({
                        companyId: String(companyId),
                        payload: payload,
                    });

                    await AsyncStorage.multiSet([
                        ["COMPANY_KYB_STEP", "3"],
                    ]);

                    Toast.show({
                        type: "success",
                        text1: "Step 2 Completed Successfully",
                    });

                    onNext(values);
                } catch (error: any) {
                    Toast.show({
                        type: "error",
                        text1: error?.message || "Something went wrong",
                    });
                }
            }}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleSubmit,
                submitCount,
            }) => (
                <>
                    <View style={styles.inputs}>
                        <TextInputClassic
                            label="PAN Number"
                            placeholder="Enter Your PAN Number"
                            value={values.panNumber}
                            onChangeText={handleChange("panNumber")}
                            maxLength={10}
                            required
                            error={(touched.panNumber || submitCount > 0) ? errors.panNumber : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="GST Number (Optional)"
                            placeholder="Enter Your GST Number"
                            value={values.gstNumber}
                            maxLength={15}
                            onChangeText={handleChange("gstNumber")}
                            style={styles.inputStyle}
                            error={(touched.gstNumber || submitCount > 0) ? errors.gstNumber : undefined}
                        />

                        <TextInputClassic
                            label="TAN Number (Optional)"
                            placeholder="Enter Your TAN Number"
                            value={values.tanNumber}
                            onChangeText={handleChange("tanNumber")}
                            error={(touched.tanNumber || submitCount > 0) ? errors.tanNumber : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Trade License Expiry Date"
                            placeholder="DD/MM/YYYY"
                            value={values.expiryDate}
                            type={TextInputType.Date}
                            onChangeText={(v) => setFieldValue("expiryDate", v)}
                            required
                            error={(touched.expiryDate || submitCount > 0) ? errors.expiryDate : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Proof of Place of Business"
                            placeholder="Select The Proof Type"
                            type={TextInputType.Dropdown}
                            value={values.placeOfBusinessProofType}
                            options={proofTypeOptions}
                            required
                            onSelect={(v) => setFieldValue("placeOfBusinessProofType", v)}
                            error={(touched.placeOfBusinessProofType || submitCount > 0) ? errors.placeOfBusinessProofType : undefined}
                            style={styles.inputStyle}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <ButtonSecondary
                            title={ButtonTextTypes.Back}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Right}
                            onPress={() => onBack?.()}
                            buttonStyle={styles.buttonStyleSecondary}
                            textStyle={styles.textStyleSecondary}
                        />
                        <ButtonPrimary
                            title={ButtonTextTypes.Next}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Right}
                            onPress={handleSubmit}
                            loading={isPending}
                            style={styles.buttonStylePrimary}
                            buttonStyle={{ borderRadius: 4 }}
                            textStyle={styles.textStylePrimary}
                        />
                    </View>
                </>
            )
            }
        </Formik>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    inputs: {
        rowGap: 20,
        marginBottom: 18,
        paddingHorizontal: 16,
    },
    inputStyle: {
        borderColor: '#2F2F2F',
    },
    kybDivider: {
        height: 1,
        backgroundColor: "#3A3A3A",
        marginVertical: 10,
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 16,
        columnGap: 10,
        marginHorizontal: 16,
    },
    buttonStyleSecondary: {
        width: '45%',
        borderColor: colors.text.primary,
        borderRadius: 4,
    },
    textStyleSecondary: {
        fontSize: 16,
        color: colors.text.primary,
    },
    buttonStylePrimary: {
        width: '45%',
    },
    textStylePrimary: {
        fontSize: 16,
    },
    checkboxes: {
        marginVertical: 10,
        rowGap: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 16,
    },
    checkText: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
        verticalAlign: 'middle',
    },
})

export default Step2;
