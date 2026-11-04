import React, { useCallback } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import Bell from "../../assets/icons/bell.svg";
import BellLight from "../../assets/icons/bell-light.svg";
import Messenger from "../../assets/icons/messenger.svg";
import MessengerLight from "../../assets/icons/messenger-light.svg";
import Setting from "../../assets/icons/setting-round.svg";
import SettingLight from "../../assets/icons/setting-round-light.svg";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import GoBack from "../GoBack";
import NotificationDot from "../../util/NotificationDot";
import SkeletonClassic from "../../util/SkeletonClassic";

interface Props {
    disableInfo?: boolean;
    enableBack?: boolean;
}

const PropertyHeader = ({ disableInfo, enableBack }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const user = useSelector((state: RootState) => state.auth.user);
    const unreadChatCount = useSelector((state: RootState) => state.chat.unreadChatCount);
    const unreadNotificationCount = useSelector((state: RootState) => state.notification.unreadCount);

    const goToNotification = useCallback(() => {
        navigation.navigate(Routes.PROPERTY.NOTIFICATION);
    }, [navigation]);

    const goToChats = useCallback(() => {
        navigation.navigate(Routes.BROKER.CHATS);
    }, [navigation]);

    const goToProfile = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.PROFILE,
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                {enableBack && <GoBack withoutText />}
                {!disableInfo && (
                    <Pressable onPress={goToProfile}>
                        <Image
                            source={user?.profileImage ?
                                { uri: user?.profileImage } :
                                require("../../assets/images/avatar.png")}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                    </Pressable>
                )}
            </View>

            {!disableInfo && (
                user?.firstname && user?.lastname ? (
                    <View style={styles.center}>
                        <Text
                            style={styles.name}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {`${user?.firstname} ${user?.lastname}`}
                        </Text>
                        <Text style={styles.type}>{user?.type}</Text>
                    </View>
                ) : (
                    <View style={styles.center}>
                        <SkeletonClassic
                            width={140}
                            height={30}
                            borderRadius={8}
                        />
                    </View>
                )
            )}

            <View style={styles.right}>
                <Pressable style={styles.iconWrapper} onPress={goToChats}>
                    <NotificationDot
                        visible={unreadChatCount > 0}
                        color={colors.text.danger}
                    >
                        {colors.isLight ? (
                            <MessengerLight width={24} height={24} />
                        ) : (
                            <Messenger width={24} height={24} />
                        )}
                    </NotificationDot>
                </Pressable>

                <Pressable style={styles.iconWrapper} onPress={goToNotification}>
                    <NotificationDot
                        visible={unreadNotificationCount > 0}
                        color={colors.text.danger}
                    >
                        {colors.isLight ? (
                            <BellLight width={24} height={24} />
                        ) : (
                            <Bell width={24} height={24} />
                        )}
                    </NotificationDot>
                </Pressable>

                {/* <Pressable style={styles.iconWrapper}>
                    {colors.isLight ? (
                        <SettingLight width={24} height={24} />
                    ) : (
                        <Setting width={24} height={24} />
                    )}
                </Pressable> */}
            </View>
        </View>
    );
};

export default PropertyHeader;

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    center: {
        flex: 1,
    },
    type: {
        fontSize: 10,
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
    },
    name: {
        fontSize: 14,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        marginRight: 5,
    },
    right: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconWrapper: {
        marginRight: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 100,
    },
});
