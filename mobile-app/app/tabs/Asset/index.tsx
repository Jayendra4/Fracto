import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../util/theme";
import { createStyles } from "./Asset.style";
import PropertyHeader from "../../components/Property/PropertyHeader";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import BookmarkPrimary from "../../assets/icons/bookmark_primary.svg";
import BookmarkSecondary from "../../assets/icons/bookmark_secondary.svg";
import { OnboardedTypeStatus, useOnboardedAssetApi, usePortfolioApi } from "../../services/auth.service";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import ButtonTertiary from "../../components/buttons/ButtonTertiary";
import SkeletonClassic from "../../util/SkeletonClassic";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { AccountType } from "../../store/authSlice.types";
import PropertyCard from "../../components/PropertyCard";
import AnimatedTabBar from "../../components/AnimatedTabBar";
import OnboardedCard from "../../components/OnboardedCard";
import DashboardDropdown from "../../components/DashboardDropdown";
import Trophy from "../../assets/icons/trophy.svg";

interface assetProps {
    total: number;
    renderFavourite: () => void;
    isOwnerAccount: boolean;
};

const filter = [
    'Available',
    'Funded',
    'Exited',
];

const AssetSummary = ({ total, renderFavourite, isOwnerAccount }: assetProps) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.assetWrapper}>
            <ButtonPrimary
                title={isOwnerAccount ? "My Assets" : `My Total Assets: ${total}`}
                width={ButtonWidthTypes.Medium}
                align={ButtonAlignTypes.Left}
                style={{ width: "auto" }}
                disabled
                buttonStyle={styles.assetButtonStyles}
                textStyle={styles.assetTextStyles}
                onPress={() => { }}
            />
            {total !== 0 && (
                <Pressable style={styles.bookmarkWrapper} onPress={renderFavourite}>
                    {colors.isLight ? (
                        <BookmarkSecondary width={24} height={24} />
                    ) : (
                        <BookmarkPrimary width={24} height={24} />
                    )}
                </Pressable>
            )}
        </View>
    )
};

const Asset = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const LIMIT = 10;
    const [page, setPage] = useState(1);
    const skip = (page - 1) * LIMIT;
    const [portfolioData, setPortfolioData] = useState<any[]>([]);
    const [selectedTab, setSelectedTab] = useState('Invested Asset');
    const isInvestedTabIsActive = selectedTab === "Invested Asset";
    const isOwnerAccount = userDetails?.type === AccountType.AssetOwner;
    const [selectedItem, setSelectedItem] = useState('Available');
    const [isLoading, setIsLoading] = useState(true);

    const { data, isFetching, refetch } = usePortfolioApi({
        skip,
        take: LIMIT,
    });

    const { data: onboardedList } = useOnboardedAssetApi({
        assetStatus: selectedItem as OnboardedTypeStatus,
    });

    const investedCount = portfolioData?.length || 0;
    const onboardedCount = onboardedList?.data?.length || 0;

    const formattedInvestedCount = String(investedCount).padStart(2, '0');
    const formattedOnboardedCount = String(onboardedCount).padStart(2, '0');

    const tabs = [
        { key: "Invested Asset", label: `Invested Asset : ${formattedInvestedCount}` },
        { key: "Onboarded Asset", label: `Onboarded Asset : ${formattedOnboardedCount}` },
    ];

    useEffect(() => {
        if (data?.data) {
            setPortfolioData(prev =>
                page === 1 ? data.data : [...prev, ...data.data]
            );
            setIsLoading(false);
        }
    }, [data]);


    const handleLoadMore = () => {
        if (isFetching) return;
        if (data?.data?.length < LIMIT) return;
        setPage(prev => prev + 1);
    };

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const wayToDetails = useCallback((propertyId: number) => {
        navigation.navigate(Routes.PROPERTY.DETAILS, { propertyId });
    }, [navigation]);

    const wayToInsights = useCallback((propertyId: number) => {
        navigation.navigate(Routes.PROPERTY.ONBOARDEDINSIGHTSHISTORY, { propertyId });
    }, [navigation]);

    const wayToFavourite = useCallback(() => {
        navigation.navigate(Routes.PROPERTY.SAVEDASSET);
    }, [navigation]);

    const wayToExplore = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.PROPERTY,
        });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                <FlatList
                    data={isLoading && page === 1 ? Array.from({ length: 3 }) : isInvestedTabIsActive ? portfolioData : onboardedList?.data}
                    keyExtractor={(item, index) =>
                        isLoading ? `skeleton-${index}` : isInvestedTabIsActive ?
                            item?.asset?.id?.toString() : item?.id?.toString()
                    }
                    renderItem={({ item }) =>
                        isLoading ? (
                            <SkeletonClassic
                                height={405}
                                width="auto"
                                borderRadius={10}
                            />
                        ) : isInvestedTabIsActive ? (
                            <PropertyCard item={item} wayToDetails={wayToDetails} />
                        ) : (
                            <OnboardedCard item={item} wayToDetails={wayToInsights} />
                        )}
                    contentContainerStyle={styles.scrollWrapper}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            <AssetSummary
                                total={data?.data?.length || 0}
                                renderFavourite={wayToFavourite}
                                isOwnerAccount={isOwnerAccount}
                            />
                            {userDetails?.type === AccountType.AssetOwner && (
                                <AnimatedTabBar
                                    tabs={tabs}
                                    activeKey={selectedTab}
                                    onChange={(key) => setSelectedTab(key)}
                                    labelStyle={{ fontSize: 14 }}
                                    indicatorColor="#2A5A8D"
                                    activeTextColor="#FFFFFF"
                                    variant="fixed"
                                    inactiveTextColor={colors.isLight ? colors.constant.white : "#2A5A8D"}
                                />
                            )}
                            {userDetails?.type === AccountType.AssetOwner && !isInvestedTabIsActive && (
                                <DashboardDropdown
                                    data={filter}
                                    value={selectedItem}
                                    onChange={setSelectedItem}
                                    containerStyle={styles.dropdown}
                                />
                            )}
                        </>
                    }
                    ListEmptyComponent={
                        !isLoading ?
                            isInvestedTabIsActive ? (
                                <View style={styles.emptyWrapper}>
                                    <Text style={styles.emptyText}>Nothing to show up here!</Text>
                                    <Text style={styles.subText}>
                                        Start Your Investment Journey,
                                    </Text>
                                    <Text style={styles.emptyText}>Click Here 👇</Text>

                                    <ButtonTertiary
                                        title={ButtonTextTypes.Explore_Properties}
                                        width={ButtonWidthTypes.Full}
                                        align={ButtonAlignTypes.Center}
                                        style={{ marginTop: 30 }}
                                        buttonStyle={{ borderRadius: 3 }}
                                        textStyle={styles.exploreTextStyle}
                                        onPress={wayToExplore}
                                    />
                                </View>
                            ) : (
                                <View style={styles.onboardedEmptyWrapper}>
                                    <Image
                                        source={require("../../assets/images/building.png")}
                                        style={styles.emptyImg}
                                    />
                                    <Trophy width={46} height={46} />
                                    <Text style={styles.onboardedEmptyText}>
                                        No {selectedItem} Assets
                                    </Text>
                                    <Text style={styles.onboardedEmptySubText}>
                                        You don't have any assets in this category at the moment.
                                    </Text>
                                </View>
                            )
                            : null
                    }

                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetching && page > 1 ? (
                            <SkeletonClassic height={405} width="auto" borderRadius={10} />
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
    );
};

export default Asset;
