import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import { MasterRWAStep2Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import DocumentRow from "../../components/DocumentRow";
import Feather from "react-native-vector-icons/Feather";
import HelpModal from "../../components/Modals/HelpModal";

const initialValues = {
    ownershipModel: "",
    encumbranceDetails: "",
    currentOwnerName: "",
    ownershipEntityType: "",
    titleStatus: "",
    reraNumber: "",
    khasraNumber: "",
    landArea: "",
    builtupArea: "",
    yearOfConstruction: "",
    assetAge: "",
    titleDeed: null,
    encumbranceCertificate: null,
    taxReceipt: null,
    mutationRecords: null,
    ownershipChainDocs: null,
    reraCertificate: null,
    selectedNocType: "",
    nocDocument: null,
    occupancyCertificate: null,
    completionCertificate: null,
    electricityBill: null,
};

type InitialValuesKeys = typeof initialValues;

interface Step2Props {
    data: InitialValuesKeys;
    isLoading: boolean;
    onNext: (data: Step2Props['data']) => void;
    onBack: () => void;
}

const ownershipModelOptions = [
    { label: "Developer Owned", value: "Developer Owned" },
    { label: "SPV Owned", value: "SPV Owned" },
    { label: "Platform Owned", value: "Platform Owned" },
    { label: "Single Owner", value: "Single Owner" },
    { label: "Leasehold", value: "Leasehold" },
    { label: "Freehold", value: "Freehold" },
];

const ownershipEntityTypeOptions = [
    { label: "Individual", value: "Individual" },
    { label: "Company", value: "Company" },
    { label: "Trust", value: "Trust" },
    { label: "Partnership", value: "Partnership" },
    { label: "Government", value: "Government" },
];

const titleStatusOptions = [
    { label: "Clear Title", value: "Clear Title" },
    { label: "Disputed", value: "Disputed" },
    { label: "Under Litigation", value: "Under Litigation" },
    { label: "Others", value: "Others" },
];

const nocOptions = [
    { label: "Society NOC", value: "society" },
    { label: "Builder NOC", value: "builder" },
    { label: "Fire NOC (for commercial)", value: "fire" },
    { label: "Environmental NOC (if required)", value: "environmental" },
];

const Step2: React.FC<Step2Props> = ({ data, isLoading, onNext, onBack }) => {
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
            validationSchema={MasterRWAStep2Schema}
            onSubmit={(values) => onNext(values)}
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
            }) => {
                const currentYear = new Date().getFullYear();

                const calculatedAge =
                    values.yearOfConstruction
                        ? currentYear - Number(values.yearOfConstruction)
                        : "";
                return (
                    <>
                        <View style={styles.inputs}>
                            <TextInputClassic
                                label="Ownership Model"
                                placeholder="Select the ownership model"
                                type={TextInputType.Dropdown}
                                options={ownershipModelOptions}
                                value={values.ownershipModel}
                                required
                                onSelect={(v) => setFieldValue("ownershipModel", v)}
                                onBlur={handleBlur('ownershipModel')}
                                error={errors.ownershipModel && touched.ownershipModel ? errors.ownershipModel : undefined}
                                helpText="Select how the asset ownership is structured (e.g., Developer, SPV, Platform, Single Owner, Leasehold, or Freehold)."
                            />

                            <TextInputClassic
                                label="Ownership Entity Type"
                                placeholder="Select ownership entity type"
                                type={TextInputType.Dropdown}
                                options={ownershipEntityTypeOptions}
                                value={values.ownershipEntityType}
                                required
                                onSelect={(v) => setFieldValue("ownershipEntityType", v)}
                                onBlur={handleBlur('ownershipEntityType')}
                                error={errors.ownershipEntityType && touched.ownershipEntityType ? errors.ownershipEntityType : undefined}
                                helpText="Specify the legal entity owning the asset (e.g., Individual, Company, Partnership, Trust, SPV)."
                            />

                            <TextInputClassic
                                label="Encumbrance Details"
                                placeholder="Enter encumbrance details"
                                value={values.encumbranceDetails}
                                onChangeText={handleChange("encumbranceDetails")}
                                helpText="Provide details of any legal liabilities, loans, or claims associated with the asset, if applicable."
                            />

                            <TextInputClassic
                                label="Property Survey Khasra Number"
                                placeholder="Enter Property Survey Khasra Number"
                                value={values.khasraNumber}
                                onChangeText={handleChange("khasraNumber")}
                                helpText="Official land identification number as per government land records."
                            />

                            <TextInputClassic
                                label="Current Owner Name"
                                placeholder="Enter the current owner"
                                value={values.currentOwnerName}
                                required
                                onChangeText={handleChange("currentOwnerName")}
                                onBlur={handleBlur('currentOwnerName')}
                                error={errors.currentOwnerName && touched.currentOwnerName ? errors.currentOwnerName : undefined}
                            />

                            <TextInputClassic
                                label="Title Status"
                                placeholder="Select title status"
                                type={TextInputType.Dropdown}
                                options={titleStatusOptions}
                                value={values.titleStatus}
                                required
                                onSelect={(v) => setFieldValue("titleStatus", v)}
                                onBlur={handleBlur('titleStatus')}
                                error={errors.titleStatus && touched.titleStatus ? errors.titleStatus : undefined}
                            />

                            <TextInputClassic
                                label="RERA Registration Number"
                                placeholder="Enter RERA Registration Number"
                                value={values.reraNumber}
                                onChangeText={handleChange("reraNumber")}
                                helpText="Enter the registered RERA number for the property, if applicable."
                            />

                            <TextInputClassic
                                label="Land Area"
                                placeholder="Enter land area"
                                value={values.landArea}
                                keyboardType="numeric"
                                required
                                onChangeText={handleChange("landArea")}
                                onBlur={handleBlur('landArea')}
                                endText="Sq. ft. / Meter"
                                error={errors.landArea && touched.landArea ? errors.landArea : undefined}
                                helpText="Specify the total land area of asset."
                            />

                            <TextInputClassic
                                label="Builtup Area"
                                placeholder="Enter builtup area"
                                value={values.builtupArea}
                                keyboardType="numeric"
                                onChangeText={handleChange("builtupArea")}
                                endText="Sq. ft. / Meter"
                                helpText="Specify the total constructed (built-up) area of the asset in appropriate units."
                            />

                            <TextInputClassic
                                label="Year of Construction"
                                placeholder="Enter year of construction"
                                value={values.yearOfConstruction}
                                keyboardType="numeric"
                                required
                                onChangeText={(val) => {
                                    let value = val?.replace(/[^0-9]/g, "");

                                    if (value.length > 4) return;

                                    if (Number(value) > currentYear) {
                                        value = String(currentYear);
                                    }

                                    setFieldValue("yearOfConstruction", value);
                                }}
                                onBlur={handleBlur('yearOfConstruction')}
                                error={errors.yearOfConstruction && touched.yearOfConstruction ? errors.yearOfConstruction : undefined}
                                helpText="Enter the year the asset was constructed."
                            />

                            <TextInputClassic
                                label="Asset Age (year)"
                                placeholder="Enter asset age"
                                value={calculatedAge?.toString()}
                                keyboardType="numeric"
                                onChangeText={handleChange("assetAge")}
                                disabled
                            />

                            <View style={styles.documentsContainer}>
                                <View>
                                    <Text style={styles.documentsTitle}>Documents</Text>
                                    <Text style={styles.documentsSubTitle}>
                                        Upload documents. It only takes a few minutes...
                                    </Text>
                                </View>

                                <DocumentRow
                                    label="Registered Title Deed / Sale Deed"
                                    required
                                    value={values.titleDeed}
                                    onUpload={(v) => setFieldValue("titleDeed", v)}
                                    onView={() => { }}
                                    error={(touched.titleDeed || submitCount > 0) ? errors.titleDeed : undefined}
                                    helpText="Upload the registered sale deed as proof of legal ownership of the property."
                                />

                                <DocumentRow
                                    label="Encumbrance Certificate (EC)"
                                    required
                                    value={values.encumbranceCertificate}
                                    onUpload={(v) => setFieldValue("encumbranceCertificate", v)}
                                    onView={() => { }}
                                    error={(touched.encumbranceCertificate || submitCount > 0) ? errors.encumbranceCertificate : undefined}
                                    helpText="Upload the encumbrance certificate to confirm the property is free from legal or financial liabilities."
                                />

                                <DocumentRow
                                    label="Property Tax Receipts"
                                    required
                                    value={values.taxReceipt}
                                    onUpload={(v) => setFieldValue("taxReceipt", v)}
                                    onView={() => { }}
                                    error={(touched.taxReceipt || submitCount > 0) ? errors.taxReceipt : undefined}
                                    helpText="Upload the latest property tax receipt as proof of tax payment."
                                />

                                <DocumentRow
                                    label="Mutation Records"
                                    value={values.mutationRecords}
                                    onUpload={(v) => setFieldValue("mutationRecords", v)}
                                    onView={() => { }}
                                    error={(touched.mutationRecords || submitCount > 0) ? errors.mutationRecords : undefined}
                                    helpText="Upload the mutation document showing transfer of ownership in local land records."
                                />

                                <DocumentRow
                                    label="Ownership Chain Documents (Last 15 yrs if possible)"
                                    required
                                    value={values.ownershipChainDocs}
                                    onUpload={(v) => setFieldValue("ownershipChainDocs", v)}
                                    onView={() => { }}
                                    error={(touched.ownershipChainDocs || submitCount > 0) ? errors.ownershipChainDocs : undefined}
                                    helpText="Provide documents showing the history of ownership transfers for the property."
                                />

                                <DocumentRow
                                    label="RERA Registration Certificate (If applicable)"
                                    value={values.reraCertificate}
                                    onUpload={(v) => setFieldValue("reraCertificate", v)}
                                    onView={() => { }}
                                    error={(touched.reraCertificate || submitCount > 0) ? errors.reraCertificate : undefined}
                                    helpText="Upload the RERA registration certificate for the property/project, if applicable."
                                />
                            </View>

                            <View style={styles.documentsContainer}>
                                <View style={{ rowGap: 10 }}>
                                    <Text style={styles.documentsTitle}>
                                        NOCs<Text style={styles.required}> *</Text>
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
                                            {nocOptions.map((item) => (
                                                <RadioRow
                                                    key={item.value}
                                                    label={item.label}
                                                    selected={values.selectedNocType === item.value}
                                                    onPress={() => setFieldValue("selectedNocType", item.value)}
                                                />
                                            ))}
                                        </View>
                                        {(touched.selectedNocType || submitCount > 0) && errors.selectedNocType && (
                                            <Text style={styles.error}>{errors.selectedNocType}</Text>
                                        )}
                                    </View>

                                    <DocumentRow
                                        value={values.nocDocument}
                                        onUpload={(v) => setFieldValue("nocDocument", v)}
                                        onView={() => { }}
                                        error={(touched.nocDocument || submitCount > 0) ? errors.nocDocument : undefined}
                                        disabled={!values.selectedNocType}
                                    />
                                </View>

                                <DocumentRow
                                    label="Occupancy Certificate (OC)"
                                    required
                                    value={values.occupancyCertificate}
                                    onUpload={(v) => setFieldValue("occupancyCertificate", v)}
                                    onView={() => { }}
                                    error={(touched.occupancyCertificate || submitCount > 0) ? errors.occupancyCertificate : undefined}
                                    helpText="Upload the occupancy certificate confirming the property is fit for occupation."
                                />

                                <DocumentRow
                                    label="Completion Certificate (CC)"
                                    required
                                    value={values.completionCertificate}
                                    onUpload={(v) => setFieldValue("completionCertificate", v)}
                                    onView={() => { }}
                                    error={(touched.completionCertificate || submitCount > 0) ? errors.completionCertificate : undefined}
                                    helpText="Upload the completion certificate issued by authorities after construction is completed."
                                />

                                <DocumentRow
                                    label="Latest Electricity Bill (For address verification)"
                                    required
                                    value={values.electricityBill}
                                    onUpload={(v) => setFieldValue("electricityBill", v)}
                                    onView={() => { }}
                                    error={(touched.electricityBill || submitCount > 0) ? errors.electricityBill : undefined}
                                    helpText="Upload the latest electricity bill as proof of property usage and address verification."
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
                                onPress={handleSubmit}
                                loading={isLoading}
                                style={styles.buttonStylePrimary}
                                buttonStyle={{ borderRadius: 4 }}
                                textStyle={styles.textStylePrimary}
                            />
                        </View>

                        <HelpModal
                            visible={helpVisible}
                            text={"Upload relevant NOCs from authorities confirming no objections for the property."}
                            onClose={() => setHelpVisible(false)}
                        />
                    </>
                )
            }}
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

export default Step2;
