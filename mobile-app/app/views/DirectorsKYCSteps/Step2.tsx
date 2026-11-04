import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Formik } from "formik";
import { DirectorsKYCStep2Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import { Colors, useTheme } from "../../util/theme";
import FileUpload from "../../components/FileUpload";
import { useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import CameraModal from "../../util/CameraModal";
import CameraCapture from "../../components/CameraCapture";
import { useSubmitDirectorDocumentsApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";

interface Step2Props {
    onNext: (data: any) => void;
    onBack?: () => void;
    initialValues: any;
    directorId?: string;
    companyId?: string;
}

export interface DirectorStep2FormValues {
    panCard: any;
    passport: any;
    addressProofType: string;
    addressProofFile: any;
    passportSizePhoto: any;
    secondaryIdType: string;
    secondaryIdFile: any;
    businessPanCard: any;
    selfiePhoto: any;
}

const Step2: React.FC<Step2Props> = ({ onNext, onBack, initialValues, directorId, companyId }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { hasPermission, requestPermission } = useCameraPermission();
    const [cameraVisible, setCameraVisible] = useState(false);
    const device = useCameraDevice("front");
    const { mutateAsync } = useSubmitDirectorDocumentsApi();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={DirectorsKYCStep2Schema}
            onSubmit={async (values) => {
                if (!directorId || !companyId) {
                    return Toast.show({
                        type: "error",
                        text1: "Missing IDs",
                    });
                }

                try {
                    setIsLoading(true);

                    const documents = [
                        { documentTypeCode: "pan_indian", file: values.panCard },
                        { documentTypeCode: "address_proof", file: values.addressProofFile },
                        { documentTypeCode: "passport_size_photo", file: values.passportSizePhoto },
                        { documentTypeCode: "secondary_id", file: values.secondaryIdFile },
                        { documentTypeCode: "selfie", file: values.selfiePhoto },
                    ].filter((d) => d.file);

                    await mutateAsync({
                        companyId,
                        directorId,
                        documents,
                    });

                    Toast.show({
                        type: "success",
                        text1: "Documents Uploaded Successfully",
                    });

                    onNext({
                        directorId: String(directorId),
                        formData: values,
                    });

                } catch (error: any) {
                    Toast.show({
                        type: "error",
                        text1: error?.message,
                    });
                } finally {
                    setIsLoading(false);
                }
            }}
        >
            {({
                values,
                errors,
                touched,
                setFieldValue,
                handleSubmit,
                submitCount,
            }) => (
                <>
                    <View style={styles.inputs}>
                        <FileUpload
                            label="PAN Card"
                            required
                            value={values.panCard}
                            onSelect={(f) => setFieldValue("panCard", f)}
                            error={(touched.panCard || submitCount > 0) ? (errors.panCard as string) : undefined}
                        />

                        <TextInputClassic
                            label="Address Proof"
                            type={TextInputType.Radio}
                            required
                            options={[
                                { label: "Bank statement", value: "Bank statement" },
                                { label: "Utility bill", value: "Utility bill" },
                                { label: "Aadhaar XML", value: "Aadhaar XML" },
                            ]}
                            value={values.addressProofType}
                            onSelect={(v) => setFieldValue("addressProofType", v)}
                            error={
                                (touched.addressProofType || submitCount > 0)
                                    ? (errors.addressProofType as string)
                                    : undefined
                            }
                            disabled={!!values.addressProofFile}
                        />

                        <FileUpload
                            required
                            value={values.addressProofFile}
                            onSelect={(f) => setFieldValue("addressProofFile", f)}
                            error={(touched.addressProofFile || submitCount > 0) ? (errors.addressProofFile as string) : undefined}
                            disabled={!values.addressProofType}
                        />

                        <TextInputClassic
                            label="Secondary ID"
                            type={TextInputType.Radio}
                            options={[
                                { label: "Passport", value: "Passport" },
                                { label: "License", value: "License" },
                                { label: "Aadhaar", value: "Aadhaar" },
                                { label: "Voter", value: "Voter" },
                            ]}
                            value={values.secondaryIdType}
                            onSelect={(v) => setFieldValue("secondaryIdType", v)}
                            disabled={!!values.secondaryIdFile}
                            required
                            error={
                                (touched.secondaryIdType || submitCount > 0)
                                    ? (errors.secondaryIdType as string)
                                    : undefined
                            }
                        />

                        <FileUpload
                            value={values.secondaryIdFile}
                            onSelect={(f) => setFieldValue("secondaryIdFile", f)}
                            disabled={!values.secondaryIdType}
                            error={
                                (touched.secondaryIdFile || submitCount > 0)
                                    ? (errors.secondaryIdFile as string)
                                    : undefined
                            }
                        />

                        <FileUpload
                            label="Passport Size Photo (Optional)"
                            value={values.passportSizePhoto}
                            onSelect={(f) => setFieldValue("passportSizePhoto", f)}
                        />

                        <CameraCapture
                            value={values.selfiePhoto}
                            required
                            error={(touched.selfiePhoto || submitCount > 0) ? (errors.selfiePhoto as string) : undefined}
                            onRemove={() => setFieldValue("selfiePhoto", null)}
                            onOpenCamera={async () => {
                                if (!hasPermission) {
                                    const granted = await requestPermission();
                                    if (!granted) return;
                                }
                                setCameraVisible(true);
                            }}
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
                            loading={isLoading}
                            style={styles.buttonStylePrimary}
                            buttonStyle={{ borderRadius: 4 }}
                            textStyle={styles.textStylePrimary}
                        />
                    </View>
                    <CameraModal
                        visible={cameraVisible}
                        device={device}
                        hasPermission={hasPermission}
                        onCapture={(uri) => {
                            setFieldValue("selfiePhoto", uri);
                            setCameraVisible(false);
                        }}
                        onClose={() => setCameraVisible(false)}
                    />
                </>
            )}
        </Formik>
    );
};


const createStyles = (colors: Colors) => StyleSheet.create({
    inputs: {
        flex: 1,
        rowGap: 16,
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
})

export default Step2;
