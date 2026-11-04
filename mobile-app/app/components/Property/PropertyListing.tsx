import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import { useCallback, useEffect, useMemo, useState } from "react";
import SearchInput from "../SearchInput";
import GetStarted from "../Banners/GetStarted";
import { debounce } from 'lodash';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAssetApi } from "../../services/auth.service";
import SkeletonClassic from "../../util/SkeletonClassic";
import Routes, { NavigationProp } from "../../constant/Routes";
import Feather from "react-native-vector-icons/Feather";
import { Dropdown } from "../AssetFilterBar";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import ListingFilter from "./ListingFilter";
import Card from "./Card";

const filterOptions = ["Available", "Funded", 'Exited'];

const PropertyListing = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const [searchProperty, setSearchProperty] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [filterPopupVisible, setFilterPopupVisible] = useState(false);
    const [listData, setListData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("Available");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showNewlyAdded, setNewlyAdded] = useState(false);
    const [propertyType, setPropertyType] = useState<string>("");

    const effectivePage = page === 1 ? 1 : page;

    const { data, refetch } = useAssetApi({
        search: debouncedSearch,
        skip: (effectivePage - 1) * LIMIT,
        take: LIMIT,
        assetStatus: selectedFilter,
        newlyAdded: showNewlyAdded,
        assetSubType: propertyType,
    });

    useEffect(() => {
        setPage(1);
        setIsLoading(true);
        setListData([]);
    }, [debouncedSearch, selectedFilter, showNewlyAdded, propertyType]);

    useEffect(() => {
        if (data?.data) {
            setListData(prev =>
                page === 1 ? data.data : [...prev, ...data.data]
            );
            setIsLoading(false);
        }
        setLoadingMore(false);
    }, [data]);

    const handleLoadMore = () => {
        if (isLoading || loadingMore) return;

        if (data?.data?.length === LIMIT) {
            setLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    const debouncedSearchFn = useMemo(
        () =>
            debounce((value: string) => {
                setDebouncedSearch(value);
            }, 300),
        []
    );

    useEffect(() => {
        debouncedSearchFn(searchProperty);

        return () => {
            debouncedSearchFn.cancel();
        };
    }, [searchProperty, debouncedSearchFn]);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    useEffect(() => {
        refetch();
    }, [selectedFilter]);

    const resetFilters = useCallback(() => {
        setSelectedFilter("Available");
        setNewlyAdded(false);
        setPropertyType("");
        setSearchProperty("");
    }, []);

    const wayToDetails = useCallback(async (propertyId: number) => {
        navigation.navigate(Routes.PROPERTY.DETAILS, { propertyId });
    }, [navigation]);

    return (
        <View style={styles.root}>
            <View style={styles.searchWrapper}>
                <SearchInput
                    value={searchProperty}
                    onChangeText={setSearchProperty}
                    placeholder="Search property you want"
                />
            </View>
            <View style={styles.root}>
                <FlatList
                    data={isLoading && page === 1
                        ? Array.from({ length: 3 })
                        : listData}
                    keyExtractor={(item, index) =>
                        item?.id
                            ? `${item.id}-${index}`
                            : `fallback-${index}`
                    }
                    renderItem={({ item }) =>
                        isLoading && page === 1 ? (
                            <SkeletonClassic
                                width={"auto"}
                                height={433}
                                borderRadius={16}
                                style={{ marginBottom: 20, marginHorizontal: 16 }}
                            />
                        ) : (
                            <Card item={item} onPress={wayToDetails} />
                        )
                    }

                    ListHeaderComponent={
                        <>
                            <GetStarted />
                            <Text style={styles.listTitle}>
                                Recommended Property
                            </Text>
                            <View style={styles.filterWrapper}>
                                <Pressable
                                    style={styles.dropdownTrigger}
                                    onPress={() => setIsFilterOpen(true)}
                                >
                                    <Text style={styles.filterText}>{selectedFilter}</Text>
                                    <Feather name="chevron-down" size={16} color={colors.text.default} />
                                </Pressable>
                                <Pressable
                                    style={styles.filterActionWrapper}
                                    onPress={() => setFilterPopupVisible(true)}
                                >
                                    <Text style={styles.filterAction}>
                                        Filter
                                    </Text>
                                    <FontAwesome name="sliders" size={14} color={colors.text.default} />
                                </Pressable>
                            </View>
                        </>
                    }

                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="large" color={colors.text.primary} />
                        ) : null
                    }

                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyWrapper}>
                                <Text style={styles.emptyTitle}>
                                    No properties available right now
                                </Text>
                                <Text style={styles.emptySubTitle}>
                                    Try adjusting your filters or check back later!
                                </Text>
                                <Pressable
                                    style={styles.resetFilterBtn}
                                    onPress={resetFilters}
                                >
                                    <Text style={styles.resetFilterText}>Reset Filter</Text>
                                </Pressable>
                            </View>
                        ) : null
                    }

                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            {isFilterOpen && (
                <Dropdown
                    data={filterOptions}
                    onSelect={setSelectedFilter}
                    onClose={() => setIsFilterOpen(false)}
                />
            )}
            <ListingFilter
                visible={filterPopupVisible}
                onClose={() => setFilterPopupVisible(false)}
                newlyAdded={showNewlyAdded}
                propertyType={propertyType}
                setNewlyAdded={setNewlyAdded}
                setPropertyType={setPropertyType}
            />
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        rowGap: 16,
    },
    searchWrapper: {
        marginHorizontal: 16,
    },
    listContent: {
        paddingBottom: 0,
    },
    listTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 0,
    },
    ctaBtn: {
        borderRadius: 10
    },
    emptyWrapper: {
        alignItems: "center",
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        marginBottom: 10,
    },
    emptySubTitle: {
        textAlign: "center",
        fontFamily: 'WorkSans-Medium',
        fontSize: 12,
        color: colors.text.lightGrey,
    },
    filterWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
        marginTop: 4,
        justifyContent: 'flex-end',
        columnGap: 16,
    },
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    filterText: {
        color: colors.text.default,
        fontSize: 13,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
    },
    filterActionWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    filterAction: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
        fontSize: 14,
        lineHeight: 24,
    },
    resetFilterBtn: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.isLight ? colors.background.slightly : colors.background.primaryLight,
    },
    resetFilterText: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        fontSize: 14,
        lineHeight: 24,
    },
})

export default PropertyListing;