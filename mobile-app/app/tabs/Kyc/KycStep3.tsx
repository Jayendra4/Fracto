import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import { Formik } from "formik";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import { KycStep3Schema } from "../../util/formValidationSchema";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import FileUpload from "../../components/FileUpload";
import { useEffect, useMemo, useState } from "react";
import { useGetCitiesApi, useGetCountriesApi, useGetStatesApi } from "../../services/auth.service";
import { debounce } from "lodash";

interface Props {
    onBack: () => void;
    data: {
        address: string,
        landmark: string,
        city: string,
        state: string,
        pincode: string,
        country: string,
        addressId: string,
        addressProof: any,
    };
    onNext: (data: Props['data']) => void;
}

interface Country {
    name: string;
    dialCode: string;
    flag: string;
    isoCode: string;
}

const addressIdOptions = ["Bank Statement", "Utility Bill", "Aadhaar XML"];

const fields = [
    'address',
    'landmark',
    'country',
    'state',
    'city',
    'pincode',
    'addressProof',
];

const KycStep3 = ({ onBack, data, onNext }: Props) => {
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

    return (
        <View style={styles.wrapper}>
            <Formik
                initialValues={data}
                validationSchema={KycStep3Schema}
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
                    setFieldValue
                }) => (
                    <>
                        <FlatList
                            data={fields}
                            keyExtractor={(item) => item}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.inputs}
                            renderItem={({ item }) => {
                                switch (item) {
                                    case 'address':
                                        return (
                                            <TextInputClassic
                                                label="Permanent Address"
                                                placeholder="Enter Building / Street / Plot Number"
                                                value={values.address}
                                                onChangeText={handleChange("address")}
                                                error={(touched.address || submitCount > 0) ? errors.address : undefined}
                                                required
                                            />
                                        );
                                    case 'landmark':
                                        return (
                                            <TextInputClassic
                                                label="Enter Landmark"
                                                placeholder="Enter Landmark / Area"
                                                value={values.landmark}
                                                onChangeText={handleChange("landmark")}
                                            />
                                        );
                                    case 'city':
                                        return (
                                            <TextInputClassic
                                                label="City"
                                                placeholder="Select City"
                                                type={TextInputType.Dropdown}
                                                value={values.city}
                                                onSelect={(v) => setFieldValue("city", v)}
                                                options={cityOptions}
                                                error={(touched.city || submitCount > 0) ? errors.city : undefined}
                                                required
                                                disabled={!selectedCountry || !selectedState}
                                                searchValue={searchCity}
                                                onChangeSearch={setSearchCity}
                                            />
                                        )
                                    case 'state':
                                        return (
                                            <TextInputClassic
                                                label="State"
                                                placeholder="Select State"
                                                type={TextInputType.Dropdown}
                                                value={values.state}
                                                onSelect={(v) => {
                                                    setFieldValue("state", v);
                                                    setFieldValue("city", "");
                                                }}
                                                setSelectedValue={setSelectedState}
                                                options={stateOptions}
                                                error={(touched.state || submitCount > 0) ? errors.state : undefined}
                                                required
                                                disabled={!selectedCountry}
                                                searchValue={searchState}
                                                onChangeSearch={setSearchState}
                                            />
                                        )
                                    case 'pincode':
                                        return (
                                            <TextInputClassic
                                                label="Pincode"
                                                placeholder="Enter Pincode"
                                                keyboardType="numeric"
                                                value={values.pincode}
                                                onChangeText={handleChange("pincode")}
                                                maxLength={6}
                                                error={(touched.pincode || submitCount > 0) ? errors.pincode : undefined}
                                                required
                                            />
                                        )
                                    case 'country':
                                        return (
                                            <TextInputClassic
                                                label="Country"
                                                placeholder="Select Country"
                                                type={TextInputType.Dropdown}
                                                value={values.country}
                                                onSelect={(v) => {
                                                    setFieldValue("country", v);
                                                    setFieldValue("state", "");
                                                    setFieldValue("city", "");
                                                    setSelectedState("");
                                                }}
                                                setSelectedValue={setSelectedCountry}
                                                options={countryOptions}
                                                error={(touched.country || submitCount > 0) ? errors.country : undefined}
                                                required
                                            />
                                        )
                                    case 'addressProof':
                                        return (
                                            // <FileUpload
                                            //     label="Upload Address Proof"
                                            //     required
                                            //     value={values.addressProof}
                                            //     onSelect={(f) => setFieldValue("addressProof", f)}
                                            //     error={(touched.addressProof || submitCount > 0) && typeof errors.addressProof === 'string'
                                            //         ? errors.addressProof
                                            //         : undefined}
                                            // />
                                            <View style={styles.content}>
                                                <Text style={styles.label}>
                                                    Upload Address Proof <Text style={styles.required}> *</Text>
                                                </Text>

                                                <View style={styles.radioWrapper}>
                                                    <View style={[styles.radioRow, values.addressProof && { opacity: 0.6 }]}>
                                                        {addressIdOptions.map(option => (
                                                            <Pressable
                                                                key={option}
                                                                style={styles.radioItem}
                                                                onPress={() => setFieldValue("addressId", option)}
                                                                disabled={!!values.addressProof}
                                                            >
                                                                <View style={[
                                                                    styles.radioOuter,
                                                                    {
                                                                        backgroundColor:
                                                                            values.addressId === option ? '#1479E5' : 'transparent',
                                                                        borderColor:
                                                                            values.addressId === option
                                                                                ? colors.border.primary
                                                                                : colors.text.muted,
                                                                    }
                                                                ]} />
                                                                <Text
                                                                    style={[
                                                                        styles.radioText,
                                                                        {
                                                                            color:
                                                                                values.addressId === option
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
                                                    {(touched.addressId || submitCount > 0) && errors.addressId && (
                                                        <Text style={styles.errorText}>
                                                            {errors.addressId}
                                                        </Text>
                                                    )}
                                                </View>
                                                <View style={[styles.fileUploadWrapper, {
                                                    opacity: values.addressId ? 1 : 0.6,
                                                }]}>
                                                    <FileUpload
                                                        value={values.addressProof}
                                                        onSelect={(f) => setFieldValue("addressProof", f)}
                                                        error={(touched.addressProof || submitCount > 0) && typeof errors.addressProof === 'string'
                                                            ? errors.addressProof
                                                            : undefined}
                                                        disabled={!values.addressId}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    default: return null;
                                }
                            }}
                        />
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
                )
                }
            </Formik>
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
        paddingTop: 10,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
        color: colors.text.default,
        marginBottom: 6,
    },
    required: {
        color: colors.danger.default,
    },
    radioWrapper: {
        marginBottom: 10,
    },
    radioRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: 'center',
        gap: 10,
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
    fileUploadWrapper: {
        flex: 1,
        marginBottom: 10
    },
    errorText: {
        color: colors.danger.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
})

export default KycStep3;