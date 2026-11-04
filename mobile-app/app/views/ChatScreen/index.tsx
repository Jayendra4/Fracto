import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { createStyles } from "./ChatScreen.style";
import { useTheme } from "../../util/theme";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useGetChatMessages } from "../../services/auth.service";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { getSocket } from "../../services/socket";
import { useChatBlockApi, useChatClearApi, useChatMarkAsReadApi } from "../../services/hooks/useApi";
import ChatMenu from "../../components/ChatMenu";
import ConfirmationModal from "../../components/Modals/AskConfirmation";
import Toast from "react-native-toast-message";
import Feather from 'react-native-vector-icons/Feather';
import { pickFromGallery } from "../../util/fileUploadHelper";
import ImageView from "react-native-image-viewing";
import ChatUserHeader from "../../components/Chat/ChatUserHeader";
import ChatMessageItem from "../../components/Chat/ChatMessageItem";
import { decrementUnreadCount } from "../../store/chatSlice";

interface Message {
    id: number;
    content: string;
    mediaUrl?: string | null;
    type?: string;
    status?: string;
    createdAt: string;
    senderId: number;
    chatRoomId: number;
    sender?: {
        id: number;
        firstname: string;
        lastname: string;
        profileImage: string | null;
    };
}

const ChatScreen = () => {
    const { colors, themeAppearance } = useTheme();
    const styles = createStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const userDetails = useSelector((state: RootState) => state.auth.user);
    const routes = useRoute();
    const { user } = routes?.params as { user: any };
    const TAKE = 20;

    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { data, isPending: messageSyncing, refetch } =
        useGetChatMessages({
            skip: skip,
            take: TAKE,
            accountId: Number(userDetails?.id),
            chatRoomId: user?.id,
        });
    const { mutateAsync: markReadAsync } = useChatMarkAsReadApi();
    const { mutateAsync: clearChat, isPending: clearChatLoading } = useChatClearApi();
    const { mutateAsync: blockChat, isPending: blockChatLoading } = useChatBlockApi();
    const [menuVisible, setMenuVisible] = useState(false);
    const [input, setInput] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        description: string;
        confirm?: string;
        onConfirm: () => void;
    } | null>(null);

    useEffect(() => {
        const socket = getSocket();

        if (!socket || !user?.id) return;

        socket.emit("join-room", {
            chatroomId: user.id,
        });

        const handleNewMessage = (message: Message) => {
            if (message?.chatRoomId !== user.id) return;
            setMessages(prev => [message, ...prev]);
        };

        socket.on("new-message", handleNewMessage);

        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [user?.id]);

    useEffect(() => {
        if (!data?.data) return;

        if (skip === 0) {
            setMessages(data.data);
        } else {
            setMessages(prev => [...prev, ...data.data]);
        }

        if (data.data.length < TAKE) {
            setHasMore(false);
        }

        setLoadingMore(false);
    }, [data?.data]);

    useEffect(() => {
        if (!messages.length) return;
        dispatch(decrementUnreadCount(user?.unreadCount));
        markReadAsync(user?.id);
    }, [user?.id, messages]);

    useFocusEffect(
        useCallback(() => {
            setSkip(0);
            setHasMore(true);
            refetch();
        }, [refetch])
    );

    const sendMessage = useCallback(() => {
        if (!input.trim()) return;

        const socket = getSocket();
        if (!socket || !user?.id) return;

        socket.emit("send-message", {
            chatroomId: user.id,
            content: input,
            type: "Text",
        });

        setInput("");

        flatListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
        });

    }, [input, user?.id]);

    const handleSelectImage = useCallback(async () => {
        const res = await pickFromGallery();
        const socket = getSocket();

        if (!socket || !user?.id || !res?.url) return;

        socket.emit("send-message", {
            chatroomId: user.id,
            content: res.url,
            mediaUrl: res.url,
            type: "image",
        });
    }, [user?.id]);

    const loadMoreMessages = useCallback(() => {
        if (loadingMore || !hasMore || messageSyncing) return;

        setLoadingMore(true);
        setSkip(prev => prev + TAKE);
    }, [loadingMore, hasMore, messageSyncing]);

    const renderMessage = useCallback(
        ({ item }: { item: Message }) => (
            <ChatMessageItem
                item={item}
                styles={styles}
                userId={Number(userDetails?.id)}
                onImagePress={(url) => setPreviewUrl(url)}
            />
        ),
        [styles, userDetails?.id]
    );

    const EmptyChatComponent = useCallback(() => {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                    Start the conversation by sending a message.
                </Text>
            </View>
        );
    }, [styles]);

    const chatMenuOptions = useMemo(() => [
        {
            label: "Clear Chat",
            onPress: () =>
                setConfirmAction({
                    title: "Clear Chat History",
                    description:
                        "Are you sure you want to clear all messages? This cannot be undone.",
                    onConfirm: async () => {
                        try {
                            await clearChat(user?.id);
                            setMessages([]);
                            refetch();
                            setConfirmAction(null);
                        } catch (err: any) {
                            Toast.show({
                                type: 'error',
                                text1: err?.message || "Something went wrong",
                            });
                        }
                    },
                }),
        },
        {
            label: "Delete Chat",
            onPress: () =>
                setConfirmAction({
                    title: "Delete Conversation",
                    description:
                        "Are you sure you want to delete this chat?",
                    onConfirm: () => {
                        console.log("delete chat");
                        setConfirmAction(null);
                    },
                }),
        },
        {
            label: "Block User",
            destructive: true,
            onPress: () =>
                setConfirmAction({
                    title: "Block User",
                    description:
                        "Are you sure you want to block this user?",
                    confirm: "Yes",
                    onConfirm: async () => {
                        try {
                            await blockChat(user?.id);
                            setConfirmAction(null);
                        } catch (err: any) {
                            Toast.show({
                                type: 'error',
                                text1: err?.message || "Something went wrong",
                            });
                        }
                    },
                }),
        },
    ], [clearChat, blockChat, user?.id]);

    return (
        <>
            <SafeAreaView style={styles.root}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={80}
                >
                    <View style={styles.container}>
                        <PropertyHeader enableBack />
                        <ChatUserHeader
                            styles={styles}
                            colors={colors}
                            user={user}
                            userDetails={userDetails}
                            onMenuPress={() => setMenuVisible(true)}
                        />

                        {messageSyncing && messages?.length === 0 ? (
                            <View style={styles.syncHistoryWrapper}>
                                <ActivityIndicator size={"small"} color={"#4F86C0"} />
                                <Text style={styles.syncHistory}>Syncing History</Text>
                            </View>
                        ) : messages?.length === 0 ? (
                            <EmptyChatComponent />
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={item => item?.id?.toString()}
                                renderItem={renderMessage}
                                inverted
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContent}
                                initialNumToRender={15}
                                maxToRenderPerBatch={10}
                                windowSize={10}
                                removeClippedSubviews
                                onEndReached={loadMoreMessages}
                                onEndReachedThreshold={0.3}
                                ListFooterComponent={
                                    loadingMore ? (
                                        <ActivityIndicator size="small" color="#4F86C0" />
                                    ) : null
                                }
                            />
                        )}

                        <View style={styles.inputContainer}>
                            <Feather name="paperclip" size={18} color={colors.icon.primary} onPress={handleSelectImage} />
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Type a message..."
                                placeholderTextColor={colors.text.lightGrey}
                                style={styles.input}
                                multiline
                                keyboardAppearance={themeAppearance}
                            />
                            <Pressable
                                style={styles.sendButton}
                                onPress={sendMessage}
                            >
                                <Text style={styles.sendText}>Send</Text>
                            </Pressable>
                        </View>
                    </View>
                    <ChatMenu
                        visible={menuVisible}
                        onClose={() => setMenuVisible(false)}
                        options={chatMenuOptions}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>

            <ConfirmationModal
                visible={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => confirmAction?.onConfirm()}
                title={confirmAction?.title}
                description={confirmAction?.description}
                confirmText={confirmAction?.confirm ?? "Confirm"}
                cancelText={"Cancel"}
                loading={clearChatLoading || blockChatLoading}
                confirmColor={colors.text.danger}
                cancelColor={colors.text.default}
                backgroundColor={colors.background.default}
                textColor={colors.text.default}
                borderColor={colors.border.lightGrey}
            />

            <ImageView
                images={[{ uri: previewUrl }]}
                imageIndex={0}
                visible={!!previewUrl}
                onRequestClose={() => setPreviewUrl("")}
                swipeToCloseEnabled
                doubleTapToZoomEnabled
                animationType="fade"
            />
        </>
    );
};

export default ChatScreen;
