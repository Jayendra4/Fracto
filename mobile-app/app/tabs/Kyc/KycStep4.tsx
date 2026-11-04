import { StyleSheet, View, Text, Pressable } from "react-native";
import { useTheme, Colors } from "../../util/theme";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import {
    ButtonAlignTypes,
    ButtonTextTypes,
    ButtonWidthTypes,
} from "../../components/buttons/Button.types";
import { useState } from "react";
import { useCameraPermission, useCameraDevice } from "react-native-vision-camera";
import CameraModal from "../../util/CameraModal";
import { Formik } from "formik";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useUpdateKyc, useUploadFile } from "../../services/hooks/useApi";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { UserKycDocumentName } from "../../services/auth.service";
import Toast from "react-native-toast-message";
import { refreshUser } from "../../store/authSlice";
import FileUpload from "../../components/FileUpload";
import CameraCapture from "../../components/CameraCapture";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KYC_STORAGE_KEY } from ".";
import { AccountType } from "../../store/authSlice.types";

interface Props {
    data: {
        selfie: string | null;
        secondaryFile: any;
        secondaryId: string;
    };
    allData: any;
    onBack: () => void;
}

const secondaryIdOptions = ["Passport", "License", "Aadhaar", "Voter"];

const KycStep4 = ({ onBack, data, allData }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [kycLoading, setKycLoading] = useState(false);
    const { hasPermission, requestPermission } = useCameraPermission();
    const { mutateAsync: updateKyc, error: kycApiError } = useUpdateKyc();
    const { mutateAsync: uploadFile } = useUploadFile();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<AppDispatch>();
    const device = useCameraDevice("front");

    const initialValues = {
        selfie: null as string | null,
        secondaryFile: null as any,
    };

    const validate = (values: typeof initialValues) => {
        const errors: { selfie?: string; secondaryFile?: string } = {};
        if (!values.selfie) errors.selfie = "Selfie is required";
        return errors;
    };

    const uploadOrFail = async (
        promise: Promise<any>,
        message: string
    ) => {
        try {
            return await promise;
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: message,
                text2: "Something Went Wrong, Try Again",
            });
            throw error;
        }
    };

    const onSubmit = async (values: Props["data"]) => {
        try {
            setKycLoading(true);
            const { step1, step2, step3 } = allData;

            const documents: {
                developerName: UserKycDocumentName;
                filename: string;
            }[] = [];

            if (step1.panFile) {
                const panRes = await uploadOrFail(
                    uploadFile({
                        file: step1.panFile,
                        folder: "kyc/pan",
                    }),
                    "PAN upload failed"
                );

                documents.push({
                    developerName: "pan_indian",
                    filename: panRes.data.meta.filename,
                });
            }

            if (step3.addressProof) {
                const addrRes = await uploadOrFail(
                    uploadFile({
                        file: step3.addressProof,
                        folder: "kyc/address",
                    }),
                    "Address proof upload failed"
                );

                documents.push({
                    developerName: "address_proof",
                    filename: addrRes.data.meta.filename,
                });
            }

            if (values.secondaryFile && values.secondaryId) {
                const secRes = await uploadOrFail(
                    uploadFile({
                        file: values.secondaryFile,
                        folder: "kyc/secondary",
                    }),
                    "Secondary ID upload failed"
                );

                documents.push({
                    developerName: "secondary_id",
                    filename: secRes.data.meta.filename,
                });
            }

            if (values.selfie) {
                const selfieRes = await uploadOrFail(
                    uploadFile({
                        file: {
                            uri: values.selfie,
                            name: "selfie.jpg",
                            type: "image/jpeg",
                        },
                        folder: "kyc/selfie",
                    }),
                    "Selfie upload failed"
                );

                documents.push({
                    developerName: "selfie_photo",
                    filename: selfieRes.data.meta.filename,
                });
            }

            const payload = {
                firstname: userDetails?.firstname,
                lastname: userDetails?.lastname,
                accountId: userDetails?.id,
                countryId: userDetails?.countryId,
                panNumber: step1.pan,
                occupation: step2.occupation,
                monthlyIncome: step2.monthlyIncome,
                dateOfBirth: moment(step1.dateOfBirth, "DD/MM/YYYY").format("YYYY-MM-DD"),
                ...(userDetails?.type === AccountType.Broker && {
                    licenseNumber: step1.licenseNumber,
                    licenseExpiry: moment(step1.licenseExpiry, "DD/MM/YYYY").format("YYYY-MM-DD"),
                }),
                documents,
                residentialAddress: {
                    addressLine1: step3.address,
                    addressLine2: step3.landmark,
                    city: step3.city,
                    state: step3.state,
                    pincode: step3.pincode,
                },
            };

            await updateKyc(payload);
            dispatch(refreshUser());
            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Success",
                mainText: "Congratulation!! You’re verified",
                subText: "No further action is required at the moment",
            });
            await AsyncStorage.removeItem(KYC_STORAGE_KEY);
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || kycApiError?.message || 'Invalid Request',
            });
        } finally {
            setKycLoading(false);
        }
    };

    return (
        <Formik
            initialValues={data}
            validate={validate}
            onSubmit={(values) => {
                onSubmit(values);
            }}
        >
            {({ values, setFieldValue, handleSubmit, errors, touched, submitCount }) => (
                <View style={styles.wrapper}>
                    <View style={styles.container}>
                        <CameraCapture
                            value={values.selfie}
                            required
                            error={
                                (touched.selfie || submitCount > 0)
                                    ? errors.selfie
                                    : undefined
                            }
                            onRemove={() => setFieldValue("selfie", null)}
                            onOpenCamera={async () => {
                                if (!hasPermission) {
                                    const granted = await requestPermission();
                                    if (!granted) return;
                                }
                                setCameraVisible(true);
                            }}
                        />

                        <View style={styles.content}>
                            <Text style={styles.label}>
                                Secondary ID <Text style={styles.optional}>(Optional)</Text>
                            </Text>

                            <View style={[styles.radioRow, values.secondaryFile && { opacity: 0.6 }]}>
                                {secondaryIdOptions.map(option => (
                                    <Pressable
                                        key={option}
                                        style={styles.radioItem}
                                        onPress={() => setFieldValue("secondaryId", option)}
                                        disabled={!!values.secondaryFile}

                                    >
                                        <View style={[
                                            styles.radioOuter,
                                            {
                                                backgroundColor:
                                                    values.secondaryId === option ? '#1479E5' : 'transparent',
                                                borderColor:
                                                    values.secondaryId === option
                                                        ? colors.border.primary
                                                        : colors.text.muted,
                                            }
                                        ]} />

                                        <Text
                                            style={[
                                                styles.radioText,
                                                {
                                                    color:
                                                        values.secondaryId === option
                                                            ? colors.text.default
                                                            : colors.text.muted,
                                                }
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <View style={[styles.fileUploadWrapper, {
                                opacity: values.secondaryId ? 1 : 0.6,
                            }]}>
                                <FileUpload
                                    value={values.secondaryFile}
                                    onSelect={(f) => setFieldValue("secondaryFile", f)}
                                    error={(touched.secondaryFile || submitCount > 0) && typeof errors.secondaryFile === 'string'
                                        ? errors.secondaryFile
                                        : undefined}
                                    disabled={!values.secondaryId}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomContainer}>
                        <ButtonSecondary
                            title={ButtonTextTypes.Back}
                            width={ButtonWidthTypes.Half}
                            align={ButtonAlignTypes.Right}
                            onPress={onBack}
                        />
                        <ButtonPrimary
                            title={ButtonTextTypes.Next}
                            width={ButtonWidthTypes.Half}
                            align={ButtonAlignTypes.Right}
                            loading={kycLoading}
                            onPress={handleSubmit}
                        />
                    </View>

                    <CameraModal
                        visible={cameraVisible}
                        device={device}
                        hasPermission={hasPermission}
                        onCapture={(uri) => {
                            setFieldValue("selfie", uri);
                            setCameraVisible(false);
                        }}
                        onClose={() => setCameraVisible(false)}
                    />
                </View>
            )
            }
        </Formik>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        wrapper: {
            flex: 1,
            backgroundColor: colors.background.slightly,
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        container: {
            flex: 1,
            justifyContent: 'space-between',
        },
        content: {
            flex: 1,
        },
        label: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
            marginBottom: 6,
        },
        optional: {
            color: colors.text.muted,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        radioRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
        },
        radioItem: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: 12,
        },
        radioOuter: {
            width: 14,
            height: 14,
            borderRadius: 100,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 6,
        },
        radioText: {
            color: colors.text.muted,
            fontSize: 12,
            lineHeight: 20,
            fontFamily: 'WorkSans-Regular',
        },
        bottomContainer: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: "auto",
            gap: 10,
        },
        errorText: {
            fontSize: 13,
            marginTop: 6,
            color: colors.danger.default,
        },
        fileUploadWrapper: {
            flex: 1,
            marginBottom: 10
        },
    });

export default KycStep4;
