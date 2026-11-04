import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../util/theme";
import { createStyles } from "./SavedAsset.style";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useFavouriteAssetsApi } from "../../services/auth.service";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import SkeletonClassic from "../../util/SkeletonClassic";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import { formatAmountWithCommas, renderNormalUrl } from "../../util/helper";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Video from "react-native-video";

const SavedAsset = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const LIMIT = 10;
    const [page, setPage] = useState(1);
    const skip = (page - 1) * LIMIT;
    const [portfolioData, setPortfolioData] = useState<any[]>([]);
    const getLocationFromMeta = (meta: any[]) => {
        if (!meta) return "";

        const city = meta.find((m: any) => m.metaKey === "city")?.metaValue;
        const state = meta.find((m: any) => m.metaKey === "state")?.metaValue;
        const country = meta.find((m: any) => m.metaKey === "country")?.metaValue;

        return [city, state, country].filter(Boolean).join(", ");
    };

    const { data, isLoading, isFetching, refetch } = useFavouriteAssetsApi({
        skip,
        take: LIMIT,
    });

    useEffect(() => {
        if (data?.data) {
            setPortfolioData(prev =>
                page === 1 ? data.data : [...prev, ...data.data]
            );
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

    const getMoreDetails = useCallback((id: number) => {
        navigation.navigate(Routes.PROPERTY.DETAILS, {
            propertyId: id,
        })
    }, [navigation]);


    const renderSaveItem = useCallback(({ item }: any) => {
        const locationInnerText = getLocationFromMeta(item?.meta);

        const imageDoc = item?.documents?.find(
            (doc: any) => doc.documentType === "ASSET_IMAGE"
        );

        const videoDoc = item?.documents?.find(
            (doc: any) => doc.documentType === "ASSET_VIDEO"
        );

        const imageUrl = renderNormalUrl(imageDoc?.documentUrl);

        const videoUrl = renderNormalUrl(videoDoc?.documentUrl);

        const isWebm = videoUrl?.toLowerCase().endsWith('.webm');

        return (
            <View style={styles.savedCard}>
                {isWebm && videoDoc && !imageDoc ? (
                    <View style={styles.saveImage}>
                        <Video
                            source={{ uri: videoUrl }}
                            style={styles.saveImage}
                            resizeMode="cover"
                            repeat
                            muted
                            paused={false}
                        />
                    </View>
                ) : (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.saveImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.savedContent}>
                    <Text style={styles.savedTitle}>
                        {item?.assetTitle}
                    </Text>

                    {locationInnerText && (
                        <View style={styles.savedLocationRow}>
                            <EvilIcons
                                name="location"
                                size={12}
                                color={colors.text.lightGrey}
                            />
                            <Text style={styles.savedLocation}>
                                {locationInnerText}
                            </Text>
                        </View>
                    )}

                    <View style={styles.savedDivider} />

                    <View style={styles.savedInfoWrapper}>
                        <View style={styles.savedInfoRow}>
                            <Text style={styles.savedLabel} numberOfLines={1}>
                                Price of Fraction:
                            </Text>
                            <Text style={styles.savedValue}>
                                ₹{formatAmountWithCommas(Number(item?.price?.currentPricePerFraction || 0))}
                            </Text>
                        </View>

                        <View style={styles.savedInfoRow}>
                            <Text style={styles.savedLabel} numberOfLines={1}>
                                ROI:
                            </Text>
                            <Text style={styles.savedValue}>
                                {item?.financials?.roi?.fiveYearROI || 0}%
                            </Text>
                        </View>

                        <View style={styles.savedInfoRow}>
                            <Text style={styles.savedLabel} numberOfLines={1}>
                                Yield:
                            </Text>
                            <Text style={styles.savedValue}>
                                {item?.financials?.yield?.actualYieldPercent || 0}%
                            </Text>
                        </View>
                    </View>

                    <ButtonPrimary
                        title={ButtonTextTypes.Get_More_Details}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        buttonStyle={styles.savedButton}
                        textStyle={styles.savedButtonText}
                        onPress={() => getMoreDetails(item?.id)}
                    />
                </View>
            </View>
        )
    }, [colors]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <FlatList
                    data={isLoading && page === 1 ? Array.from({ length: 3 }) : (portfolioData || [])}
                    keyExtractor={(item, index) =>
                        isLoading ? `skeleton-${index}` : item?.id?.toString()
                    }
                    renderItem={({ item }) =>
                        isLoading ? (
                            <SkeletonClassic
                                height={405}
                                width="auto"
                                borderRadius={10}
                            />
                        ) : (
                            renderSaveItem({ item })
                        )}
                    contentContainerStyle={styles.scrollWrapper}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            <Text style={styles.headerText}>Saved Assets</Text>
                        </>
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyWrapper}>
                                <Text style={styles.emptyText}>You haven’t saved any assets yet.</Text>
                            </View>
                        ) : null
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

export default SavedAsset;