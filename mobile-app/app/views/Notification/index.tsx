import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
import Feather from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../util/theme";
import { createStyles } from "./Notification.style";
import GoBack from "../../components/GoBack";
import SkeletonClassic from "../../util/SkeletonClassic";
import { timeAgo } from "../../util/helper";
import { useNotificationApi } from "../../services/auth.service";
import { useNotificationReadApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import {
    setNotifications,
    appendNotifications,
    markAsRead,
    NotificationItem,
} from "../../store/notificationSlice";

const Notification = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const dispatch = useDispatch();

    const notifications = useSelector(
        (state: any) => state.notification.notifications
    );

    const unreadCount = useSelector(
        (state: any) => state.notification.unreadCount
    );

    const [cardHeights, setCardHeights] = useState<Record<number, number>>({});
    const swipeableRefs = useRef<Record<number, Swipeable | null>>({});
    const { mutateAsync, isPending } = useNotificationReadApi();

    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;

    const { data, refetch } = useNotificationApi({
        skip,
        take: LIMIT,
    });

    useEffect(() => {
        if (data?.data) {
            if (page === 1) {
                dispatch(setNotifications(data.data));
            } else {
                dispatch(appendNotifications(data.data));
            }
            setIsLoading(false);
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

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            refetch();
        }, [refetch])
    );

    const markSingleAsRead = async (id: number) => {
        try {
            await mutateAsync(id);
            dispatch(markAsRead(id));
            await refetch();
            swipeableRefs.current[id]?.close();
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: error?.message || "Failed to read notification",
            });
        }
    };

    const handleMarkAll = () => {
        // dispatch(markAllAsRead());
    };

    const onCardLayout = (id: number, height: number) => {
        setCardHeights(prev =>
            prev[id] === height ? prev : { ...prev, [id]: height }
        );
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const renderRightActions = (id: number) => {
        const height = cardHeights[id];

        return (
            <Pressable
                style={[styles.swipeAction, height ? { height } : null]}
                onPress={() => markSingleAsRead(id)}
                disabled={isPending}
            >
                <Feather name="check-circle" size={24} color={colors.icon.green} />
                <Text style={styles.swipeText}>Mark as Read</Text>
            </Pressable>
        );
    };

    const renderItem: ListRenderItem<NotificationItem> = ({ item }) => (
        <Swipeable
            ref={ref => {
                swipeableRefs.current[item.id] = ref;
            }}
            enabled={!item.viewed}
            renderRightActions={() => renderRightActions(item.id)}
            overshootRight={false}
        >
            <View
                style={styles.card}
                onLayout={e =>
                    onCardLayout(item.id, e.nativeEvent.layout.height)
                }
            >
                <View style={styles.row}>
                    <View
                        style={[
                            styles.dot,
                            item.viewed ? styles.greenDot : styles.redDot,
                        ]}
                    />
                    <Text
                        style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.time}>
                        {timeAgo(item.createdAt)}
                    </Text>
                </View>

                <Text style={styles.description}>{item.body}</Text>
            </View>
        </Swipeable>
    );

    const skeletonData = Array.from({ length: 6 });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <GoBack withoutText />

                <Text style={styles.headerTitle}>Notification</Text>

                {isLoading ? (
                    <SkeletonClassic
                        width={40}
                        height={20}
                        borderRadius={4}
                        style={styles.countLoader}
                    />
                ) : (
                    <Text style={styles.unreadCount}>{unreadCount} New</Text>
                )}

                <Pressable
                    style={[
                        styles.markReadWrapper,
                        { opacity: unreadCount === 0 || isLoading ? 0.5 : 1 },
                    ]}
                    onPress={handleMarkAll}
                    disabled={unreadCount === 0 || isLoading}
                >
                    <Feather name="check-circle" size={12} color={colors.icon.primary} />
                    <Text style={styles.markRead}>
                        Mark all as Read
                    </Text>
                </Pressable>
            </View>

            <FlatList
                data={isLoading ? skeletonData : notifications}
                keyExtractor={(item, index) =>
                    isLoading ? index.toString() : item?.id?.toString()
                }
                renderItem={
                    isLoading
                        ? () => (
                            <SkeletonClassic
                                height={90}
                                width="auto"
                                borderRadius={4}
                            />
                        )
                        : renderItem
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.text.primary]}
                        tintColor={colors.text.default}
                    />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyWrapper}>
                            <Feather
                                name="bell-off"
                                size={40}
                                color={colors.text.lightGrey}
                                style={{ marginBottom: 20 }}
                            />
                            <Text style={styles.emptyText}>
                                You have no notifications to show
                            </Text>
                        </View>
                    ) : null
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator
                            size="large"
                            color={colors.text.primary}
                            style={{ marginTop: 10 }}
                        />
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

export default Notification;