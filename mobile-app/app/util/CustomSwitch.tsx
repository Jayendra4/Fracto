import React, { useRef, useEffect } from 'react';
import {
    View,
    Animated,
    StyleSheet,
    StyleProp,
    ViewStyle,
    Pressable,
} from 'react-native';

interface CustomSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
    activeThumbColor?: string;
    style?: StyleProp<ViewStyle>;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
    value,
    onValueChange,
    disabled = false,
    activeColor = '#4F86B6',
    inactiveColor = 'transparent',
    thumbColor = '#4F86C0',
    activeThumbColor = '#00060C',
    style,
}) => {
    const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [value, translateX]);

    const handleToggle = () => {
        if (disabled) return;
        onValueChange(!value);
    };

    const thumbTranslate = translateX.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 11],
    });

    return (
        <Pressable
            onPress={handleToggle}
            disabled={disabled}
        >
            <View
                style={[
                    styles.track,
                    {
                        backgroundColor: value ? activeColor : inactiveColor,
                        opacity: disabled ? 0.6 : 1,
                    },
                    style,
                ]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            backgroundColor: value ? activeThumbColor : thumbColor,
                            transform: [{ translateX: thumbTranslate }],
                        },
                    ]}
                />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 24,
        height: 15,
        borderRadius: 50,
        justifyContent: 'center',
        borderWidth: 1.8,
        borderColor: "#4F86C0",
    },
    thumb: {
        position: 'absolute',
        width: 9,
        height: 9,
        borderRadius: 14,
    },
});

export default CustomSwitch;