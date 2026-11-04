import React, { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { StyleSheet, View } from "react-native";
import { Formik } from "formik";
import { CompanyKYBStep1Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import { useGetCitiesApi, useGetCountriesApi, useGetStatesApi } from "../../services/auth.service";
import moment from "moment";
import { useCreateCompanyBasicApi } from "../../services/hooks/useApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";

interface Step1Props {
    initialValues: Step1FormValues;
    onNext: (data: Step1FormValues & { companyId: string }) => void;
}

export interface Step1FormValues {
    legalEntityName: string;
    tradeName: string;
    cinNumber: string;
    incorporationDate: string;
    entityType: string;
    registeredAddress: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    industryType: string;
    companyEmail: string;
    companyPhone: string;
    website: string;
}

interface Country {
    name: string;
    dialCode: string;
    flag: string;
    isoCode: string;
}

export enum AccountChoice {
    SAME_ADDRESS = 'SAME_ADDRESS',
    DIFFERENT_ADDRESS = 'DIFFERENT_ADDRESS'
};

const entityTypeOptions = [
    { label: "Pvt Ltd", value: "PvtLtd" },
    { label: "LLP", value: "Llp" },
    { label: "LLC", value: "Llc" },
    { label: "FZ-LLC", value: "FzLlc" },
    { label: "SPV", value: "Spv" },
    { label: "Partnership", value: "Partnership" },
    { label: "Trust", value: "Trust" },
];

const Step1: React.FC<Step1Props> = ({ initialValues, onNext }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedState, setSelectedState] = useState<string>("");
    const { data: countries } = useGetCountriesApi();
    const [searchState, setSearchState] = useState<string>("");
    const [debouncedStateSearch, setDebouncedStateSearch] = useState<string>('');
    const [searchCity, setSearchCity] = useState<string>("");
    const [debouncedCitySearch, setDebouncedCitySearch] = useState<string>("");
    const { data: states } = useGetStatesApi(selectedCountry, debouncedStateSearch);
    const { data: cities } = useGetCitiesApi(selectedCountry, selectedState, debouncedCitySearch);
    const { mutateAsync, isPending } = useCreateCompanyBasicApi();

    const debouncedSearchFn = useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedStateSearch(value);
            }, 200),
        []
    );

    const debouncedCitySearchFn = useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedCitySearch(value);
            }, 200),
        []
    );

    useEffect(() => {
        debouncedSearchFn(searchState);

        return () => {
            debouncedSearchFn.cancel();
        };
    }, [searchState, debouncedSearchFn]);

    useEffect(() => {
        debouncedCitySearchFn(searchCity);

        return () => {
            debouncedCitySearchFn.cancel();
        };
    }, [searchCity, debouncedCitySearchFn]);

    const countryOptions = countries?.map((country: Country) => ({
        label: country?.name?.length <= 3 ? country?.name?.toUpperCase() : country?.name,
        value: country?.name?.length <= 3 ? country?.name?.toUpperCase() : country?.name,
        flag: country?.flag,
        isoCode: country?.isoCode,
    }));

    const stateOptions = states?.map((state: any) => ({
        label: state?.name,
        value: state?.name,
        isoCode: state?.code,
    }));

    const cityOptions = cities?.map((city: any) => ({
        label: city?.name,
        value: city?.name,
    }));

    const buildCompanyBasicPayload = (values: Step1FormValues) => {
        return {
            legalEntityName: values.legalEntityName,
            tradeName: values.tradeName,
            cinOrTradeLicenseNo: values.cinNumber,
            dateOfIncorporation: moment(
                values.incorporationDate,
                "DD/MM/YYYY"
            ).toISOString(),
            entityType: values.entityType,
            registeredAddressLine1: values.registeredAddress,
            registeredCity: values.city,
            registeredState: values.state,
            registeredCountry: values.country,
            registeredPincode: values.pincode,
            industryType: values.industryType,
            companyEmail: values.companyEmail,
            companyPhone: values.companyPhone,
            website: values.website,
        };
    };

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={CompanyKYBStep1Schema}
            onSubmit={async (values) => {
                try {
                    const payload = buildCompanyBasicPayload(values);
                    const res = await mutateAsync(payload);
                    const companyId = res?.id;

                    if (!companyId) {
                        Toast.show({
                            type: "error",
                            text1: "Company creation failed",
                        });
                        return;
                    }

                    await AsyncStorage.multiSet([
                        ["COMPANY_ID", String(companyId)],
                        ["COMPANY_KYB_STEP", "2"],
                    ]);

                    Toast.show({
                        type: "success",
                        text1: "Step 1 Completed Successfully",
                    });

                    onNext({ ...values, companyId });

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
                handleChange,
                setFieldValue,
                handleSubmit,
                submitCount,
            }) => (
                <>
                    <View style={styles.inputs}>
                        <TextInputClassic
                            label="Legal Entity Full Name"
                            placeholder="Enter Legal Entity First Name"
                            value={values.legalEntityName}
                            onChangeText={handleChange("legalEntityName")}
                            required
                            error={(touched.legalEntityName || submitCount > 0) ? errors.legalEntityName : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Legal Trade Name (Optional)"
                            placeholder="Enter Trade Name"
                            value={values.tradeName}
                            onChangeText={handleChange("tradeName")}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="CIN or Trade License Number"
                            placeholder="Enter Registration or License Number"
                            value={values.cinNumber}
                            onChangeText={handleChange("cinNumber")}
                            required
                            error={(touched.cinNumber || submitCount > 0) ? errors.cinNumber : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Date of Incorporation"
                            placeholder="DD/MM/YYYY"
                            value={values.incorporationDate}
                            type={TextInputType.Date}
                            onChangeText={(v) => setFieldValue("incorporationDate", v)}
                            required
                            error={(touched.incorporationDate || submitCount > 0) ? errors.incorporationDate : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Entity Type"
                            placeholder="Select the Entity Type"
                            type={TextInputType.Dropdown}
                            value={values.entityType}
                            options={entityTypeOptions}
                            required
                            onSelect={(v) => setFieldValue("entityType", v)}
                            error={(touched.entityType || submitCount > 0) ? errors.entityType : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Country"
                            placeholder="Select Country"
                            type={TextInputType.Dropdown}
                            value={values.country}
                            options={countryOptions}
                            onSelect={(v) => {
                                setFieldValue("country", v);
                                setFieldValue("state", "");
                                setFieldValue("city", "");
                                setSelectedState("");
                            }}
                            setSelectedValue={setSelectedCountry}
                            required
                            error={(touched.country || submitCount > 0) ? errors.country : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="State"
                            placeholder="Enter State"
                            value={values.state}
                            type={TextInputType.Dropdown}
                            options={stateOptions}
                            onSelect={(v) => {
                                setFieldValue("state", v);
                                setFieldValue("city", "");
                            }}
                            setSelectedValue={setSelectedState}
                            required
                            error={(touched.state || submitCount > 0) ? errors.state : undefined}
                            style={styles.inputStyle}
                            disabled={!selectedCountry}
                            searchValue={searchState}
                            onChangeSearch={setSearchState}
                        />

                        <TextInputClassic
                            label="City"
                            placeholder="Enter City"
                            value={values.city}
                            type={TextInputType.Dropdown}
                            options={cityOptions}
                            onSelect={(v) => setFieldValue("city", v)}
                            required
                            error={(touched.city || submitCount > 0) ? errors.city : undefined}
                            style={styles.inputStyle}
                            disabled={!selectedCountry || !selectedState}
                            searchValue={searchCity}
                            onChangeSearch={setSearchCity}
                        />

                        <TextInputClassic
                            label="Pincode"
                            placeholder="Enter Pin Code"
                            value={values.pincode}
                            onChangeText={handleChange("pincode")}
                            keyboardType="number-pad"
                            maxLength={6}
                            required
                            error={(touched.pincode || submitCount > 0) ? errors.pincode : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Registered Address"
                            placeholder="Enter Building / Street / Plot Number"
                            value={values.registeredAddress}
                            onChangeText={handleChange("registeredAddress")}
                            required
                            error={(touched.registeredAddress || submitCount > 0) ? errors.registeredAddress : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Landmark / Area"
                            placeholder="Enter Landmark / Area"
                            value={values.landmark}
                            onChangeText={handleChange("landmark")}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Industry Type"
                            placeholder="Select Industry Type"
                            value={values.industryType}
                            required
                            onChangeText={handleChange("industryType")}
                            error={(touched.industryType || submitCount > 0) ? errors.industryType : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Company Email"
                            placeholder="Enter Company Email"
                            value={values.companyEmail}
                            onChangeText={handleChange("companyEmail")}
                            keyboardType="email-address"
                            required
                            error={(touched.companyEmail || submitCount > 0) ? errors.companyEmail : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Company Phone Number"
                            placeholder="Enter Company Phone Number"
                            value={values.companyPhone}
                            onChangeText={handleChange("companyPhone")}
                            type={TextInputType.Mobile}
                            keyboardType="phone-pad"
                            required
                            error={(touched.companyPhone || submitCount > 0) ? errors.companyPhone : undefined}
                            style={styles.inputStyle}
                        />

                        <TextInputClassic
                            label="Website URL"
                            placeholder="Enter Website URL"
                            value={values.website}
                            onChangeText={handleChange("website")}
                            error={(touched.website || submitCount > 0) ? errors.website : undefined}
                            style={styles.inputStyle}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <ButtonSecondary
                            title={ButtonTextTypes.Back}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Right}
                            onPress={() => { }}
                            disabled={true}
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
})

export default Step1;
