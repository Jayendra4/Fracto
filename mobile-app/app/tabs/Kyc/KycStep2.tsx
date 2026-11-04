import { StyleSheet, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import { Formik } from "formik";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import { KycStep2Schema } from "../../util/formValidationSchema";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface Props {
    onBack: () => void;
    data: {
        occupation: string;
        occupationIndustry: string;
        monthlyIncome: string;
    };
    onNext: (data: Props['data']) => void;
}

const incomeOptions = [
    { label: '₹25,000 or Less', value: '0-25000' },
    { label: '₹25,000 - ₹50,000', value: '25000-50000' },
    { label: '₹50,000 - ₹100,000', value: '50000-100000' },
    { label: '₹100,000 - ₹200,000', value: '100000-200000' },
    { label: '₹200,000 - ₹300,000', value: '200000-300000' },
    { label: '₹300,000 - ₹400,000', value: '300000-400000' },
    { label: '₹400,000 - ₹1,000,000', value: '400000-1000000' },
];

const KycStep2 = ({ onBack, data, onNext }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

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
                    initialValues={data}
                    validationSchema={KycStep2Schema}
                    onSubmit={values => {
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
                                    label="Occupation"
                                    placeholder="Enter Your Occupation"
                                    value={values.occupation}
                                    onChangeText={handleChange('occupation')}
                                    error={(touched.occupation || submitCount > 0) ? errors.occupation : undefined}
                                    required
                                />
                                <TextInputClassic
                                    label="Occupation Industry"
                                    placeholder="Select Your Occupation Industry"
                                    value={values.occupationIndustry}
                                    onChangeText={handleChange('occupationIndustry')}
                                    error={(touched.occupationIndustry || submitCount > 0) ? errors.occupationIndustry : undefined}
                                    required
                                />
                                <TextInputClassic
                                    label="Monthly Income"
                                    placeholder="Select Your Monthly Income"
                                    type={TextInputType.Dropdown}
                                    value={values.monthlyIncome}
                                    onSelect={(v) => setFieldValue("monthlyIncome", v)}
                                    options={incomeOptions}
                                    error={(touched.monthlyIncome || submitCount > 0) ? errors.monthlyIncome : undefined}
                                    required
                                />
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
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 'auto',
        columnGap: 10,
    },
})

export default KycStep2;