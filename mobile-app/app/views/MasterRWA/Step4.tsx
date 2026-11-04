import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import { MasterRWAStep4Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import DocumentRow from "../../components/DocumentRow";

interface Step4Props {
    onNext: () => void;
    onBack: () => void;
}

const brandAffiliationOptions = [
    { label: "Independent", value: "independent" },
    { label: "Franchise", value: "franchise" },
    { label: "Corporate Owned", value: "corporate" },
];

const Step4: React.FC<Step4Props> = ({ onNext, onBack }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const initialValues = {
        storeType: "",
        brandAffiliation: "",
        averageMonthlySales: "",
        footFallData: "",
        leaseRentPerMonth: "",
        staffCount: "",

        franchiseAgreement: null,
        businessLicense: null,
        gstReturns: null,
        salesReports: null,
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={MasterRWAStep4Schema}
            onSubmit={onNext}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleBlur,
                submitCount,
            }) => (
                <>
                    <View style={styles.inputs}>
                        <TextInputClassic
                            label="Store Type"
                            placeholder="Enter store type"
                            value={values.storeType}
                            required
                            onChangeText={handleChange("storeType")}
                            onBlur={handleBlur('storeType')}
                            error={errors.storeType && touched.storeType ? errors.storeType : undefined}
                        />

                        <TextInputClassic
                            label="Brand Affiliation"
                            placeholder="Enter brand affiliation"
                            type={TextInputType.Dropdown}
                            options={brandAffiliationOptions}
                            value={values.brandAffiliation}
                            required
                            onSelect={(v) => setFieldValue("brandAffiliation", v)}
                            onBlur={handleBlur('brandAffiliation')}
                            error={errors.brandAffiliation && touched.brandAffiliation ? errors.brandAffiliation : undefined}
                        />

                        <TextInputClassic
                            label="Average Monthly Sales"
                            placeholder="Enter average monthly sales"
                            keyboardType="numeric"
                            value={values.averageMonthlySales}
                            required
                            onChangeText={handleChange("averageMonthlySales")}
                            onBlur={handleBlur('averageMonthlySales')}
                            error={errors.averageMonthlySales && touched.averageMonthlySales ? errors.averageMonthlySales : undefined}
                        />

                        <TextInputClassic
                            label="Foot Fall Data"
                            placeholder="Enter footfall data"
                            keyboardType="numeric"
                            value={values.footFallData}
                            required
                            onChangeText={handleChange("footFallData")}
                            onBlur={handleBlur('footFallData')}
                            error={errors.footFallData && touched.footFallData ? errors.footFallData : undefined}
                        />

                        <TextInputClassic
                            label="Lease Rent Per Month"
                            placeholder="Enter lease rent per month"
                            keyboardType="numeric"
                            value={values.leaseRentPerMonth}
                            required
                            onChangeText={handleChange("leaseRentPerMonth")}
                            onBlur={handleBlur('leaseRentPerMonth')}
                            error={errors.leaseRentPerMonth && touched.leaseRentPerMonth ? errors.leaseRentPerMonth : undefined}
                        />

                        <TextInputClassic
                            label="Staff Count"
                            placeholder="Enter staff count"
                            keyboardType="numeric"
                            value={values.staffCount}
                            required
                            onChangeText={handleChange("staffCount")}
                            onBlur={handleBlur('staffCount')}
                            error={errors.staffCount && touched.staffCount ? errors.staffCount : undefined}
                        />

                        <View style={styles.documentsContainer}>
                            <View>
                                <Text style={styles.documentsTitle}>Documents</Text>
                                <Text style={styles.documentsSubTitle}>
                                    Upload documents. It only takes a few minutes...
                                </Text>
                            </View>

                            <DocumentRow
                                label="Franchise Agreement"
                                required
                                value={values.franchiseAgreement}
                                onUpload={(v) => setFieldValue("franchiseAgreement", v)}
                                onView={() => { }}
                                error={(touched.franchiseAgreement || submitCount > 0) ? errors.franchiseAgreement : undefined}
                            />

                            <DocumentRow
                                label="Business License"
                                required
                                value={values.businessLicense}
                                onUpload={(v) => setFieldValue("businessLicense", v)}
                                onView={() => { }}
                                error={(touched.businessLicense || submitCount > 0) ? errors.businessLicense : undefined}
                            />

                            <DocumentRow
                                label="GST Returns (India)"
                                required
                                value={values.gstReturns}
                                onUpload={(v) => setFieldValue("gstReturns", v)}
                                onView={() => { }}
                                error={(touched.gstReturns || submitCount > 0) ? errors.gstReturns : undefined}
                            />

                            <DocumentRow
                                label="Sales Reports"
                                required
                                value={values.salesReports}
                                onUpload={(v) => setFieldValue("salesReports", v)}
                                onView={() => { }}
                                error={(touched.salesReports || submitCount > 0) ? errors.salesReports : undefined}
                            />
                        </View>
                    </View>

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
                            title={ButtonTextTypes.Next}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Right}
                            onPress={onNext}
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
    documentsContainer: {
        marginTop: 10,
        rowGap: 24,
    },
    documentsTitle: {
        fontSize: 20,
        color: colors.text.default,
        fontFamily: "WorkSans-Medium",
    },
    required: {
        color: colors.danger.default,
    },
    documentsSubTitle: {
        fontSize: 12,
        color: colors.text.lightGrey,
        fontFamily: "WorkSans-Medium",
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 24,
        flexWrap: 'wrap',
    },
    radioOption: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10,
        marginVertical: 6,
    },
    radioOuter: {
        width: 16,
        height: 16,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.text.lightGrey,
        backgroundColor: colors.background.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: '#4F86C0',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 10,
        backgroundColor: '#4F86C0',
    },
    radioLabel: {
        fontSize: 16,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
    },
    error: {
        fontSize: 13,
        color: colors.danger.default,
        fontFamily: 'WorkSans-Medium',
    },
})

export default Step4;
