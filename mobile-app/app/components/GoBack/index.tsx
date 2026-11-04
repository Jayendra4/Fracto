import { Animated, Pressable, StyleSheet } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Colors, useTheme } from "../../util/theme";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../constant/Routes";
import { usePressScale } from "../../services/hooks/usePressScale";

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const GoBack = ({ customBack, withoutText }: { customBack?: () => void, withoutText?: boolean }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const { scale, onPressIn, onPressOut } = usePressScale();

    const goBack = () => customBack ? customBack() : navigation.goBack();

    return (
        <Pressable
            style={styles.wrapper}
            onPress={goBack}
            onPressIn={onPressIn}
            onPressOut={onPressOut}>
            <AnimatedIonicons
                name="chevron-back"
                color={colors.icon.primary}
                size={20}
                style={{ transform: [{ scale }] }}
            />
            {!withoutText && (
                <Animated.Text style={[styles.text, { transform: [{ scale }] }]}>
                    Back
                </Animated.Text>
            )}
        </Pressable>
    )
};

export default GoBack;

const createStyles = (colors: Colors) => StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 2,
        zIndex: 10,
        marginRight: 8,
        paddingVertical: 8,
    },
    text: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
})