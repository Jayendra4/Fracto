import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Formik } from "formik";
import { DirectorsKYCStep1Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import { CreateDirectorPayload, useCompanyBasicDetail, useGetCitiesApi, useGetCountriesApi, useGetStatesApi } from "../../services/auth.service";
import { useCreateDirectorApi } from "../../services/hooks/useApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import Toast from "react-native-toast-message";
import { DIRECTOR_ID_KEY, DIRECTOR_KYC_STEP_KEY } from ".";
import { debounce } from "lodash";

interface Step1Props {
    onNext: (data: any) => void;
    initialValues: any;
    directorId?: number;
}

interface Country {
    name: string;
    dialCode: string;
    flag: string;
    isoCode: string;
}


export interface DirectorStep1FormValues {
    firstName: string;
    lastName: string;
    roleInCompany: string;
    dob: string;
    nationality: string;
    panNumber: string;
    emiratesIdNumber?: string;
    passportNumber: string;
    registeredAddress: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    companyPhone: string;
    email: string;
}

const roleOptions = [
    { label: "Director", value: "Director" },
    { label: "Promoter", value: "Promoter" },
    { label: "UBO", value: "Ubo" },
    { label: "Trustee", value: "Trustee" },
    { label: "Authorised Signatory", value: "AuthorisedSignatory" },
];

const Step1: React.FC<Step1Props> = ({ onNext, initialValues }) => {
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
    const { mutateAsync, isPending } = useCreateDirectorApi();
    const { data: companyData } = useCompanyBasicDetail();

    const companyId = companyData?.id;

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

    const countryOptions = useMemo(() =>
        countries?.map((country: Country) => ({
            label: country?.name?.length <= 3 ? country?.name?.toUpperCase() : country?.name,
            value: country?.name?.length <= 3 ? country?.name?.toUpperCase() : country?.name,
            flag: country?.flag,
            isoCode: country?.isoCode,
        })), [countries]);

    const stateOptions = useMemo(() =>
        states?.map((state: any) => ({
            label: state?.name,
            value: state?.name,
            isoCode: state?.code,
        })), [states]);

    const cityOptions = useMemo(() =>
        cities?.map((city: any) => ({
            label: city?.name,
            value: city?.name,
        })), [cities]);

    const buildDirectorPayload = (values: any): CreateDirectorPayload => ({
        firstName: values.firstName,
        lastName: values.lastName,
        roleInCompany: values.roleInCompany,
        dateOfBirth: moment(values.dob, "DD/MM/YYYY").toISOString(),
        nationality: values.nationality,
        panNumber: values.panNumber,
        passportNumber: values.passportNumber,
        email: values.email,
        mobileNumber: String(values.companyPhone),

        address: {
            line1: values.registeredAddress,
            line2: values.landmark,
            city: values.city,
            state: values.state,
            country: values.country,
            pincode: values.pincode,
        },

        emiratesIdNumber: values.emiratesIdNumber,

    });

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={DirectorsKYCStep1Schema}
            onSubmit={async (values) => {
                if (!companyId) {
                    Toast.show({
                        type: "error",
                        text1: "Company ID missing",
                    });
                    return;
                }

                try {
                    const payload = buildDirectorPayload(values);

                    const res = await mutateAsync({
                        companyId,
                        payload,
                    });

                    const directorId = res?.director?.id;

                    if (!directorId) {
                        Toast.show({
                            type: "error",
                            text1: "Director creation failed",
                        });
                        return;
                    }

                    await AsyncStorage.multiSet([
                        [DIRECTOR_ID_KEY, String(directorId)],
                        [DIRECTOR_KYC_STEP_KEY, "2"],
                    ]);

                    Toast.show({
                        type: "success",
                        text1: "Step 1 Completed",
                    });

                    onNext({
                        directorId: String(directorId),
                        formData: values,
                    });

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
                            label="First Name"
                            placeholder="Enter First Name"
                            value={values.firstName}
                            onChangeText={handleChange("firstName")}
                            required
                            error={(touched.firstName || submitCount > 0) ? (errors.firstName as string) : undefined}
                        />

                        <TextInputClassic
                            label="Last Name"
                            placeholder="Enter Last Name"
                            value={values.lastName}
                            onChangeText={handleChange("lastName")}
                            required
                            error={(touched.lastName || submitCount > 0) ? (errors.lastName as string) : undefined}
                        />

                        <TextInputClassic
                            label="Role In Company"
                            placeholder="Select The Role In Company"
                            type={TextInputType.Dropdown}
                            value={values.roleInCompany}
                            options={roleOptions}
                            onSelect={(v) => setFieldValue("roleInCompany", v)}
                            required
                            error={(touched.roleInCompany || submitCount > 0) ? (errors.roleInCompany as string) : undefined}
                        />

                        <TextInputClassic
                            label="Date of Birth"
                            placeholder="DD/MM/YYYY"
                            value={values.dob}
                            type={TextInputType.Date}
                            onChangeText={(v) => setFieldValue("dob", v)}
                            required
                            error={(touched.dob || submitCount > 0) ? (errors.dob as string) : undefined}
                        />

                        <TextInputClassic
                            label="Nationality"
                            placeholder="Select Nationality"
                            type={TextInputType.Dropdown}
                            value={values.nationality}
                            options={countryOptions}
                            onSelect={(v) => setFieldValue("nationality", v)}
                            required
                            error={(touched.nationality || submitCount > 0) ? (errors.nationality as string) : undefined}
                        />

                        {
                            values.nationality?.includes("India") && (
                                <TextInputClassic
                                    label="PAN Number"
                                    placeholder="Enter Your PAN Number"
                                    value={values.panNumber}
                                    onChangeText={handleChange("panNumber")}
                                    required
                                    error={(touched.panNumber || submitCount > 0)
                                        ? (errors.panNumber as string)
                                        : undefined}
                                />
                            )
                        }

                        {
                            values.nationality?.includes("UAE") && (
                                <TextInputClassic
                                    label="Emirates ID Number (UAE)"
                                    placeholder="Enter Emirates ID"
                                    value={values.emiratesIdNumber}
                                    onChangeText={handleChange("emiratesIdNumber")}
                                    required
                                    error={(touched.emiratesIdNumber || submitCount > 0)
                                        ? (errors.emiratesIdNumber as string)
                                        : undefined}
                                />
                            )
                        }

                        <TextInputClassic
                            label="Passport Number (Optional) "
                            placeholder="Enter Passport Number"
                            value={values.passportNumber}
                            onChangeText={handleChange("passportNumber")}
                            error={(touched.passportNumber || submitCount > 0) ? (errors.passportNumber as string) : undefined}
                        />

                        <TextInputClassic
                            label="Registered Address"
                            placeholder="Enter Building / Street / Plot Number"
                            value={values.registeredAddress}
                            onChangeText={handleChange("registeredAddress")}
                            required
                            error={(touched.registeredAddress || submitCount > 0) ? (errors.registeredAddress as string) : undefined}
                        />

                        <TextInputClassic
                            label="Landmark / Area"
                            placeholder="Enter Landmark / Area"
                            value={values.landmark}
                            onChangeText={handleChange("landmark")}
                        />

                        <TextInputClassic
                            label="Country"
                            placeholder="Select The Country"
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
                            error={(touched.country || submitCount > 0) ? (errors.country as string) : undefined}
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
                            error={(touched.state || submitCount > 0) ? (errors.state as string) : undefined}
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
                            disabled={!selectedCountry || !selectedState}
                            error={(touched.city || submitCount > 0) ? (errors.city as string) : undefined}
                            searchValue={searchCity}
                            onChangeSearch={setSearchCity}
                        />

                        <TextInputClassic
                            label="Pincode"
                            placeholder="Enter Pin Code"
                            value={values.pincode}
                            maxLength={6}
                            keyboardType="number-pad"
                            onChangeText={handleChange("pincode")}
                            required
                            error={(touched.pincode || submitCount > 0) ? (errors.pincode as string) : undefined}
                        />

                        <TextInputClassic
                            label="Company Phone Number"
                            placeholder="Enter Phone Number"
                            value={values.companyPhone}
                            type={TextInputType.Mobile}
                            keyboardType="phone-pad"
                            onChangeText={handleChange("companyPhone")}
                            required
                            error={(touched.companyPhone || submitCount > 0) ? (errors.companyPhone as string) : undefined}
                        />

                        <TextInputClassic
                            label="Email"
                            placeholder="Enter Your Email"
                            value={values.email}
                            keyboardType="email-address"
                            onChangeText={handleChange("email")}
                            required
                            error={(touched.email || submitCount > 0) ? (errors.email as string) : undefined}
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
