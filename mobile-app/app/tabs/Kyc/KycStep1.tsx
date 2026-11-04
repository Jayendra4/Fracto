import { StyleSheet, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import { Formik } from "formik";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import { KycStep1Schema } from "../../util/formValidationSchema";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FileUpload from "../../components/FileUpload";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { AccountType } from "../../store/authSlice.types";

interface Props {
    data: {
        pan: string;
        dateOfBirth: string;
        licenseNumber: string,
        licenseExpiry: string,
        panFile: any;
    };
    onNext: (data: Props['data']) => void;
}

const KycStep1 = ({ data, onNext }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const userDetails = useSelector((state: RootState) => state.auth.user);

    return (
        <View style={styles.wrapper}>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                enableAutomaticScroll
                showsVerticalScrollIndicator={false}
            >
                <Formik
                    initialValues={{ ...data, accountType: userDetails?.type }}
                    validationSchema={KycStep1Schema}
                    onSubmit={async (values) => {
                        onNext(values);
                    }}
                >
                    {({
                        values,
                        errors,
                        submitCount,
                        touched,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                    }) => (
                        <>
                            <View style={styles.inputs}>
                                <TextInputClassic
                                    label="PAN Number"
                                    placeholder="Enter Your PAN Number"
                                    value={values.pan}
                                    onChangeText={handleChange('pan')}
                                    error={(touched.pan || submitCount > 0) ? errors.pan : undefined}
                                    required
                                />
                                <TextInputClassic
                                    label="Date Of Birth"
                                    placeholder="Select Your Date of Birth"
                                    value={values.dateOfBirth}
                                    type={TextInputType.Date}
                                    onChangeText={(v) => setFieldValue("dateOfBirth", v)}
                                    error={(touched.dateOfBirth || submitCount > 0)
                                        ? errors.dateOfBirth
                                        : undefined}
                                    required
                                />

                                {userDetails?.type === AccountType.Broker && (
                                    <>
                                        <TextInputClassic
                                            label="License Number"
                                            placeholder="Enter your License Number"
                                            value={values.licenseNumber}
                                            onChangeText={handleChange('licenseNumber')}
                                            error={(touched.licenseNumber || submitCount > 0) ? errors.licenseNumber : undefined}
                                            required
                                        />
                                        <TextInputClassic
                                            label="License Expiry"
                                            placeholder="DD/MM/YYYY"
                                            value={values.licenseExpiry}
                                            type={TextInputType.Date}
                                            onChangeText={(v) => setFieldValue("licenseExpiry", v)}
                                            error={(touched.licenseExpiry || submitCount > 0)
                                                ? errors.licenseExpiry
                                                : undefined}
                                            required
                                        />
                                    </>
                                )}
                                <FileUpload
                                    label="Upload Your PAN"
                                    required
                                    value={values.panFile}
                                    onSelect={(f) => setFieldValue("panFile", f)}
                                    error={(touched.panFile || submitCount > 0) && typeof errors.panFile === 'string'
                                        ? errors.panFile
                                        : undefined}
                                />
                            </View>
                            <View style={styles.bottomContainer}>
                                <ButtonSecondary
                                    title={ButtonTextTypes.Back}
                                    width={ButtonWidthTypes.Half}
                                    align={ButtonAlignTypes.Right}
                                    onPress={() => { }}
                                    disabled={true}
                                />
                                <ButtonPrimary
                                    title={ButtonTextTypes.Next}
                                    width={ButtonWidthTypes.Half}
                                    align={ButtonAlignTypes.Right}
                                    onPress={handleSubmit}
                                />
                            </View>
                        </>
                    )}
                </Formik>
            </KeyboardAwareScrollView>
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.background.slightly,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    inputs: {
        rowGap: 20,
        marginBottom: 18,
        flex: 1,
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 'auto',
        columnGap: 10,
    },
    label: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
        marginBottom: 10,
        color: colors.text.default,
    },
    required: {
        color: colors.danger.default,
    },
})

export default KycStep1;