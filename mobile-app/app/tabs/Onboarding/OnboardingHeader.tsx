import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useNavigation } from "@react-navigation/native";
import { Colors, useTheme } from "../../util/theme";

interface Props {
    title?: string;
    desc?: string;
}

const OnboardingHeader = ({ title, desc }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();

    const doItLater = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.PROPERTY,
        });
    }, [navigation]);

    return (
        <View style={styles.header}>
            <View style={{ flexShrink: 1 }}>
                <Text
                    style={styles.headerTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title ?? "Director KYC Steps"}
                </Text>
                <Text
                    style={styles.headerDesc}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {desc ?? "Complete your KYC. It will only take few minutes..."}
                </Text>
            </View>
            <Pressable
                style={styles.doLater}
                onPress={doItLater}
            >
                <Text style={styles.doLaterText}>Skip</Text>
            </Pressable>
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    headerDesc: {
        color: colors.text.extraLight,
        fontSize: 10,
        fontFamily: 'WorkSans-Regular',
    },
    doLater: {
        backgroundColor: '#F5F5F51F',
        borderWidth: 0.6,
        borderColor: colors.border.primary,
        borderRadius: 4,
        paddingHorizontal: 12,
        marginLeft: 8,
        height: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doLaterText: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
    },
})

export default OnboardingHeader;