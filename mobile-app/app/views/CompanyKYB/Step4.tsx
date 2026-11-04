import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import { CompanyKYBStep4Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import { Colors, useTheme } from "../../util/theme";
import FileUpload from "../../components/FileUpload";
import { useUploadCompanyDocumentsApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Step4Props {
    companyId: string;
    initialValues: Step4FormValues;
    onNext: () => void;
    onBack?: () => void;
}

export interface Step4FormValues {
    auditedFinancials: any | null;
    netWorthCertificate: any | null;
    businessPanCard: any | null;
    gstCertificate: any | null;
    tradeLicense: any | null;
    certificateOfIncorporation: any | null;
    moa: any | null;
    aoa: any | null;
    companyPan: any | null;
    registeredAddressProofFile: any | null;

    shareholdingPattern: string;
    registeredAddressProofType: string;
    authorizeHouseOfFrac: string;
    authorizedSignatoryName: string;
}

const Step4: React.FC<Step4Props> = ({ companyId, initialValues, onNext, onBack }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { mutateAsync, isPending } = useUploadCompanyDocumentsApi()

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={CompanyKYBStep4Schema}
            onSubmit={async (values, { validateForm }) => {
                const validationErrors = await validateForm();

                if (Object.keys(validationErrors).length > 0) {
                    const firstError = Object.values(validationErrors)[0];
                    Toast.show({
                        type: "error",
                        text1: "Validation Error",
                        text2: String(firstError),
                    });
                    return;
                }

                try {
                    const documents = [
                        { documentTypeCode: "certificate_of_incorporation", file: values.certificateOfIncorporation },
                        { documentTypeCode: "moa", file: values.moa },
                        { documentTypeCode: "aoa", file: values.aoa },
                        { documentTypeCode: "company_pan", file: values.companyPan },
                        { documentTypeCode: "gst_certificate", file: values.gstCertificate },
                        { documentTypeCode: "trade_license", file: values.tradeLicense },
                        { documentTypeCode: "registered_address_proof", file: values.registeredAddressProofFile },
                    ].filter(d => d.file);

                    await mutateAsync({
                        companyId: String(companyId),
                        documents,
                    });

                    Toast.show({
                        type: "success",
                        text1: "compnay KYB is submitted",
                    });
                    await AsyncStorage.setItem("COMPANY_KYB_COMPLETED", "true");

                    onNext();
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
                setFieldValue,
                handleChange,
                handleSubmit,
                submitCount,
            }) => (
                <>
                    <View style={styles.inputs}>
                        <FileUpload
                            label="Certificate of Incorporation"
                            required
                            value={values.certificateOfIncorporation}
                            onSelect={(f) => setFieldValue("certificateOfIncorporation", f)}
                            error={
                                (touched.certificateOfIncorporation || submitCount > 0) &&
                                    typeof errors.certificateOfIncorporation === "string"
                                    ? errors.certificateOfIncorporation
                                    : undefined
                            }
                        />

                        <FileUpload
                            label="MoA (Memorandum of Association)"
                            required
                            value={values.moa}
                            onSelect={(f) => setFieldValue("moa", f)}
                            error={
                                (touched.moa || submitCount > 0) &&
                                    typeof errors.moa === "string"
                                    ? errors.moa
                                    : undefined
                            }
                        />

                        <FileUpload
                            label="AoA (Articles of Association)"
                            required
                            value={values.aoa}
                            onSelect={(f) => setFieldValue("aoa", f)}
                            error={(touched.aoa || submitCount > 0) && typeof errors.aoa === "string" ? errors.aoa : undefined}
                        />

                        <FileUpload
                            label="Company PAN"
                            required
                            value={values.companyPan}
                            onSelect={(f) => setFieldValue("companyPan", f)}
                            error={(touched.companyPan || submitCount > 0) && typeof errors.companyPan === "string" ? errors.companyPan : undefined}
                        />

                        <FileUpload
                            label="GST Certificate"
                            required
                            value={values.gstCertificate}
                            onSelect={(f) => setFieldValue("gstCertificate", f)}
                            error={
                                (touched.gstCertificate || submitCount > 0) &&
                                    typeof errors.gstCertificate === "string"
                                    ? errors.gstCertificate
                                    : undefined
                            }
                        />

                        <FileUpload
                            label="Trade License"
                            required
                            value={values.tradeLicense}
                            onSelect={(f) => setFieldValue("tradeLicense", f)}
                            error={(touched.tradeLicense || submitCount > 0) && typeof errors.tradeLicense === "string" ? errors.tradeLicense : undefined}
                        />

                        <TextInputClassic
                            label="Registered Address Proof"
                            type={TextInputType.Radio}
                            options={[
                                { label: "Tax receipt", value: "Tax receipt" },
                                { label: "Utility bill", value: "Utility bill" },
                            ]}
                            required
                            value={values.registeredAddressProofType}
                            onSelect={(v) => setFieldValue("registeredAddressProofType", v)}
                            error={(touched.registeredAddressProofType || submitCount > 0)
                                ? errors.registeredAddressProofType
                                : undefined}
                            disabled={!!values.registeredAddressProofFile}
                        />

                        <FileUpload
                            value={values.registeredAddressProofFile}
                            onSelect={(f) => setFieldValue("registeredAddressProofFile", f)}
                            error={
                                (touched.registeredAddressProofFile || submitCount > 0) &&
                                    typeof errors.registeredAddressProofFile === "string"
                                    ? errors.registeredAddressProofFile
                                    : undefined
                            }
                            disabled={!values.registeredAddressProofType}
                        />

                        <FileUpload
                            label="Audited Financials"
                            value={values.auditedFinancials}
                            onSelect={(f) => setFieldValue("auditedFinancials", f)}
                            error={
                                (touched.auditedFinancials || submitCount > 0) &&
                                    typeof errors.auditedFinancials === "string"
                                    ? errors.auditedFinancials
                                    : undefined
                            }
                            required
                        />

                        <FileUpload
                            label="Net Worth Certificate"
                            value={values.netWorthCertificate}
                            onSelect={(f) => setFieldValue("netWorthCertificate", f)}
                            error={
                                (touched.netWorthCertificate || submitCount > 0) &&
                                    typeof errors.netWorthCertificate === "string"
                                    ? errors.netWorthCertificate
                                    : undefined
                            }
                            required
                        />

                        <TextInputClassic
                            label="Shareholding Pattern"
                            placeholder="Enter Shareholding Pattern"
                            required
                            value={values.shareholdingPattern}
                            onChangeText={handleChange("shareholdingPattern")}
                            error={(touched.shareholdingPattern || submitCount > 0)
                                ? errors.shareholdingPattern
                                : undefined}
                        />

                        <ImageBackground
                            source={require("../../assets/images/digi-sign.png")}
                            style={styles.imgBg}
                            resizeMode="cover"
                        >
                            <View style={styles.digiHeaderWrapper}>
                                <Text style={styles.digiSignTitle}>
                                    Board Resolution (digi sign)
                                </Text>
                                <Text style={styles.digiSignSubTitle}>
                                    Complete the board resolution and digitally sign it in just a few minutes.
                                </Text>
                            </View>
                            <TextInputClassic
                                label="Authorizing Company to register on House of Frac"
                                type={TextInputType.Radio}
                                options={[
                                    { label: "Yes", value: "Yes" },
                                    { label: "No", value: "No" },
                                ]}
                                labelStyle={{ color: colors.constant.white }}
                                required
                                value={values.authorizeHouseOfFrac}
                                onSelect={(v) => setFieldValue("authorizeHouseOfFrac", v)}
                                error={(touched.authorizeHouseOfFrac || submitCount > 0)
                                    ? errors.authorizeHouseOfFrac
                                    : undefined}
                            />

                            <TextInputClassic
                                label="Name of Authorized Signatory"
                                placeholder="Enter Authorized Signatory Name"
                                required={values.authorizeHouseOfFrac === "Yes"}
                                value={values.authorizedSignatoryName}
                                onChangeText={handleChange("authorizedSignatoryName")}
                                labelStyle={{ color: colors.constant.white }}
                                inputStyle={{ color: colors.constant.white }}
                                error={(touched.authorizedSignatoryName || submitCount > 0)
                                    ? errors.authorizedSignatoryName
                                    : undefined}
                            />
                        </ImageBackground>
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
            )}
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
    imgBg: {
        width: 'auto',
        height: 399,
        borderRadius: 6,
        overflow: 'hidden',
        paddingVertical: 32,
        paddingHorizontal: 12,
        rowGap: 16,
    },
    digiHeaderWrapper: {
        alignItems: 'center',
    },
    digiSignTitle: {
        color: colors.constant.white,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        textAlign: 'center',
    },
    digiSignSubTitle: {
        color: "#F5F5F5B2",
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
    },
})

export default Step4;
