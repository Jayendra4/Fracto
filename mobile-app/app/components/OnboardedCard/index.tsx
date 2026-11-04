import { memo, useMemo } from "react";
import { Text, View } from "react-native";
import Building from "../../assets/icons/tabler_building.svg";
import SuccessCheckStar from "../../assets/icons/check-star.svg";
import { createStyles } from "./OnboardedCard.style";
import { useTheme } from "../../util/theme";
import Owner from "../../assets/icons/owner.svg";
import Shield from "../../assets/icons/shield.svg";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import { capitalizeWords, formatAmountWithCommas } from "../../util/helper";

interface Props {
    item: any;
    wayToDetails: (id: number) => void;
}

const OnboardedCard = memo(({ item, wayToDetails }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const metaMap = useMemo(() => {
        const map: Record<string, any> = {};
        item?.meta?.forEach((m: any) => {
            map[m.metaKey] = m.metaValue;
        });
        return map;
    }, [item?.meta]);

    const city = capitalizeWords(metaMap.city);
    const marketValue = formatAmountWithCommas(metaMap.marketValue || 0);
    const netOperationalIncome = formatAmountWithCommas(metaMap.netOperationalIncome || 0);

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.titleWrap}>
                    <View style={styles.apartmentWrapper}>
                        <Building width={32} height={32} />
                    </View>
                    <View style={styles.allowShrink}>
                        <Text
                            style={styles.title}
                            numberOfLines={1}
                        >
                            {item?.assetTitle || "-"}
                        </Text>
                        <View style={styles.subTitleWrapper}>
                            <View style={styles.typeWrapper}>
                                <Text style={styles.subtitle}>{item?.assetSubType}</Text>
                            </View>
                            <View style={styles.dot} />
                            <Text
                                style={styles.subtitle}
                                numberOfLines={1}
                            >
                                {city}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                    <SuccessCheckStar width={12} height={12} />
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                    <Owner width={24} height={24} />
                    <View style={styles.allowShrink}>
                        <Text style={styles.infoLabel}>Owner</Text>
                        <Text
                            style={styles.infoValue}
                            numberOfLines={2}
                        >
                            {item?.currentOwnerName || "-"}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Shield width={24} height={24} />
                    <View style={styles.allowShrink}>
                        <Text style={styles.infoLabel}>Model</Text>
                        <Text
                            style={styles.infoValue}
                            numberOfLines={2}
                        >
                            {item?.ownershipModel || "-"}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Market Value</Text>
                    <Text
                        style={styles.statValue}
                        numberOfLines={1}
                    >
                        ₹ {marketValue}
                    </Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>NOI (PA)</Text>
                    <Text
                        style={[styles.statValue, styles.greenText]}
                        numberOfLines={1}
                    >
                        ₹ {netOperationalIncome}
                    </Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>ROI (5Y)</Text>
                    <Text
                        style={styles.statValue}
                        numberOfLines={1}
                    >
                        {item?.financials?.roi?.fiveYearROI || 0}%
                    </Text>
                </View>
            </View>

            <View style={styles.finalWrapper}>
                <View style={styles.row}>
                    <Text style={styles.label}>Yield (PA)</Text>
                    <Text
                        style={[styles.value, styles.allowShrink, styles.spaceLeft]}
                        numberOfLines={1}
                    >
                        {item?.financials?.yield?.actualYieldPercent || 0}%
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.label}>Listing</Text>
                    <Text
                        style={[styles.value, styles.allowShrink, styles.spaceLeft]}
                        numberOfLines={1}
                    >
                        ₹ {marketValue}
                    </Text>
                </View>
            </View>

            <View style={styles.finalWrapper}>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Frac</Text>
                    <Text
                        style={[styles.value, styles.spaceLeft, styles.allowShrink]}
                        numberOfLines={1}
                    >
                        {formatAmountWithCommas(item?.totalFractions || 0)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.label}>Remaining</Text>
                    <Text
                        style={[styles.value, styles.spaceLeft, styles.allowShrink]}
                        numberOfLines={1}
                    >
                        {formatAmountWithCommas(item?.remainingFractions || 0)}
                    </Text>
                </View>
            </View>

            <View style={styles.highlightRow}>
                <View style={{ width: "50%" }}>
                    <Text style={styles.highlightLabel}>Price / Fraction</Text>
                    <Text style={styles.highlightValue} numberOfLines={1}>
                        ₹ {formatAmountWithCommas(item?.currentPricePerFraction)}
                    </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.allowShrink}>
                    <Text style={styles.highlightLabel}>Sold</Text>
                    <Text style={[styles.highlightValue, styles.right]} numberOfLines={1}>
                        {item?.soldFractions || 0}
                    </Text>
                </View>
            </View>

            <ButtonPrimary
                title={ButtonTextTypes.View_Insights_History}
                width={ButtonWidthTypes.Full}
                align={ButtonAlignTypes.Center}
                buttonStyle={styles.button}
                textStyle={styles.buttonText}
                onPress={() => wayToDetails(item?.id)}
            />
        </View>
    );
});

export default OnboardedCard;