import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import { renderProfileImageUrl } from "../../util/helper";
import { User } from "../../store/authSlice.types";
import { Colors } from "../../util/theme";
import { createStyles } from "../../views/ChatScreen/ChatScreen.style";

type ChatHeaderStyles = ReturnType<typeof createStyles>;
interface Props {
    styles: ChatHeaderStyles;
    colors: Colors;
    user: any;
    userDetails: User | undefined;
    onMenuPress: () => void;
}

const ChatUserHeader = ({
    styles,
    colors,
    user,
    userDetails,
    onMenuPress,
}: Props) => {
    const userData =
        user?.name ??
        user?.members?.find((user: any) => user?.accountId !== userDetails?.id)
            ?.account;

    return (
        <View style={styles.chatHeaderWrapper}>
            <Image
                source={
                    user?.otherUser?.profileImage
                        ? { uri: renderProfileImageUrl(user?.otherUser?.profileImage) }
                        : require("../../assets/images/avatar.png")
                }
                style={styles.headeravatar}
                resizeMode="cover"
            />

            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {user?.name || `${userData?.firstname} ${userData?.lastname}`}
                    </Text>

                    <Text style={styles.role} numberOfLines={1}>
                        ({user?.otherUser?.userType || userData?.type})
                    </Text>
                </View>

                <View style={styles.statusRow}>
                    <Text style={styles.onlineText}>online</Text>
                </View>
            </View>

            <View style={styles.chatAction}>
                <Pressable style={styles.action} onPress={onMenuPress}>
                    <Entypo
                        name="dots-three-vertical"
                        size={16}
                        color={colors.icon.primary}
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default ChatUserHeader;