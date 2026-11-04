import React from 'react';
import {
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
    StyleProp,
    ActivityIndicator,
    TextStyle,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, useTheme } from '../../util/theme';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from './Button.types';
import { usePressScale } from '../../services/hooks/usePressScale';

interface ButtonPrimaryProps {
    title: ButtonTextTypes;
    onPress: () => void;
    width?: ButtonWidthTypes;
    align?: ButtonAlignTypes;
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    buttonStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    icon?: React.ReactNode;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
    title,
    onPress,
    width = ButtonWidthTypes.Full,
    align = ButtonAlignTypes.Right,
    disabled = false,
    loading = false,
    style,
    buttonStyle,
    icon,
    textStyle,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { scale, onPressIn, onPressOut } = usePressScale();

    const containerStyle: ViewStyle = {
        width:
            width === ButtonWidthTypes.Full
                ? '100%'
                : width === ButtonWidthTypes.Medium
                    ? '50%'
                    : '22%',
        alignSelf:
            align === ButtonAlignTypes.Left
                ? 'flex-start'
                : align === ButtonAlignTypes.Right
                    ? 'flex-end'
                    : ButtonAlignTypes.Center,
    };

    const buttonHeight = width === ButtonWidthTypes.Half ? 36 : 48;
    const textSize = width === ButtonWidthTypes.Half ? 16 : 18;

    return (
        <View style={[containerStyle, style]}>
            <Pressable
                disabled={disabled || loading}
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <LinearGradient
                    colors={['#2A5A8D', '#4F86C0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.button,
                        disabled && styles.disabled,
                        {
                            height: buttonHeight,
                        },
                        buttonStyle,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.constant.white} />
                    ) : (
                        <>
                            {icon && icon}
                            <Animated.Text
                                style={[styles.text, {
                                    fontSize: textSize,
                                    transform: [{ scale }],
                                }, textStyle]}
                            >
                                {title}
                            </Animated.Text>
                        </>
                    )}
                </LinearGradient>
            </Pressable>
        </View>
    );
};

export default ButtonPrimary;

const createStyles = (colors: Colors) => StyleSheet.create({
    button: {
        flexDirection: 'row',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        columnGap: 8,
    },
    text: {
        color: colors.constant.white,
        fontSize: 18,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.6,
    },
});
