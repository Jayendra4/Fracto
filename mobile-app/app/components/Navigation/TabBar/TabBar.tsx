import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Colors, useTheme } from "../../../util/theme";
import { TabBarIconKey } from "./TabBar.types";
import {
    BottomTabBarProps,
    BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardIcon from "../../../assets/icons/tab_dashboard.svg";
import DashboardSelectedIcon from "../../../assets/icons/tab_selected_dashboard.svg";
import DashboardLightIcon from "../../../assets/icons/tab_dashboard_light.svg";

import PropertyIcon from "../../../assets/icons/tab_property.svg";
import PropertySelectedIcon from "../../../assets/icons/tab_selected_property.svg";
import PropertyLightIcon from "../../../assets/icons/tab_property_light.svg";

import KycIcon from "../../../assets/icons/tab_kyc.svg";
import KycSelectedIcon from "../../../assets/icons/tab_selected_kyc.svg";
import KycLightIcon from "../../../assets/icons/tab_kyc_light.svg";

import FundsIcon from "../../../assets/icons/tab_funds.svg";
import FundsSelectedIcon from "../../../assets/icons/tab_selected_funds.svg";
import FundsLightIcon from "../../../assets/icons/tab_funds_light.svg";

import AssetIcon from "../../../assets/icons/tab_asset.svg";
import AssetSelectedIcon from "../../../assets/icons/tab_selected_asset.svg";
import AssetLightIcon from "../../../assets/icons/tab_asset_light.svg";

import ProfileIcon from "../../../assets/icons/tab_profile.svg";
import ProfileSelectedIcon from "../../../assets/icons/tab_selected_profile.svg";
import ProfileLightIcon from "../../../assets/icons/tab_profile_light.svg";

import OnboardingIcon from "../../../assets/icons/tab_onboarding.svg";
import OnboardingSelectedIcon from "../../../assets/icons/tab_selected_onboarding.svg";
import OnboardingLightIcon from "../../../assets/icons/tab_onboarding_light.svg";

const iconRegistry = {
    [TabBarIconKey.Dashboard]: {
        default: DashboardIcon,
        light: DashboardLightIcon,
        selected: DashboardSelectedIcon,
    },
    [TabBarIconKey.Property]: {
        default: PropertyIcon,
        light: PropertyLightIcon,
        selected: PropertySelectedIcon,
    },
    [TabBarIconKey.Kyc]: {
        default: KycIcon,
        light: KycLightIcon,
        selected: KycSelectedIcon,
    },
    [TabBarIconKey.Funds]: {
        default: FundsIcon,
        light: FundsLightIcon,
        selected: FundsSelectedIcon,
    },
    [TabBarIconKey.Asset]: {
        default: AssetIcon,
        light: AssetLightIcon,
        selected: AssetSelectedIcon,
    },
    [TabBarIconKey.Profile]: {
        default: ProfileIcon,
        light: ProfileLightIcon,
        selected: ProfileSelectedIcon,
    },
    [TabBarIconKey.Onboarding]: {
        default: OnboardingIcon,
        light: OnboardingLightIcon,
        selected: OnboardingSelectedIcon,
    },
};

type MyTabOptions = BottomTabNavigationOptions & {
    tabBarIconKey?: TabBarIconKey;
};

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { colors } = useTheme();
    const { bottom } = useSafeAreaInsets();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const getIcon = useCallback(
        (key?: TabBarIconKey, focused?: boolean) => {
            if (!key) return null;

            const iconSet = iconRegistry[key];
            if (!iconSet) return null;

            if (focused) return iconSet.selected;
            return colors.isLight ? iconSet.light : iconSet.default;
        },
        [colors.isLight]
    );

    return (
        <View style={styles.container}>
            {state.routes.map((route, index) => {
                const options = descriptors[route.key].options as MyTabOptions;

                return (
                    <TabItem
                        key={route.key}
                        route={route}
                        isFocused={state.index === index}
                        options={options}
                        navigation={navigation}
                        getIcon={getIcon}
                        styles={styles}
                        bottom={bottom}
                    />
                );
            })}
        </View>
    );
};

const TabItem = React.memo(
    ({
        route,
        isFocused,
        options,
        navigation,
        getIcon,
        styles,
        bottom,
    }: any) => {
        const label =
            typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : options.title ?? route.name;

        const Icon = getIcon(options.tabBarIconKey, isFocused);

        const onPress = () => {
            const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
            }
        };

        const onLongPress = () => {
            navigation.emit({
                type: "tabLongPress",
                target: route.key,
            });
        };

        const tabStyle = useMemo(
            () => [styles.tabButton, { paddingBottom: bottom + 2 }],
            [bottom, styles.tabButton]
        );

        return (
            <Pressable
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={tabStyle}
            >
                {Icon && <Icon width={24} height={24} />}
                <Text
                    style={[
                        styles.label,
                        isFocused && styles.activeLabel,
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </Pressable>
        );
    }
);

export const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.background.default,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingTop: 10,
        },
        tabButton: {
            justifyContent: "center",
            alignItems: "center",
        },
        label: {
            fontSize: 11,
            marginTop: 2,
            fontFamily: "WorkSans-Regular",
            color: colors.text.default,
            lineHeight: 20,
        },
        activeLabel: {
            color: colors.text.primary,
            fontFamily: "WorkSans-Medium",
        },
    });

export default TabBar;