import { StyleSheet, Text, View } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { KycStatusType } from "../Navigation/TabBar/TabBar.types";

interface Props {
    visible: boolean;
}

const CompleteKYC = ({ visible }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);

    const goToKYC = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.KYC,
        });
    }, [navigation]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={[styles.container, { backgroundColor: colors.background.slightly }]}>
                <Text style={styles.title}>
                    {userDetails?.kycStatus === KycStatusType.Submitted ?
                        "KYC Submitted" :
                        "Complete KYC to continue"
                    }
                </Text>
                <Text style={styles.subTitle}>
                    {userDetails?.kycStatus === KycStatusType.Submitted ?
                        "Your KYC has been submitted and is awaiting review." :
                        "Asset onboarding is available only after KYC approval."
                    }
                </Text>

                {userDetails?.kycStatus !== KycStatusType.Submitted && (
                    <ButtonPrimary
                        title={ButtonTextTypes.Go_to_KYC}
                        width={ButtonWidthTypes.Medium}
                        align={ButtonAlignTypes.Center}
                        buttonStyle={styles.kycButton}
                        textStyle={styles.kycButtonText}
                        onPress={goToKYC}
                    />
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200,
        },
        container: {
            width: "90%",
            borderRadius: 8,
            padding: 20,
            alignItems: "center",
        },
        title: {
            fontSize: 16,
            fontFamily: "WorkSans-Medium",
            color: colors.text.yellow,
            textAlign: "center",
        },
        subTitle: {
            fontSize: 12,
            fontFamily: "WorkSans-Medium",
            color: colors.text.extraLight,
            textAlign: "center",
            marginTop: 12,
        },
        kycButton: {
            marginTop: 16,
            height: 36,
        },
        kycButtonText: {
            fontSize: 14,
        },
    });

export default CompleteKYC;
