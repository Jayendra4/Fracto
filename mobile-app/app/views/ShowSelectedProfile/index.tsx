import React, { useCallback } from 'react';
import {
    View,
    Text,
    ImageBackground,
} from 'react-native';
import { createStyles } from "./ShowSelectedProfile.types"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../util/theme';
import Logo from "../../assets/icons/logo.svg";
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import { ButtonAlignTypes, ButtonWidthTypes } from '../../components/buttons/Button.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import Routes, { NavigationProp } from '../../constant/Routes';
import GoBack from '../../components/GoBack';
import { UserType } from '../../store/authSlice.types';
import { userTypeData } from '../CreateYourAccount';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const ShowSelectedProfile = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const routes = useRoute();
    const { selectedType } = routes?.params as { selectedType: UserType };
    const { title, typeIcon: TypeIcon } = userTypeData[selectedType];

    const renderAccountType = useCallback(() => {
        navigation.navigate(Routes.ONBOARDING.SELECTACCOUNTTYPE, {
            selectedType,
        });
    }, [navigation, selectedType]);

    const renderSubTitle = () => {
        switch (selectedType) {
            case "Investor": return "Invest in curated commercial properties.";
            case "Asset Owner": return "Manage and list your commercial properties.";
            case "Channel Partner": return "Refer clients and earn commissions.";
        };
    };

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

                <View style={styles.contentWrapper}>
                    <ImageBackground
                        source={require('../../assets/images/selected_type.png')}
                        style={styles.showSelectedWrapper}
                        resizeMode='cover'
                    >
                        <View style={styles.infoRow}>
                            <View style={styles.iconWrapper}>
                                <TypeIcon width={34} height={30} />
                            </View>
                            <View>
                                <Text style={styles.selectedTitle}>{title}</Text>
                                {selectedType === UserType.ChannelPartner && (
                                    <Text style={styles.broker}>(Broker)</Text>
                                )}
                            </View>
                        </View>
                        <Text style={styles.subSelectedTitle}>
                            {renderSubTitle()}
                        </Text>
                        <View style={styles.checkRow}>
                            <View style={styles.checkIcon}>
                                <FontAwesome5 name="check" size={12} color={colors.constant.white} />
                            </View>
                            <Text style={styles.checkTitle}>Selected</Text>
                        </View>
                    </ImageBackground>
                </View>

                <View style={styles.bottomContainer}>
                    <ButtonPrimary
                        title={`Continue as ${selectedType}`}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        onPress={renderAccountType}
                    />
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

export default ShowSelectedProfile;