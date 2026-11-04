import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    View,
    ViewStyle,
    StyleProp,
    TextStyle,
} from 'react-native';
import { Colors, useTheme } from '../../util/theme';
import { SvgProps } from 'react-native-svg';

type ButtonWidth = 'full' | 'medium' | 'half';
type ButtonAlign = 'left' | 'center' | 'right';

interface ButtonTertiaryProps {
    title: string;
    onPress: () => void;
    width?: ButtonWidth;
    align?: ButtonAlign;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    icon?: React.FC<SvgProps>;
    buttonStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const ButtonTertiary: React.FC<ButtonTertiaryProps> = ({
    title,
    onPress,
    width = 'full',
    align = 'center',
    disabled = false,
    style,
    icon: Icon,
    buttonStyle,
    textStyle,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const containerStyle: ViewStyle = {
        width:
            width === 'full'
                ? '100%'
                : width === 'medium'
                    ? '50%'
                    : '30%',
        alignSelf:
            align === 'left'
                ? 'flex-start'
                : align === 'right'
                    ? 'flex-end'
                    : 'center',
    };

    return (
        <View style={[containerStyle, style]}>
            <Pressable onPress={onPress} disabled={disabled}>
                <View
                    style={[
                        styles.button,
                        disabled && styles.disabled,
                        buttonStyle
                    ]}
                >
                    {Icon && (
                        <Icon style={styles.icon} />
                    )}
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                </View>
            </Pressable>
        </View>
    );
};

export default ButtonTertiary;

const createStyles = (colors: Colors) => StyleSheet.create({
    button: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: colors.background.secondary,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    text: {
        color: colors.text.primary,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
        verticalAlign: 'middle',
    },
    disabled: {
        opacity: 0.6,
    },
});
