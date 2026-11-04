import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import { MasterRWAStep3Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import DocumentRow, { renderLabel } from "../../components/DocumentRow";
import Feather from "react-native-vector-icons/Feather";
import HelpModal from "../../components/Modals/HelpModal";

const initialValues = {
    marketValue: "",
    currency: "",
    valuationAgencyName: "",
    valuationReportDate: "",
    lastPurchasePrice: "",
    rentalIncomeMonthly: "",
    leaseTenureRemainingMonth: "",
    threeYearRevenue: "",
    operationalExpensesAnnual: "",
    netOperationalIncome: "",
    expectedYieldPercentage: "",
    expectedAppreciationPercentage: "",
    registeredValuationReport: null,
    rentalAgreement: null,
    rentLedger: null,
    projectedCashFlowStatement: null,
    financialType: "",
    financialDocument: null,
};

type InitialValuesKeys = typeof initialValues;

interface Step3Props {
    data: InitialValuesKeys;
    isLoading: boolean;
    onSubmit: (data: Step3Props['data']) => void;
    onBack: () => void;
}

const currencyOptions = [
    { label: "INR", value: "INR" },
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
    { label: "AED", value: "AED" },
];

const financialOptions = [
    { label: "P&L", value: "P&L" },
    { label: "Balance Sheet", value: "Balance Sheet" },
    { label: "GST Filings", value: "GST Filings" },
    { label: "Bank Statements", value: "Bank Statements" },
];

const Step3: React.FC<Step3Props> = ({ data, isLoading, onSubmit, onBack }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [helpVisible, setHelpVisible] = useState(false);

    const RadioRow = ({ label, selected, onPress }: any) => (
        <Pressable
            style={styles.radioOption}
            onPress={onPress}
        >
            <View style={[
                styles.radioOuter,
                selected && styles.radioOuterActive
            ]}>
                {selected && <View style={styles.radioInner} />}
            </View>

            <Text style={styles.radioLabel}>
                {label}
            </Text>
        </Pressable>
    );

    return (
        <Formik
            initialValues={data}
            enableReinitialize
            validationSchema={MasterRWAStep3Schema}
            onSubmit={(values) => onSubmit(values)}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleBlur,
                handleSubmit,
                submitCount,
            }) => (
                <>
                    <View style={styles.inputs}>
                        <TextInputClassic
                            label="Market Value"
                            placeholder="Enter your market value"
                            value={values.marketValue}
                            required
                            keyboardType="numeric"
                            onChangeText={handleChange("marketValue")}
                            onBlur={handleBlur('marketValue')}
                            error={errors.marketValue && touched.marketValue ? errors.marketValue : undefined}
                            helpText="Current estimated market value of the asset."
                        />

                        <TextInputClassic
                            label="Currency"
                            placeholder="Select the currency"
                            value={values.currency}
                            type={TextInputType.Dropdown}
                            options={currencyOptions}
                            required
                            onSelect={(v) => setFieldValue("currency", v)}
                            onBlur={handleBlur('currency')}
                            error={errors.currency && touched.currency ? errors.currency : undefined}
                        />

                        <TextInputClassic
                            label="Valuation Agency Name"
                            placeholder="Enter Valuation Agency Name"
                            value={values.valuationAgencyName}
                            required
                            onChangeText={handleChange("valuationAgencyName")}
                            onBlur={handleBlur('valuationAgencyName')}
                            error={errors.valuationAgencyName && touched.valuationAgencyName ? errors.valuationAgencyName : undefined}
                            helpText="Provide the name of the certified agency or valuer who assessed the asset."
                        />

                        <TextInputClassic
                            label="Valuation Report Date"
                            placeholder="DD/MM/YYYY"
                            type={TextInputType.Date}
                            value={values.valuationReportDate}
                            required
                            onChangeText={(v) => setFieldValue("valuationReportDate", v)}
                            onBlur={handleBlur('valuationReportDate')}
                            error={errors.valuationReportDate && touched.valuationReportDate ? errors.valuationReportDate : undefined}
                            helpText="Enter the date on which the asset valuation was conducted."
                        />

                        <TextInputClassic
                            label="Last Purchase Price"
                            placeholder="Enter last purchase price"
                            keyboardType="numeric"
                            value={values.lastPurchasePrice}
                            required
                            onChangeText={handleChange("lastPurchasePrice")}
                            onBlur={handleBlur('lastPurchasePrice')}
                            error={errors.lastPurchasePrice && touched.lastPurchasePrice ? errors.lastPurchasePrice : undefined}
                            helpText="Specify the price at which the asset was last purchased."
                        />

                        <TextInputClassic
                            label="Rental Income (Monthly)"
                            placeholder="Enter rental income monthly"
                            keyboardType="numeric"
                            value={values.rentalIncomeMonthly}
                            required
                            onChangeText={handleChange("rentalIncomeMonthly")}
                            onBlur={handleBlur('rentalIncomeMonthly')}
                            error={errors.rentalIncomeMonthly && touched.rentalIncomeMonthly ? errors.rentalIncomeMonthly : undefined}
                            helpText="Enter the current monthly rental income generated from the asset."
                        />

                        <TextInputClassic
                            label="Lease Tenure Remaining (Months)"
                            placeholder="Enter lease tenure remaining months"
                            keyboardType="numeric"
                            value={values.leaseTenureRemainingMonth}
                            required
                            onChangeText={handleChange("leaseTenureRemainingMonth")}
                            onBlur={handleBlur('leaseTenureRemainingMonth')}
                            error={errors.leaseTenureRemainingMonth && touched.leaseTenureRemainingMonth ? errors.leaseTenureRemainingMonth : undefined}
                            helpText="Specify the remaining lease duration in months for the tenant."
                        />

                        <TextInputClassic
                            label="Last 3 Year Revenue"
                            placeholder="Enter the last 3 year revenue"
                            keyboardType="numeric"
                            value={values.threeYearRevenue}
                            required
                            onChangeText={handleChange("threeYearRevenue")}
                            onBlur={handleBlur('threeYearRevenue')}
                            error={errors.threeYearRevenue && touched.threeYearRevenue ? errors.threeYearRevenue : undefined}
                            helpText="Provide the total revenue generated from the asset over the past 3 years."
                        />

                        <TextInputClassic
                            label="Operational Expenses (Annual)"
                            placeholder="Enter operational expenses annual"
                            keyboardType="numeric"
                            value={values.operationalExpensesAnnual}
                            required
                            onChangeText={handleChange("operationalExpensesAnnual")}
                            onBlur={handleBlur('operationalExpensesAnnual')}
                            error={errors.operationalExpensesAnnual && touched.operationalExpensesAnnual ? errors.operationalExpensesAnnual : undefined}
                            helpText="Enter the yearly expenses incurred for maintaining and operating the asset."
                        />

                        <TextInputClassic
                            label="Net Operational Income"
                            placeholder="Enter net operational income"
                            keyboardType="numeric"
                            value={values.netOperationalIncome}
                            required
                            onChangeText={handleChange("netOperationalIncome")}
                            onBlur={handleBlur('netOperationalIncome')}
                            error={errors.netOperationalIncome && touched.netOperationalIncome ? errors.netOperationalIncome : undefined}
                            helpText="Provide the annual income after deducting operational expenses from total revenue."
                        />

                        <TextInputClassic
                            label="Expected Yield (%)"
                            placeholder="Enter expected yield percentage"
                            keyboardType="numeric"
                            value={values.expectedYieldPercentage}
                            onChangeText={handleChange("expectedYieldPercentage")}
                            onBlur={handleBlur('expectedYieldPercentage')}
                            error={errors.expectedYieldPercentage && touched.expectedYieldPercentage ? errors.expectedYieldPercentage : undefined}
                            helpText="Provide the expected annual return on investment as a percentage."
                        />

                        <TextInputClassic
                            label="Expected Appreciation (%)"
                            placeholder="Enter expected appreciation percentage"
                            keyboardType="numeric"
                            value={values.expectedAppreciationPercentage}
                            onChangeText={handleChange("expectedAppreciationPercentage")}
                            onBlur={handleBlur('expectedAppreciationPercentage')}
                            required
                            error={errors.expectedAppreciationPercentage && touched.expectedAppreciationPercentage ? errors.expectedAppreciationPercentage : undefined}
                            helpText="Provide the estimated annual increase in asset value as a percentage."
                        />

                        <View style={styles.documentsContainer}>
                            <View>
                                <Text style={styles.documentsTitle}>Documents</Text>
                                <Text style={styles.documentsSubTitle}>
                                    Upload documents. It only takes a few minutes...
                                </Text>
                            </View>

                            <DocumentRow
                                label="Registered Valuation Report"
                                required
                                value={values.registeredValuationReport}
                                onUpload={(v) => setFieldValue("registeredValuationReport", v)}
                                onView={() => { }}
                                error={(touched.registeredValuationReport || submitCount > 0) ? errors.registeredValuationReport : undefined}
                                helpText="Upload the official valuation report issued by a certified valuer."
                            />

                            <DocumentRow
                                label="Rental Agreement (If Leased)"
                                required
                                value={values.rentalAgreement}
                                onUpload={(v) => setFieldValue("rentalAgreement", v)}
                                onView={() => { }}
                                error={(touched.rentalAgreement || submitCount > 0) ? errors.rentalAgreement : undefined}
                                helpText="Upload the signed agreement between the owner and tenant."
                            />

                            <DocumentRow
                                label="Rent Ledger (Last 12 Months)"
                                required
                                value={values.rentLedger}
                                onUpload={(v) => setFieldValue("rentLedger", v)}
                                onView={() => { }}
                                error={(touched.rentLedger || submitCount > 0) ? errors.rentLedger : undefined}
                                helpText="Provide a record of rent payments received over time."
                            />

                            <DocumentRow
                                label="Projected Cash Flow Statement"
                                value={values.projectedCashFlowStatement}
                                onUpload={(v) => setFieldValue("projectedCashFlowStatement", v)}
                                onView={() => { }}
                                error={(touched.projectedCashFlowStatement || submitCount > 0) ? errors.projectedCashFlowStatement : undefined}
                                helpText="Upload a document showing expected future income and expenses of the asset."
                            />
                        </View>

                        <View style={styles.documentsContainer}>
                            <View style={{ rowGap: 10 }}>
                                <Text style={styles.documentsTitle}>
                                    {renderLabel("Financials (If business asset)")}<Text style={styles.required}> *</Text>
                                    <Text onPress={() => setHelpVisible(true)}>
                                        {" "}
                                        <Feather
                                            name="info"
                                            size={18}
                                            color={colors.text.extraLight}
                                        />
                                    </Text>
                                </Text>

                                <View>
                                    <View style={styles.radioContainer}>
                                        {financialOptions.map((item) => (
                                            <RadioRow
                                                key={item.value}
                                                label={item.label}
                                                selected={values.financialType === item.value}
                                                onPress={() => setFieldValue("financialType", item.value)}
                                            />
                                        ))}
                                    </View>
                                    {(touched.financialType || submitCount > 0) && errors.financialType && (
                                        <Text style={styles.error}>{errors.financialType}</Text>
                                    )}
                                </View>

                                <DocumentRow
                                    value={values.financialDocument}
                                    onUpload={(v) => setFieldValue("financialDocument", v)}
                                    onView={() => { }}
                                    error={(touched.financialDocument || submitCount > 0) ? errors.financialDocument : undefined}
                                    disabled={!values.financialType}
                                />
                            </View>
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
                            onPress={handleSubmit}
                            loading={isLoading}
                            style={styles.buttonStylePrimary}
                            buttonStyle={{ borderRadius: 4 }}
                            textStyle={styles.textStylePrimary}
                        />
                    </View>

                    <HelpModal
                        visible={helpVisible}
                        text={"Upload relevant financial statements supporting asset performance."}
                        onClose={() => setHelpVisible(false)}
                    />
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

export default Step3;
