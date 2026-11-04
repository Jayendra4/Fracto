import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, useTheme } from "../../util/theme";
import { createStyles } from "./SelectRoleAsAssetOwner.types";
import { Pressable, Text, View } from "react-native";
import Logo from "../../assets/icons/logo.svg";
import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useCallback, useState } from "react";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useUpdateRoleAsOwnerApi } from "../../services/hooks/useApi";
import * as Keychain from "react-native-keychain";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { refreshUser } from "../../store/authSlice";
import { AccountType } from "../../store/authSlice.types";
import LottieView from 'lottie-react-native';

type SelectRoleAsAssetOwnerStyles = ReturnType<typeof createStyles>;

type AssetTypeProps = {
    styles: SelectRoleAsAssetOwnerStyles;
    colors: Colors;
    animation?: any;
    title: string;
    active?: boolean;
    onPress: () => void;
};

export type RoleAsAssetOwner = 'Individual' | 'Company';
export const USER_TYPE_KEY = "USER_TYPE";

const AssetType: React.FC<AssetTypeProps> = React.memo(({
    styles,
    colors,
    animation,
    title,
    active,
    onPress,
}) => (
    <View style={{ width: '48%' }}>
        <Pressable
            style={[
                styles.typeWrapper,
                active && styles.activeWrapper,
            ]}
            onPress={onPress}
        >
            <LottieView
                source={animation}
                autoPlay
                loop
                style={{ width: '100%', height: '100%' }}
            />
        </Pressable>

        <Pressable
            onPress={onPress}
            style={[
                styles.typeButton,
                active && styles.typeButtonActive
            ]}
        >
            <Text
                style={[
                    styles.typeTitle,
                    active && styles.typeTitleActive
                ]}
            >
                {title}
            </Text>

            <Ionicons
                name="arrow-forward"
                size={18}
                color={active ? colors.constant.white : colors.text.primary}
            />
        </Pressable>
    </View>
));

const SelectRoleAsAssetOwner = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const { mutateAsync } = useUpdateRoleAsOwnerApi();
    const dispatch = useDispatch<AppDispatch>();
    const identifier = useSelector((state: RootState) => state.auth.identifier);
    const [selectedType, setSelectedType] = useState<RoleAsAssetOwner | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectIndividual = useCallback(() => setSelectedType('Individual'), []);
    const selectCompany = useCallback(() => setSelectedType('Company'), []);

    const navigateToProperty = useCallback(async () => {
        try {
            setIsLoading(true);
            const roleType = selectedType === 'Individual' ?
                AccountType.AssetOwner : AccountType.Company;
            const res = await mutateAsync({
                type: roleType as RoleAsAssetOwner,
            })
            const { accessToken, type } = res.data;
            await Keychain.setGenericPassword(identifier as string, accessToken, {
                service: 'accessToken',
            });
            await AsyncStorage.setItem(USER_TYPE_KEY, type);
            await dispatch(refreshUser());
            navigation.navigate(Routes.TABS.HOME, {
                screen: Routes.TABS.PROPERTY,
            });
        } catch (error) {
            console.log(error, 'Failed to set role')
        } finally {
            setIsLoading(false);
        }
    }, [navigation, selectedType, identifier]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={[styles.container, styles.selectContainer]}>
                <View style={styles.logoContainer}>
                    <Logo style={styles.logo} width={52} height={52} />
                </View>
                <View style={[styles.details, { rowGap: 8 }]}>
                    <Text style={[styles.title, styles.selectTitle]}>
                        Select Your Role As Asset Owner
                    </Text>
                    <Text style={[styles.emailInfo, styles.selectSubTitle]}>
                        Select your ownership role and enter the future of assets
                    </Text>
                </View>
                <View style={styles.typesRow}>
                    <AssetType
                        animation={require("../../animations/individualRole.json")}
                        styles={styles}
                        colors={colors}
                        title="Individual"
                        active={selectedType === 'Individual'}
                        onPress={selectIndividual}
                    />

                    <AssetType
                        animation={require("../../animations/companyRole.json")}
                        styles={styles}
                        colors={colors}
                        title="Company"
                        active={selectedType === 'Company'}
                        onPress={selectCompany}
                    />
                </View>
            </View>
            <ButtonPrimary
                title={ButtonTextTypes.Continue}
                width={ButtonWidthTypes.Full}
                align={ButtonAlignTypes.Center}
                disabled={!selectedType}
                loading={isLoading}
                buttonStyle={styles.continueButton}
                onPress={navigateToProperty}
            />
        </SafeAreaView>
    );
};

export default SelectRoleAsAssetOwner;