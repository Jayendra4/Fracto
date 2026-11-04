import { memo, useCallback, useMemo } from "react";
import { useTheme } from "../../util/theme";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { capitalizeWords, formatAmountWithCommas } from "../../util/helper";
import { Image, Pressable, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import Apartment from "../../assets/icons/apartment.svg";
import SuccessCheckStar from "../../assets/icons/success-check-star.svg";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createStyles } from "./PropertyCard.style";

interface Props {
    item: any;
    wayToDetails: (id: number) => void;
}

const PropertyCard = memo(({ item, wayToDetails }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();

    const metaMap = useMemo(() => {
        const map: Record<string, any> = {};
        item?.meta?.forEach((m: any) => {
            map[m.metaKey] = m.metaValue;
        });
        return map;
    }, [item?.meta]);

    const city = capitalizeWords(metaMap.city);
    const state = capitalizeWords(metaMap.state);
    const country = capitalizeWords(metaMap.country);

    const currentYield = metaMap.expectedYieldPercentage;

    const locationText = useMemo(() => {
        return [city, state, country]
            .filter(Boolean)
            .join(", ");
    }, [city, state, country]);

    const wantToBuyMore = useCallback(() => {
        navigation.navigate(Routes.PROPERTY.BUYFRACTION, {
            propertyId: (item?.asset?.id || item?.id),
        })
    }, [navigation, item]);

    const stats = useMemo(() => [
        ["Invested Amount", `₹ ${formatAmountWithCommas(item?.investment?.totalInvestedAmount || 0)}`],
        ["Ownership", "0%"],
        ["Asset Value", `₹ ${formatAmountWithCommas(item?.investment?.currentValue || 0)}`],
    ], [item?.investment]);

    const imgUrl = item?.documents?.find(
        (asset: any) => asset?.documentType === "ASSET_IMAGE"
    )?.url;

    const isSoldOut = item?.asset?.isSoldOut || item?.isSoldOut;

    return (
        <View style={styles.card}>
            <View>
                <Image
                    source={imgUrl ?
                        { uri: imgUrl } :
                        require("../../assets/images/demo.png")
                    }
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                <View style={styles.tagLeft}>
                    <Apartment width={10} height={10} />
                    <Text style={styles.tagText}>{item?.asset?.assetSubType || item?.assetSubType}</Text>
                </View>

                {(item?.asset?.isVerified || item?.isVerified) && (
                    <View style={styles.tagRight}>
                        <SuccessCheckStar width={11} height={11} />
                        <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardContent}>
                <View style={styles.locationRow}>
                    <View style={styles.location}>
                        <SimpleLineIcons name="location-pin" size={10} color={colors.isLight ? colors.text.darkYellow : colors.text.yellow} />
                        <Text style={styles.locationText}>
                            {locationText}
                        </Text>
                    </View>
                    <View style={styles.yield}>
                        <Text style={styles.yieldText}>Current Yield - {currentYield || 0}%</Text>
                    </View>
                </View>
                <View style={[styles.locationRow, { alignItems: 'flex-start' }]}>
                    <Text
                        style={styles.title}
                    >
                        {item?.asset?.assetTitle || item?.assetTitle}
                    </Text>
                    <View style={styles.growthRow}>
                        <Ionicons name="trending-up" size={17} color={colors.icon.green} />
                        <Text style={styles.growth}>{item?.investment?.profitLoss || 0}%</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    {stats.map(([label, value], index) => (
                        <LinearGradient
                            key={label}
                            colors={["#134478", "#224E7C"]}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={[styles.statWrapper, {
                                alignItems: index === 1 ? 'center' : 'flex-start',
                            }]}
                        >
                            <Text style={styles.statLabel}>{label}</Text>
                            <Text style={styles.statValue}>{value}</Text>
                        </LinearGradient>
                    ))}
                </View>

                <View style={styles.actionRow}>
                    <Pressable
                        style={[styles.outlineButton, isSoldOut && { opacity: 0.6 }]}
                        onPress={wantToBuyMore}
                        disabled={isSoldOut}
                    >
                        <Text style={styles.outlineButtonText}>Buy More</Text>
                    </Pressable>

                    <Pressable style={[styles.outlineButton, { opacity: 0.6 }]}>
                        <Text style={styles.outlineButtonText}>Sell</Text>
                    </Pressable>
                </View>

                <ButtonPrimary
                    title={ButtonTextTypes.View_Details}
                    width={ButtonWidthTypes.Full}
                    align={ButtonAlignTypes.Center}
                    buttonStyle={styles.viewButtonStyle}
                    textStyle={styles.viewTextStyle}
                    onPress={() => wayToDetails(item?.asset?.id || item?.id)}
                />
            </View>
        </View>
    )
});

export default PropertyCard;