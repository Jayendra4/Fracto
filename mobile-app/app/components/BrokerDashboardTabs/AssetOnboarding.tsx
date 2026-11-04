import { StyleSheet, Text, View } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import ButtonPrimary from "../buttons/ButtonPrimary";
import TextInputClassic, { TextInputType } from "../TextInputClassic";
import { Formik } from "formik";
import { AssetOnboardingSchema } from "../../util/formValidationSchema";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useBrokerInviteApi } from "../../services/hooks/useApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ButtonSecondary from "../buttons/ButtonSecondary";
import { MASTER_RWA_ASSET_ID_KEY, MASTER_RWA_STEP_KEY, MASTER_RWA_STORAGE_KEY } from "../../views/MasterRWA";

interface Props {
    assetId: number;
    onAction: () => void;
    onBack: () => void;
}


const AssetOnboarding = ({ onAction, assetId, onBack }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { mutateAsync, isPending, error } = useBrokerInviteApi();
    const [dialCode, setDialCode] = useState<string>('');

    const initialValues = {
        ownerFirstName: "",
        ownerLastName: "",
        ownerEmail: "",
        ownerMobile: "",
        commission: "",
        note: "",
    };

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

    const buildAssetPayload = (values: typeof initialValues) => {
        return {
            assetId: assetId,
            assetOwnerEmail: values.ownerEmail.trim(),
            firstName: values.ownerFirstName.trim(),
            lastName: values.ownerLastName.trim(),
            mobile: values.ownerMobile.startsWith("+")
                ? values.ownerMobile
                : `+91${values.ownerMobile}`,
            proposedCommissionPct: Number(values.commission),
            brokerNote: values.note?.trim() || "",
        };
    };
    const handleSubmit = useCallback(async (values: typeof initialValues) => {
        try {
            const payload = buildAssetPayload(values);
            await mutateAsync(payload);
            await AsyncStorage.multiRemove([
                MASTER_RWA_STEP_KEY,
                MASTER_RWA_STORAGE_KEY,
                MASTER_RWA_ASSET_ID_KEY,
            ]);
            onAction();
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || error?.message || 'Invalid Request',
            });
        }
    }, [mutateAsync, error, assetId]);

    return (
        <>
            <View style={styles.mainWrapper}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.title}>Asset Onboarding</Text>
                    <Text style={styles.subTitle}>
                        Step-by-step compliance-guided onboarding
                    </Text>
                    {/* <ButtonSecondary
                        title={ButtonTextTypes.Check_Past_Onboarding_Request}
                        icon={colors.isLight ? PastTimeLight : PastTime}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        buttonStyle={styles.secondaryButtonStyle}
                        textStyle={styles.secondaryTextStyle}
                        onPress={() => { }}
                    /> */}
                </View>

                <Formik
                    initialValues={initialValues}
                    validationSchema={AssetOnboardingSchema}
                    onSubmit={(values) => handleSubmit(values)}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleSubmit,
                        submitCount,
                    }) => (
                        <View style={styles.inputs}>
                            <TextInputClassic
                                label="Asset Owner’s First Name"
                                placeholder="Enter Asset Owner’s First Name"
                                value={values.ownerFirstName}
                                onChangeText={handleChange("ownerFirstName")}
                                required
                                error={(touched.ownerFirstName || submitCount > 0) ? errors.ownerFirstName : undefined}
                            />

                            <TextInputClassic
                                label="Asset Owner’s Last Name"
                                placeholder="Enter Asset Owner’s Last Name"
                                value={values.ownerLastName}
                                onChangeText={handleChange("ownerLastName")}
                                required
                                error={(touched.ownerLastName || submitCount > 0) ? errors.ownerLastName : undefined}
                            />

                            <TextInputClassic
                                label="Asset Owner’s Email"
                                placeholder="Enter Asset Owner’s Email"
                                value={values.ownerEmail}
                                onChangeText={handleChange("ownerEmail")}
                                keyboardType="email-address"
                                required
                                error={(touched.ownerEmail || submitCount > 0) ? errors.ownerEmail : undefined}
                            />

                            <TextInputClassic
                                label="Asset Owner’s Mobile Number"
                                placeholder="Enter Asset Owner’s Mobile Number"
                                type={TextInputType.Mobile}
                                value={values.ownerMobile}
                                onChangeText={handleChange("ownerMobile")}
                                dialCode={dialCode}
                                keyboardType="phone-pad"
                                required
                                error={(touched.ownerMobile || submitCount > 0) ? errors.ownerMobile : undefined}
                            />

                            <>
                                <TextInputClassic
                                    label="Proposed Commission (%)"
                                    placeholder="e.g. 2.5"
                                    value={values.commission}
                                    onChangeText={handleChange("commission")}
                                    keyboardType="number-pad"
                                    required
                                    error={(touched.commission || submitCount > 0) ? errors.commission : undefined}
                                />
                                <TextInputClassic
                                    label="Note"
                                    placeholder="Add notes for internal review"
                                    value={values.note}
                                    onChangeText={handleChange('note')}
                                    style={{ height: 120, alignItems: 'flex-start' }}
                                />


                                <View style={styles.bottomContainer}>
                                    <ButtonSecondary
                                        title={ButtonTextTypes.Back}
                                        width={ButtonWidthTypes.Medium}
                                        align={ButtonAlignTypes.Right}
                                        onPress={onBack}
                                        buttonStyle={styles.buttonStyleSecondary}
                                        textStyle={styles.textStyleSecondary}
                                    />
                                    <ButtonPrimary
                                        title={ButtonTextTypes.Invite_Broker}
                                        width={ButtonWidthTypes.Medium}
                                        align={ButtonAlignTypes.Right}
                                        buttonStyle={styles.submitButton}
                                        textStyle={{ fontSize: 16 }}
                                        loading={isPending}
                                        onPress={handleSubmit}
                                    />
                                </View>

                            </>
                        </View>
                    )}
                </Formik>
            </View>
        </>
    );
};

export const createStyles = (colors: Colors) => StyleSheet.create({
    mainWrapper: {
        flex: 1,
        rowGap: 24,
    },
    titleWrapper: {
        marginHorizontal: 16,
        rowGap: 4,
    },
    title: {
        color: colors.text.default,
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 20,
    },
    subTitle: {
        color: colors.text.extraLight,
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
    },
    inputs: {
        paddingHorizontal: 16,
        rowGap: 20,
    },
    submitButton: {
        marginTop: 12,
        borderRadius: 4,
    },
    secondaryButtonStyle: {
        marginTop: 16,
        height: 36,
        borderColor: '#F5F5F533',
        backgroundColor: colors.isLight ? colors.constant.white : '#F5F5F529',
        width: 275,
        alignSelf: 'flex-start',
    },
    secondaryTextStyle: {
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 16,
        columnGap: 10,
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
});

export default AssetOnboarding;