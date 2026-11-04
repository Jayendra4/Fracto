import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, Animated } from "react-native";
import { useTheme } from "../../util/theme";
import { createStyles } from "./ChatMenu.style";

interface MenuOption {
    label: string;
    onPress: () => void;
    destructive?: boolean;
}

interface Params {
    visible: boolean;
    onClose: () => void;
    options: MenuOption[];
}

const ChatMenu = ({ visible, onClose, options }: Params) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    const [showMenu, setShowMenu] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowMenu(true);

            opacity.setValue(0);
            scale.setValue(0.9);

            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 6,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }).start(() => {
                setShowMenu(false);
            });
        }
    }, [visible]);

    if (!showMenu) return null;

    return (
        <Pressable style={styles.menuOverlay} onPress={onClose}>
            <Animated.View
                style={[
                    styles.menuBox,
                    {
                        opacity,
                        transform: [{ scale }],
                    },
                ]}
            >
                {options.map((item, index) => (
                    <Pressable
                        key={index}
                        style={styles.menuItem}
                        onPress={() => {
                            onClose();
                            item.onPress();
                        }}
                    >
                        <Text
                            style={[
                                styles.menuText,
                                item.destructive && { color: "red" },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </Pressable>
                ))}
            </Animated.View>
        </Pressable>
    );
};

export default ChatMenu;