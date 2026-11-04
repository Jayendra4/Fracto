import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./Chats.style";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import Feather from "react-native-vector-icons/Feather";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetChatsApi } from "../../services/auth.service";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { renderProfileImageUrl, timeAgo } from "../../util/helper";
import { debounce } from "lodash";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import SkeletonClassic from "../../util/SkeletonClassic";
import { getSocket } from "../../services/socket";
import { setUnreadCount } from "../../store/chatSlice";

const Chats = () => {
    const { colors, themeAppearance } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<AppDispatch>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [loadingMore, setLoadingMore] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;

    const debouncedSearchFn = useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedSearch(value);
            }, 200),
        []
    );

    useEffect(() => {
        debouncedSearchFn(search);

        return () => {
            debouncedSearchFn.cancel();
        };
    }, [search, debouncedSearchFn]);

    const { data, refetch, isPending } = useGetChatsApi(
        String(userDetails?.id),
        debouncedSearch,
        skip,
        LIMIT,
    );

    useEffect(() => {
        if (data?.data) {
            setChats(prev => {
                const merged = page === 1 ? data.data : [...prev, ...data.data];

                const unique = merged.filter(
                    (item: any, index: number, self: any[]) =>
                        index === self.findIndex((i: any) => i.id === item.id)
                );

                return unique;
            });
            setLoadingMore(false);
        }
    }, [data]);

    const handleLoadMore = () => {
        if (isPending || loadingMore) {
            return;
        }
        if (data?.data?.length === LIMIT) {
            setLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handleNewMessage = () => {
            refetch();
        };

        socket.on("new-message", handleNewMessage);

        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [refetch]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    useEffect(() => {
        if (data?.data) {
            const totalUnread = data?.data?.reduce(
                (sum: number, chat: any) => sum + (chat?.unreadCount || 0),
                0
            );

            dispatch(setUnreadCount(totalUnread));
        }
    }, [data]);

    const wayToChatScreen = useCallback((item: any) => {
        navigation.navigate(Routes.BROKER.CHATSCREEN, {
            user: item,
        });
    }, [navigation]);

    const handleSelectUser = useCallback(() => {
        navigation.navigate(Routes.BROKER.SELECTIONOFUSER);
    }, [navigation]);

    const renderChatItem = ({ item }: { item: any }) => (
        <Pressable style={styles.chatRow} onPress={() => wayToChatScreen(item)}>
            <Image
                source={
                    item?.otherUser?.profileImage
                        ? { uri: renderProfileImageUrl(item.otherUser.profileImage) }
                        : require("../../assets/images/avatar.png")
                }
                style={styles.avatar}
                resizeMode="cover"
            />

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.name}>
                        {item?.name}{"  "}
                    </Text>

                    {item?.unreadCount > 0 && (
                        <View style={styles.newBadge}>
                            <View style={styles.dot} />
                            <Text style={styles.newText}>New</Text>
                        </View>
                    )}

                    {item?.updatedAt && item?.unreadCount === 0 && item?.lastMessage?.content && (
                        <Text style={styles.time}>
                            {timeAgo(item.updatedAt)}
                        </Text>
                    )}
                </View>

                <View style={styles.chatHeader}>
                    <Text style={styles.message} numberOfLines={1}>
                        {
                            item?.lastMessage?.type === "image" ?
                                "Picture"
                                : (item?.lastMessage?.content
                                    || "No messages yet...")
                        }
                    </Text>
                    {item?.updatedAt && item?.unreadCount > 0 && item?.lastMessage?.content && (
                        <Text style={styles.time}>
                            {timeAgo(item.updatedAt)}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <View style={styles.row}>
                    <Text style={styles.title}>Chat</Text>
                </View>
                <View style={styles.searchBox}>
                    <Feather name="search" size={24} color={colors.icon.primary} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search by Name, E-mail"
                        placeholderTextColor={colors.text.extraLight}
                        style={styles.searchInput}
                        keyboardAppearance={themeAppearance}
                    />
                </View>

                <FlatList
                    data={isPending && page === 1 ? Array.from({ length: 10 }) : chats}
                    keyExtractor={(item, index) =>
                        isPending ? `skeleton-${index}` : `${item.id}-${index}`
                    }
                    renderItem={
                        isPending && page === 1
                            ? () => <SkeletonClassic width={'auto'} height={57} />
                            : renderChatItem
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                    style={{ flex: 1 }}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="large" color={colors.text.primary} />
                        ) : null
                    }
                    ListEmptyComponent={
                        !isPending ? (
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>
                                    No conversations yet
                                </Text>
                            </View>
                        ) : null
                    }
                />
                <ButtonPrimary
                    title={ButtonTextTypes.Add_New}
                    width={ButtonWidthTypes.Medium}
                    align={ButtonAlignTypes.Right}
                    icon={<Feather name="plus" size={16} color={colors.constant.white} />}
                    buttonStyle={styles.addButton}
                    textStyle={styles.addButtonText}
                    onPress={handleSelectUser}
                />
            </View>
        </SafeAreaView>
    );
};

export default Chats;