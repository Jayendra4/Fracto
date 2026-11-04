import { Animated, Easing, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KycStatusType } from "../Navigation/TabBar/TabBar.types";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useNavigation } from "@react-navigation/native";
import VerificationBanner from "../Banners/Verification";
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import LeadCard from "../LeadCard";
import { useGetBrokerLeadsApi } from "../../services/auth.service";
import { debounce } from "lodash";
import SkeletonClassic from "../../util/SkeletonClassic";

const STATUS_OPTIONS = [
    "All Leads",
    "Investor Signup",
    "Asset Owner Signup",
];

const STATUS_TYPE_MAP: Record<string, string | undefined> = {
    "All Leads": undefined,
    "Investor Signup": "InvestorSignup",
    "Asset Owner Signup": "AssetOwnerSignup",
};

const Leads = () => {
    const { colors, themeAppearance } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const kycIsApproved = userDetails?.kycStatus === KycStatusType.Approved;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("All Leads");
    const apiType = STATUS_TYPE_MAP[selectedStatus];
    const rotateAnim = useState(new Animated.Value(0))[0];
    const dropdownAnim = useState(new Animated.Value(0))[0];

    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;
    const [allLeads, setAllLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { data } = useGetBrokerLeadsApi({
        brokerId: String(userDetails?.id),
        type: apiType,
        search: debouncedSearch,
        skip,
        take: LIMIT,
    });

    useEffect(() => {
        setPage(1);
        setIsLoading(true);
        setAllLeads([]);
    }, [debouncedSearch, apiType]);

    const loadMore = () => {
        if (isLoading) return;

        if (data?.data?.length === LIMIT) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (!data?.data) return;

        setAllLeads(prev =>
            page === 1
                ? data.data
                : [...prev, ...data.data]
        );
        setIsLoading(false);
    }, [data]);

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

    useEffect(() => {
        Animated.timing(rotateAnim, {
            toValue: dropdownVisible ? 1 : 0,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    }, [dropdownVisible]);

    useEffect(() => {
        Animated.timing(dropdownAnim, {
            toValue: dropdownVisible ? 1 : 0,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start();
    }, [dropdownVisible]);

    const dropdownHeight = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 124],
    });

    const dropdownOpacity = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    const onSelectStatus = (status: string) => {
        setIsLoading(true);
        setSelectedStatus(status);
        setDropdownVisible(false);
    };

    const completeVerification = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.KYC,
        });
    }, [navigation]);

    return (
        <View style={styles.mainWrapper}>
            <View style={styles.titleWrapper}>
                <Text style={styles.title}>Lead Management</Text>
                <Text style={styles.subTitle}>Track and manage your investor leads with compliance clarity</Text>
            </View>

            {!kycIsApproved && (
                <VerificationBanner action={completeVerification} />
            )}

            <View style={styles.container}>
                <View style={styles.row}>
                    <View style={styles.searchWrapper}>
                        <Icon name="search-outline" size={16} color={colors.icon.primary} />
                        <TextInput
                            placeholder="Search by Investor Name or Property Name"
                            placeholderTextColor={colors.text.extraLight}
                            value={search}
                            onChangeText={setSearch}
                            style={styles.searchInput}
                            multiline={false}
                            numberOfLines={1}
                            keyboardAppearance={themeAppearance}
                        />
                    </View>

                    <Pressable
                        style={styles.filterButton}
                        onPress={() => setDropdownVisible((prev) => !prev)}
                    >
                        <Feather name="filter" size={16} color={colors.icon.primary} />
                        <View style={styles.filterDivider} />
                        <Text style={styles.filterText}>{selectedStatus}</Text>
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <Icon
                                name="chevron-down"
                                size={16}
                                color={colors.icon.primary}
                            />
                        </Animated.View>
                    </Pressable>
                </View>

                <Animated.View
                    style={[
                        styles.dropdown,
                        {
                            height: dropdownHeight,
                            opacity: dropdownOpacity,
                            overflow: "hidden",
                        },
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                        {STATUS_OPTIONS.map((item) => (
                            <Pressable
                                key={item}
                                style={[
                                    styles.dropdownItem,
                                    item === selectedStatus && styles.activeItem,
                                ]}
                                onPress={() => onSelectStatus(item)}
                            >
                                <Text
                                    style={[
                                        styles.dropdownText,
                                        item === selectedStatus && styles.activeText,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </Animated.View>
            </View>

            <FlatList
                data={isLoading ? Array.from({ length: 5 }) : allLeads || []}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                keyExtractor={(item, index) =>
                    isLoading ? `skeleton-${index}` : item?.id?.toString()
                }
                renderItem={({ item }) =>
                    isLoading ? (
                        <SkeletonClassic
                            height={216}
                            width="auto"
                            borderRadius={10}
                            style={{ marginHorizontal: 16 }}
                        />
                    ) : (
                        <LeadCard item={item} />
                    )
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                scrollEnabled={false}
                ItemSeparatorComponent={<View style={styles.seperator} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Icon
                                name="document-text-outline"
                                size={40}
                                color={colors.text.lightGrey}
                            />
                            <Text style={styles.emptyTitle}>No Leads Found</Text>
                            <Text style={styles.emptySubtitle}>
                                Try adjusting your search or filter to find what you're looking for.
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    mainWrapper: {
        flex: 1,
        rowGap: 24,
    },
    titleWrapper: {
        marginHorizontal: 24,
        rowGap: 4,
    },
    title: {
        color: colors.text.default,
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 20,
    },
    subTitle: {
        color: colors.text.extraLight,
        fontFamily: 'WorkSans-Regular',
        fontSize: 11,
    },
    container: {
        marginHorizontal: 16,
        zIndex: 100,
    },
    row: {
        flexDirection: "row",
        gap: 8,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: colors.isLight ? colors.background.default : "#F5F5F529",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#F5F5F533',
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 4,
        color: colors.text.default,
        fontSize: 11,
        fontFamily: "WorkSans-Regular",
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F529",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#F5F5F533',
        paddingHorizontal: 10,
        gap: 6,
    },
    filterDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#F5F5F533',
    },
    filterText: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
    },
    dropdown: {
        position: "absolute",
        top: 52,
        right: 0,
        left: 0,
        backgroundColor: colors.background.default,
        borderWidth: colors.isLight ? 0 : 1,
        borderColor: '#F5F5F533',
        borderRadius: 4,
        zIndex: 999,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    activeItem: {
        backgroundColor: colors.isLight ? colors.background.darkBlue : '#1B2228',
    },
    dropdownText: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: "WorkSans-Medium",
    },
    activeText: {
        color: colors.text.primary,
    },
    seperator: { height: 20 },
    emptyContainer: {
        marginTop: 60,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    emptyTitle: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: "WorkSans-SemiBold",
        color: colors.text.lightGrey,
        textAlign: "center",
    },
    emptySubtitle: {
        marginTop: 6,
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
        color: colors.text.lightGrey,
        textAlign: "center",
    },

})

export default Leads;