import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import PropertyHeader from "../../components/Property/PropertyHeader"
import { useTheme } from "../../util/theme";
import { createStyles } from "./SelectionOfUser.style";
import SkeletonClassic from "../../util/SkeletonClassic";
import Feather from "react-native-vector-icons/Feather";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetAllUsers } from "../../services/auth.service";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCreateChatRoomApi } from "../../services/hooks/useApi";
import { debounce } from "lodash";
import { renderProfileImageUrl } from "../../util/helper";

const SelectionOfUser = () => {
    const { colors, themeAppearance } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const [users, setUsers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;

    const { mutateAsync, isPending: chatRoomLoading } = useCreateChatRoomApi();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [loadingMore, setLoadingMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const debouncedSearchFn = useMemo(
        () =>
            debounce((value: string) => {
                setIsLoading(true);
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

    const { data, refetch } = useGetAllUsers(
        Number(userDetails?.id),
        debouncedSearch,
        skip,
        LIMIT
    );

    useEffect(() => {
        if (data?.data) {
            setUsers((prev: any[]) => {
                const merged = page === 1 ? data.data : [...prev, ...data.data];

                const valid = merged.filter(Boolean);

                const unique = Array.from(
                    new Map(valid.map((item: any) => [item.id, item])).values()
                );

                return unique;
            });
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, [data]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);


    const handleLoadMore = () => {
        if (isLoading || loadingMore) return;

        if (data?.data?.length === LIMIT) {
            setLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    const wayToChatScreen = useCallback(async (item: any) => {
        try {
            const res = await mutateAsync({
                type: "Direct",
                participantIds: [item?.id],
            })

            navigation.navigate(Routes.BROKER.CHATSCREEN, {
                user: res?.data,
            });
        } catch (error) {
            console.log(error);
        }
    }, [navigation, mutateAsync]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const renderChatItem = ({ item }: { item: any }) => (
        <Pressable
            style={styles.chatRow}
            disabled={chatRoomLoading}
            onPress={() => wayToChatScreen(item)}
        >
            <Image
                source={
                    item?.profileImage
                        ? { uri: renderProfileImageUrl(item.profileImage) }
                        : require("../../assets/images/avatar.png")
                }
                style={styles.avatar}
                resizeMode="cover"
            />

            <View style={styles.chatHeader}>
                <Text style={styles.name} numberOfLines={1}>
                    {item?.firstname}{" "}{item?.lastname}
                </Text>
                <View style={[styles.chatRow, { paddingVertical: 0 }]}>
                    <Text style={styles.message} numberOfLines={1}>
                        {item?.type}
                    </Text>
                    <Text style={styles.email} numberOfLines={1}>
                        {item?.email}
                    </Text>
                </View>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
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
                <View style={styles.divider} />
                <FlatList
                    data={isLoading && page === 1 ? Array.from({ length: 10 }) : users}
                    keyExtractor={(item: any, index: number) => {
                        if (!item) return `empty-${index}`;
                        if (isLoading) return `skeleton-${index}`;
                        return `${item?.id ?? "user"}-${index}`;
                    }}
                    renderItem={
                        isLoading && page === 1 ? () => (
                            <SkeletonClassic
                                width={'auto'}
                                height={52}
                            />
                        ) : renderChatItem
                    }
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.scrollContainer}
                    style={{ flex: 1 }}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="large" color={colors.text.primary} />
                        ) : null
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>
                                    No users found
                                </Text>
                            </View>
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
    );
};

export default SelectionOfUser;