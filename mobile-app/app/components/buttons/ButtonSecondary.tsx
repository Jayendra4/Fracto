import React from 'react';
import {
    Pressable,
    StyleSheet,
    ViewStyle,
    StyleProp,
    ActivityIndicator,
    TextStyle,
    Animated,
} from 'react-native';
import { Colors, useTheme } from '../../util/theme';
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from './Button.types';
import { SvgProps } from 'react-native-svg';
import { usePressScale } from '../../services/hooks/usePressScale';

interface ButtonSecondaryProps {
    title: ButtonTextTypes;
    onPress: () => void;
    width?: ButtonWidthTypes;
    align?: ButtonAlignTypes;
    disabled?: boolean;
    buttonStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    loading?: boolean;
    icon?: React.FC<SvgProps>;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
    title,
    onPress,
    width = ButtonWidthTypes.Full,
    align = ButtonAlignTypes.Right,
    disabled = false,
    loading = false,
    buttonStyle,
    textStyle,
    icon: Icon,
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
        <Pressable
            disabled={disabled}
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={[
                containerStyle,
                {
                    height: buttonHeight,
                },
                styles.button,
                disabled && styles.disabled,
                buttonStyle,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={colors.constant.white} />
            ) : (
                <>
                    {Icon && (
                        <Icon style={styles.icon} width={20} height={20} />
                    )}
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
        </Pressable>
    );
};

export default ButtonSecondary;

const createStyles = (colors: Colors) => StyleSheet.create({
    button: {
        flexDirection: 'row',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border.primary,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    text: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
        verticalAlign: 'middle',
    },
    disabled: {
        opacity: 0.6,
    },
});
