import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Formik } from "formik";
import { MasterRWAStep1Schema } from "../../util/formValidationSchema";
import TextInputClassic, { TextInputType } from "../../components/TextInputClassic";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import { useGetCitiesApi, useGetCountriesApi, useGetStatesApi } from "../../services/auth.service";
import GeoLocationMap from "../../util/GeoLocationMap";
import AssetImagesPicker from "../../util/AssetImagesPicker";
import AssetVideosPicker from "../../util/AssetVideosPicker";
import { debounce } from "lodash";
import WhyTheyInvest from "../../components/WhyTheyInvest";

const initialValues = {
    assetType: "",
    subType: "",
    assetTitle: "",
    shortDescription: "",
    detailedDescription: "",
    building: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    geoLocation: "",
    whyInvest: [],
    assetImages: [],
    assetVideos: [],
};

type InitialValuesKeys = typeof initialValues;

interface Step1Props {
    data: InitialValuesKeys;
    isLoading: boolean;
    onNext: (data: Step1Props['data']) => void;
}

interface Country {
    name: string;
    dialCode: string;
    flag: string;
    isoCode: string;
}

const assetTypeOptions = [
    { label: "Real Estate", value: "Real Estate" },
    { label: "Solar", value: "Solar" },
    { label: "Machinery", value: "Machinery" },
    { label: "EVFleet", value: "EVFleet" },
    { label: "Warehouse", value: "Warehouse" },
    { label: "Store", value: "Store" },
    { label: "Gold", value: "Gold" },
    { label: "Business", value: "Business" },
    { label: "IP", value: "IP" },
    { label: "Others", value: "Others" },
];

const Step1: React.FC<Step1Props> = ({ data, isLoading, onNext }) => {
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
        <Formik
            initialValues={{
                ...data,
                whyInvest: data?.whyInvest ?? [],
            }}
            enableReinitialize
            validationSchema={MasterRWAStep1Schema}
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
            }) => (
                <>
                    <View style={styles.inputs}>
                        <TextInputClassic
                            label="Asset Type"
                            placeholder="Select The Asset Type"
                            type={TextInputType.Dropdown}
                            options={assetTypeOptions}
                            value={values.assetType}
                            required
                            onSelect={(v) => setFieldValue("assetType", v)}
                            onBlur={handleBlur('assetType')}
                            error={errors.assetType && touched.assetType ? errors.assetType : undefined}
                        />

                        <TextInputClassic
                            label="Asset Sub-Type"
                            placeholder="Enter the sub type"
                            value={values.subType}
                            onChangeText={handleChange("subType")}
                            required
                            onBlur={handleBlur('subType')}
                            error={errors.subType && touched.subType ? errors.subType : undefined}
                        />

                        <TextInputClassic
                            label="Asset Title"
                            placeholder="Enter Asset Title"
                            value={values.assetTitle}
                            onChangeText={handleChange("assetTitle")}
                            required
                            onBlur={handleBlur('assetTitle')}
                            error={errors.assetTitle && touched.assetTitle ? errors.assetTitle : undefined}
                            helpText="Title for the asset to help users easily identify it."
                        />

                        <TextInputClassic
                            label="Short Description"
                            placeholder="Describe your asset in 50–250 characters"
                            value={values.shortDescription}
                            multiline
                            required
                            onChangeText={handleChange("shortDescription")}
                            onBlur={handleBlur('shortDescription')}
                            error={errors.shortDescription && touched.shortDescription ? errors.shortDescription : undefined}
                            style={{ height: 120, alignItems: 'flex-start' }}
                            helpText="Provide a brief summary of the asset highlighting key details"
                        />

                        <TextInputClassic
                            label="Detailed Description"
                            placeholder="Give full detailed explanation of the asset"
                            value={values.detailedDescription}
                            multiline
                            required
                            onChangeText={handleChange("detailedDescription")}
                            onBlur={handleBlur('detailedDescription')}
                            error={errors.detailedDescription && touched.detailedDescription ? errors.detailedDescription : undefined}
                            style={{ height: 160, alignItems: 'flex-start' }}
                            helpText="Add a comprehensive description including features, specifications, and important information."
                        />

                        <TextInputClassic
                            label="Address"
                            placeholder="Enter Building / Street / Plot Number"
                            value={values.building}
                            onChangeText={handleChange("building")}
                            required
                            onBlur={handleBlur('building')}
                            error={errors.building && touched.building ? errors.building : undefined}
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
                            options={countryOptions}
                            value={values.country}
                            onSelect={(v) => {
                                setFieldValue("country", v);
                                setFieldValue("state", "");
                                setFieldValue("city", "");
                                setSelectedState("");
                            }}
                            setSelectedValue={setSelectedCountry}
                            required
                            onBlur={handleBlur('country')}
                            error={errors.country && touched.country ? errors.country : undefined}
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
                            onBlur={handleBlur('state')}
                            error={errors.state && touched.state ? errors.state : undefined}
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
                            onBlur={handleBlur('city')}
                            error={errors.city && touched.city ? errors.city : undefined}
                            disabled={!selectedCountry || !selectedState}
                            searchValue={searchCity}
                            onChangeSearch={setSearchCity}
                        />

                        <TextInputClassic
                            label="Pincode"
                            placeholder="Enter Pincode"
                            value={values.pincode}
                            keyboardType="numeric"
                            onChangeText={handleChange("pincode")}
                            maxLength={6}
                            required
                            onBlur={handleBlur('pincode')}
                            error={errors.pincode && touched.pincode ? errors.pincode : undefined}
                        />

                        <TextInputClassic
                            label="Geo Location"
                            placeholder="Enter Your Geo Location"
                            value={values.geoLocation}
                            onChangeText={handleChange("geoLocation")}
                            required
                            onBlur={handleBlur('geoLocation')}
                            error={errors.geoLocation && touched.geoLocation ? errors.geoLocation : undefined}
                        />

                        <GeoLocationMap
                            onChange={(v) => setFieldValue("geoLocation", v)}
                        />

                        <WhyTheyInvest
                            value={values.whyInvest}
                            onChange={(v: any) => setFieldValue("whyInvest", v)}
                            error={
                                (touched.whyInvest || submitCount > 0) &&
                                    typeof errors.whyInvest === "string"
                                    ? errors.whyInvest
                                    : undefined
                            }
                        />

                        <AssetImagesPicker
                            images={values.assetImages}
                            onChange={(v) => setFieldValue("assetImages", v)}
                            maxImagesAllowed={25}
                            error={(touched.assetImages || submitCount > 0) && typeof errors.assetImages === 'string' ? errors.assetImages : undefined}
                            helpText="Upload at least 5 images. Maximum file size allowed is 300 MB per file."
                        />

                        <AssetVideosPicker
                            videos={values.assetVideos}
                            onChange={(v) => setFieldValue("assetVideos", v)}
                            maxVideosAllowed={5}
                            error={(touched.assetVideos || submitCount > 0) && typeof errors.assetVideos === 'string' ? errors.assetVideos : undefined}
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
                            loading={isLoading}
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
