import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { capitalizeWords, formatAmountWithCommas } from "../../util/helper";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import TrendUp from "../../assets/icons/trending-up.svg";
import Rupee from "../../assets/icons/rupee.svg";
import Roi from "../../assets/icons/roi.svg";
import { Colors, useTheme } from "../../util/theme";
import Video from 'react-native-video';

const Card = React.memo(({ item, onPress }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const mediaUrl = item?.documents?.[0]?.url;

    const isWebm = mediaUrl?.toLowerCase().endsWith('.webm');

    const metaMap = useMemo(() => {
        const map: Record<string, any> = {};
        item?.meta?.forEach((m: any) => {
            map[m.metaKey] = m.metaValue;
        });
        return map;
    }, [item?.meta]);

    const city = capitalizeWords(metaMap.city);

    return (
        <View style={styles.card}>
            {isWebm ? (
                <Video
                    source={{ uri: mediaUrl }}
                    style={styles.image}
                    resizeMode="cover"
                    repeat
                    muted
                    paused={false}
                />
            ) : (
                <Image
                    source={{ uri: item?.documents[0]?.url }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}
            {city && (
                <View style={styles.badge}>
                    <SimpleLineIcons name="location-pin" size={9} color={colors.constant.white} />
                    <Text style={styles.badgeText}>{city}</Text>
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.title}>
                    {item?.assetTitle}
                </Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={styles.icon}>
                            <TrendUp width={20} height={20} />
                        </View>
                        <Text style={styles.statLabel}>Yield</Text>
                        <Text style={styles.statValue}>
                            {item.financials?.yield?.actualYieldPercent || 0}%
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.icon}>
                            <Rupee width={20} height={20} color={colors.constant.white} />
                        </View>
                        <Text style={styles.statLabel}>Price</Text>
                        <Text style={styles.statValue}>
                            ₹{formatAmountWithCommas(item.financials?.perFraction?.price || 0)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.icon}>
                            <Roi width={20} height={20} />
                        </View>
                        <Text style={styles.statLabel}>ROI</Text>
                        <Text style={styles.statValue}>
                            {item.financials?.roi?.fiveYearROI || 0}%
                        </Text>
                    </View>
                </View>
                <ButtonPrimary
                    title={ButtonTextTypes.Get_More_Details}
                    width={ButtonWidthTypes.Full}
                    align={ButtonAlignTypes.Center}
                    onPress={() => onPress(item?.id)}
                />
            </View>
        </View>
    );
});

export default Card;

const createStyles = (colors: Colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.isLight ? colors.background.darkBlue : "#0B1620",
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        overflow: "hidden",
    },
    image: {
        height: 178,
    },
    listTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 0,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.background.darkYellow,
        paddingHorizontal: 6,
        borderRadius: 20,
        height: 16,
        marginTop: 16,
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 4,
    },
    badgeText: {
        color: colors.constant.white,
        fontSize: 10,
        fontFamily: 'WorkSans-Regular',
    },
    content: {
        paddingHorizontal: 16,
        marginBottom: 20,
        marginTop: 10,
    },
    title: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 16,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    },
    statLabel: {
        color: colors.text.lightGrey,
        fontSize: 12,
        marginTop: 6,
        fontFamily: 'WorkSans-Medium',
    },
    statValue: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        marginTop: 2,
    },
})