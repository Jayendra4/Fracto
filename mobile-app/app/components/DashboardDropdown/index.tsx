import React, { useRef, useState } from 'react';
import {
    View, Text, Pressable, Animated, StyleSheet,
    StyleProp, ViewStyle, Modal, TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, useTheme } from '../../util/theme';

interface DashboardDropdownProps {
    data: string[];
    value: string;
    onChange: (value: string) => void;
    containerStyle?: StyleProp<ViewStyle>;
}

const DashboardDropdown: React.FC<DashboardDropdownProps> = ({
    data, value, onChange, containerStyle,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [open, setOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const buttonRef = useRef<View>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, width: 0 });

    const toggleDropdown = () => {
        if (!open) {
            buttonRef.current?.measureInWindow((x, y, width, height) => {
                const { width: screenWidth } = require('react-native').Dimensions.get('window');
                setDropdownPos({
                    top: y + height + 6,
                    right: screenWidth - x - width,
                    width,
                });
                setOpen(true);
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            });
        } else {
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setOpen(false));
        }
    };

    const rotate = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
    });

    return (
        <View style={[styles.wrapper, containerStyle]}>
            <Pressable
                ref={buttonRef}
                onPress={toggleDropdown}
                style={styles.button}
            >
                <View style={styles.content}>
                    <Text style={styles.selectedText}>{value}</Text>
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <Ionicons name="chevron-down" size={20} color="#fff" />
                    </Animated.View>
                </View>
            </Pressable>

            <Modal
                visible={open}
                transparent
                animationType="none"
                onRequestClose={toggleDropdown}
            >
                {/* Backdrop */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={toggleDropdown}
                />

                <Animated.View
                    style={[
                        styles.menu,
                        {
                            top: dropdownPos.top,
                            right: dropdownPos.right,
                            width: dropdownPos.width,
                            opacity: animation,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    {data.map((item, index) => (
                        <Pressable
                            key={item}
                            style={[
                                styles.item,
                                value === item && styles.activeItem,
                                index !== data.length - 1 && styles.border,
                            ]}
                            onPress={() => {
                                onChange(item);
                                toggleDropdown();
                            }}
                        >
                            <Text style={[styles.itemText, value === item && styles.activeText]}>
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </Animated.View>
            </Modal>
        </View>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        wrapper: {
            alignSelf: 'flex-start',
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.constant.primary,
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: 8,
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        selectedText: {
            color: '#fff',
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
        },
        backdrop: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
        },
        menu: {
            position: 'absolute',
            borderRadius: 6,
            backgroundColor: colors.isLight ? colors.background.secondary : '#0B1620',
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            maxHeight: 220,
        },
        item: {
            paddingVertical: 10,
            paddingHorizontal: 16,
        },
        activeItem: {
            backgroundColor: colors.isLight ? colors.background.secondary : '#1B2A3A',
        },
        border: {
            borderBottomWidth: colors.isLight ? 0.5 : 1,
            borderBottomColor: colors.isLight ? colors.border.divider : '#1F2F40',
        },
        itemText: {
            color: '#A9B4C2',
            fontSize: 15,
            fontFamily: 'WorkSans-Medium',
        },
        activeText: {
            color: colors.text.default,
            fontFamily: 'WorkSans-SemiBold',
        },
    });

export default DashboardDropdown;