import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
} from 'react-native';
import { createStyles } from "./SelectAccountType.style"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import GoBack from '../../components/GoBack';
import TextInputClassic, { TextInputType } from '../../components/TextInputClassic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetCountriesApi } from '../../services/auth.service';
import { UserType } from '../../store/authSlice.types';

export const COUNTRY_KEY = "country";
export const DIALCODE_KEY = "dialCode";
export const COUNTRYINDEX_KEY = "countryIndex";
export const REFER_KEY = 'referCode';

interface Country {
    name: string;
    dialCode: string;
    flag: string;
    isoCode: string;
}

const SelectAccountType = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const { data: countries } = useGetCountriesApi();
    const [country, setCountry] = useState('');
    const [selectionError, setSelectionError] = useState('');
    const [referral, setReferral] = useState("")
    const route = useRoute();
    const { selectedType } = route.params as { selectedType: UserType };

    const countryOptions = countries?.map((country: Country) => ({
        label: country?.name?.length <= 3 ? country?.name?.toUpperCase() : country?.name,
        value: country?.name?.length <= 3 ? country?.name?.toUpperCase() : country?.name,
        flag: country?.flag,
        isoCode: country?.isoCode,
    }));

    const wayToSignUp = useCallback(() => {
        let hasError = false;
        AsyncStorage.removeItem(REFER_KEY);

        if (!country) {
            setSelectionError('Please select your country');
            hasError = true;
        }

        if (hasError) return;

        const selectedIndex = countries.findIndex(
            (item: any) => item?.name?.toLowerCase() === country?.split(' ')?.slice(-1)?.join('')?.toLowerCase()
        );

        if (selectedIndex === -1) {
            setSelectionError('Invalid country selected');
            return;
        }

        const selectedCountry = countries[selectedIndex];

        setSelectionError('');

        AsyncStorage.multiSet([
            [COUNTRY_KEY, selectedCountry.name],
            [DIALCODE_KEY, selectedCountry.dialCode],
            [COUNTRYINDEX_KEY, String(selectedIndex + 1)],
            [REFER_KEY, referral],
        ]);

        navigation.navigate(Routes.ONBOARDING.SIGNUP);
    }, [country, navigation, countries, referral]);

    const OnboardingScreen = colors.isLight ?
        require("../../assets/images/onboarding-screen-light.png") :
        require("../../assets/images/onboarding-screen.png")

    return (
        <ImageBackground
            source={OnboardingScreen}
            style={styles.wrapper}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.logoContainer}>
                    <View style={styles.goBack}>
                        <GoBack />
                    </View>
                    <Logo style={styles.logo} width={52} height={52} />
                </View>
                <View style={styles.details}>
                    <Text style={styles.title}>Create Your Account</Text>
                    <Text style={styles.emailInfo}>
                        Enter your details to get started. It only takes a few minutes...
                    </Text>
                </View>
                <View style={styles.inputs}>
                    <TextInputClassic
                        label="Country"
                        placeholder="Select Your Country"
                        type={TextInputType.Dropdown}
                        value={country}
                        required
                        options={countryOptions}
                        onSelect={setCountry}
                        error={selectionError}
                        setError={setSelectionError}
                    />
                </View>

                {selectedType !== UserType.ChannelPartner && (
                    <View style={styles.inputs}>
                        <TextInputClassic
                            label="Referral Code (Optional)"
                            placeholder="Enter Referral Code"
                            value={referral}
                            onChangeText={setReferral}
                        />
                    </View>
                )}

                <View style={styles.bottomContainer}>
                    <ButtonPrimary
                        title={ButtonTextTypes.Confirm}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        onPress={wayToSignUp}
                    />
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

export default SelectAccountType;