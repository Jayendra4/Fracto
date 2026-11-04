import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    Pressable,
    Animated,
    StyleSheet,
    StyleProp,
    ViewStyle,
    TextStyle,
} from "react-native";
import { Colors, useTheme } from "../../util/theme";

interface TabItem {
    key: string;
    label: string;
}

interface AnimatedTabBarProps {
    tabs: TabItem[];
    activeKey: string;
    onChange: (key: string) => void;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    indicatorColor?: string;
    activeTextColor?: string;
    inactiveTextColor?: string;
    variant?: "fixed" | "scroll";
}

const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
    tabs,
    activeKey,
    onChange,
    containerStyle,
    labelStyle,
    indicatorColor = "#2A5A8D",
    activeTextColor = "#FFFFFF",
    inactiveTextColor = "#2A5A8D",
    variant
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const translateX = useRef(new Animated.Value(0)).current;
    const indicatorWidth = useRef(new Animated.Value(0)).current;
    const tabLayouts = useRef<{ x: number; width: number }[]>([]).current;

    useEffect(() => {
        const index = tabs.findIndex((t) => t.key === activeKey);
        const layout = tabLayouts[index];

        if (!layout) return;

        Animated.parallel([
            Animated.spring(translateX, {
                toValue: layout.x,
                useNativeDriver: false,
            }),
            Animated.spring(indicatorWidth, {
                toValue: layout.width,
                useNativeDriver: false,
            }),
        ]).start();
    }, [activeKey, tabLayouts.length]);

    const resolvedInactiveTextColor =
        colors.isLight ? colors.constant.black : inactiveTextColor;

    return (
        <View
            style={[
                styles.container,
                containerStyle,
                variant === "scroll" && { alignSelf: "flex-start" },
                variant === "fixed" && { alignSelf: "stretch" },
            ]}
        >
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        width: Animated.subtract(indicatorWidth, 8),
                        backgroundColor: indicatorColor,
                        transform: [{ translateX }],
                    },
                ]}
            />


            {tabs.map((tab, index) => {
                const isActive = tab.key === activeKey;

                return (
                    <Pressable
                        key={tab.key}
                        onLayout={(e) => {
                            const layout = {
                                x: e.nativeEvent.layout.x,
                                width: e.nativeEvent.layout.width,
                            };

                            tabLayouts[index] = layout;
                            if (index === 0 && tabLayouts.length === 1) {
                                translateX.setValue(layout.x);
                                indicatorWidth.setValue(layout.width);
                            }
                        }}
                        style={[
                            styles.tab,
                            variant === "fixed" && { flex: 1 }
                        ]}
                        onPress={() => onChange(tab.key)}
                    >
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="middle"
                            style={[
                                styles.text,
                                labelStyle,
                                { color: isActive ? activeTextColor : resolvedInactiveTextColor },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

export default AnimatedTabBar;

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        backgroundColor: colors.isLight ? colors.background.darkBlue : colors.background.inverse,
        borderRadius: 100,
        flexDirection: "row",
        position: "relative",
        height: 35,
        overflow: "hidden",
    },
    indicator: {
        position: "absolute",
        top: 4,
        bottom: 4,
        left: 4,
        borderRadius: 100,
    },
    tab: {
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
    },
    text: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
    },
});