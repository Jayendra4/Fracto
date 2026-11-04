import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import moment from "moment";
import { renderProfileImageUrl } from "../../util/helper";
import { createStyles } from "../../views/ChatScreen/ChatScreen.style";

interface Message {
    id: number;
    content: string;
    mediaUrl?: string | null;
    type?: string;
    status?: string;
    createdAt: string;
    senderId: number;
    sender?: {
        id: number;
        firstname: string;
        lastname: string;
        profileImage: string | null;
    };
}

type ChatItemStyles = ReturnType<typeof createStyles>;
interface Props {
    item: Message;
    styles: ChatItemStyles;
    userId: number;
    onImagePress: (url: string) => void;
}

const ChatMessageItem = ({ item, styles, userId, onImagePress }: Props) => {
    const isMe = item?.senderId === userId;
    const isText = item?.type === "Text";
    const isImage = item?.type === "image";

    return (
        <View
            style={[
                styles.messageRow,
                isMe ? styles.messageRowRight : styles.messageRowLeft,
            ]}
        >
            <View
                style={[
                    isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                    { flex: 1 },
                ]}
            >
                <View style={[styles.messageContent, isImage && styles.alignEnd]}>
                    {!isMe && (
                        <Image
                            source={
                                item?.sender?.profileImage
                                    ? { uri: renderProfileImageUrl(item?.sender?.profileImage) }
                                    : require("../../assets/images/avatar.png")
                            }
                            style={styles.avatar}
                        />
                    )}

                    <View
                        style={[
                            styles.bubbleWrapper,
                            isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
                        ]}
                    >
                        {isText && (
                            <View
                                style={[
                                    styles.bubble,
                                    isMe ? styles.myBubble : styles.otherBubble,
                                ]}
                            >
                                <Text style={[styles.messageText, isMe && styles.myText]}>
                                    {item?.content}
                                </Text>
                            </View>
                        )}

                        {isImage && (
                            <Pressable
                                style={styles.imageWrapper}
                                onPress={() => onImagePress(item?.content)}
                            >
                                <Image
                                    source={{ uri: item?.content }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </Pressable>
                        )}
                    </View>
                </View>

                <Text style={styles.timeText}>
                    {moment(item?.createdAt).format("DD-MMM-YYYY, hh:mm a")}
                </Text>
            </View>
        </View>
    );
};

export default React.memo(ChatMessageItem);