import { StyleSheet, View, Text, Pressable } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import ArrowForward from "../../assets/icons/arrow-forward.svg";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface props {
    action: () => void;
}

const VerificationBanner = ({ action }: props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const userDetails = useSelector((state: RootState) => state.auth.user);

    return (
        <View style={styles.container}>
            {/* <View style={styles.textContainer}>
                <Text style={styles.title}>
                    Complete your KYC Process
                </Text>
                <Text style={styles.subtitle}>
                    Identity verification is required by regulation
                </Text>
            </View> */}

            <Pressable style={styles.ctaContainer} onPress={action}>
                <Text style={styles.title}>
                    {userDetails?.kycStatus === "Submitted" ? (
                        "KYC under review"
                    ) : (
                        "Complete your KYC Process"
                    )}
                </Text>
                <ArrowForward width={24} height={24} />
            </Pressable>
        </View>
    );
};

export default VerificationBanner;

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            marginHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border.lightDark,
            borderRadius: 5,
        },
        textContainer: {
            flex: 1,
            paddingHorizontal: 16,
            justifyContent: 'center',
            flexDirection: 'column',
        },
        title: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
        },
        subtitle: {
            color: colors.text.lightGrey,
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
        },
        ctaContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            minHeight: 40,
        },
        ctaText: {
            color: colors.text.green,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
            lineHeight: 20,
        },
    });
