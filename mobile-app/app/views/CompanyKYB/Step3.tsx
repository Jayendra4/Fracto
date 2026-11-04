import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import { CompanyKYBStep3Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import { useUpdateCompanyMetaApi } from "../../services/hooks/useApi";


interface Step3Props {
    initialValues: Step3FormValues;
    companyId: string;
    onNext: (data: any) => void;
    onBack?: () => void;
}

export interface Step3FormValues {
    natureOfBusiness: string
    countriesOfOperation: string
    expectedMonthlyTransactionVolume: string
    expectedSourceOfFunds: string
    businessDescription: string
    isCompanyPubliclyListed: string
}

const countriesOptions = [
    { label: "India", value: "India" },
    { label: "UAE", value: "UAE" },
];

const transactionVolumeOptions = [
    { label: "Below ₹10 Lakhs", value: "1000000" },
    { label: "₹10L – ₹50L", value: "5000000" },
    { label: "₹50L – ₹1Cr", value: "10000000" },
    { label: "₹1Cr – ₹50Cr", value: "50000000" },
    { label: "Above ₹50Cr", value: "100000000" },
];

const sourceOfFundsOptions = [
    { label: "Internal Accruals", value: "InternalAccruals" },
    { label: "Investors", value: "Investors" },
    { label: "VC", value: "Vc" },
    { label: "Borrowings", value: "Borrowings" },
    { label: "Others", value: "Others" },
];

const Step3: React.FC<Step3Props> = ({ initialValues, companyId, onNext, onBack }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { mutateAsync, isPending } = useUpdateCompanyMetaApi();

    const buildCompanyMetaPayload = (values: Step3FormValues) => {
        return {
            natureOfBusiness: values.natureOfBusiness,
            businessDescription: values.businessDescription,
            expectedMonthlyTransactionVolume: Number(values.expectedMonthlyTransactionVolume),
            expectedSourceOfFunds: values.expectedSourceOfFunds,
            countriesOfOperation: values.countriesOfOperation
                ? [values.countriesOfOperation]
                : [],

            isCompanyPubliclyListed: values.isCompanyPubliclyListed === "Yes",
        };
    };

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={CompanyKYBStep3Schema}
            onSubmit={async (values) => {
                try {
                    const payload = buildCompanyMetaPayload(values)

                    await mutateAsync({
                        companyId: String(companyId),
                        payload,
                    })

                    Toast.show({
                        type: "success",
                        text1: "Step 3 Completed Successfully",
                    })

                    onNext(values)
                } catch (error: any) {
                    Toast.show({
                        type: "error",
                        text1: error?.message || "Something went wrong",
                    })
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
                            label="Nature of Business"
                            placeholder="Enter The Business Category"
                            value={values.natureOfBusiness}
                            onChangeText={handleChange("natureOfBusiness")}
                            required
                            error={(touched.natureOfBusiness || submitCount > 0) ? errors.natureOfBusiness : undefined}
                        />

                        <TextInputClassic
                            label="Countries of Operation"
                            placeholder="Select The Country Of Operation"
                            type={TextInputType.Dropdown}
                            options={countriesOptions}
                            value={values.countriesOfOperation}
                            required
                            onSelect={(v) => setFieldValue("countriesOfOperation", v)}
                            error={
                                (touched.countriesOfOperation || submitCount > 0) &&
                                    typeof errors.countriesOfOperation === "string"
                                    ? errors.countriesOfOperation
                                    : undefined
                            } />

                        <TextInputClassic
                            label="Expected Monthly Transaction Volume"
                            placeholder="Select The Range"
                            type={TextInputType.Dropdown}
                            options={transactionVolumeOptions}
                            value={values.expectedMonthlyTransactionVolume}
                            required
                            onSelect={(v) => setFieldValue("expectedMonthlyTransactionVolume", v)}
                            error={(touched.expectedMonthlyTransactionVolume || submitCount > 0) ? errors.expectedMonthlyTransactionVolume : undefined}
                        />

                        <TextInputClassic
                            label="Expected Source Of Funds"
                            placeholder="Select The Source Of Funds"
                            type={TextInputType.Dropdown}
                            options={sourceOfFundsOptions}
                            value={values.expectedSourceOfFunds}
                            required
                            onSelect={(v) => setFieldValue("expectedSourceOfFunds", v)}
                            error={(touched.expectedSourceOfFunds || submitCount > 0) ? errors.expectedSourceOfFunds : undefined}
                        />

                        <TextInputClassic
                            label="Business Description"
                            placeholder="Describe Your Company's Products/Services"
                            value={values.businessDescription}
                            multiline
                            required
                            onChangeText={handleChange("businessDescription")}
                            error={(touched.businessDescription || submitCount > 0) ? errors.businessDescription : undefined}
                            style={{ height: 120, alignItems: 'flex-start' }}
                        />

                        <TextInputClassic
                            label="Is Your Company Publicly Listed?"
                            type={TextInputType.Radio}
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' },
                            ]}
                            value={values.isCompanyPubliclyListed}
                            required
                            onSelect={(v) => setFieldValue('isCompanyPubliclyListed', v)}
                            error={(touched.isCompanyPubliclyListed || submitCount > 0) ? errors.isCompanyPubliclyListed : undefined}
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
        flex: 1,
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

export default Step3;
