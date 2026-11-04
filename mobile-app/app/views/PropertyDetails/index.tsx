import { useTheme } from "../../util/theme";
import { createStyles } from "./PropertyDetails.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";
import PropertyHeader from "../../components/Property/PropertyHeader";
import ImageSlider from "../../components/ImageSlider";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Ionicons from 'react-native-vector-icons/Ionicons';
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import UrbanLiving from "../../assets/icons/urban-living.svg";
import RentalAppeal from "../../assets/icons/rental-appeal.svg";
import InvestmentPlant from "../../assets/icons/investment-plant.svg";
import PrimeLocation from "../../assets/icons/prime-location.svg";
import InvestmentCalculator from "../../components/InvestmentCalculator";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useAssetByIdApi } from "../../services/auth.service";
import { useCallback, useState } from "react";
import { capitalizeWords, formatAmountWithCommas } from "../../util/helper";
import DetailsSkeletonLoader from "./DetailsSkeletonLoader";
import Routes, { NavigationProp } from "../../constant/Routes";

interface InvestmentProps {
    principal: number;
    rental: number;
    appreciation: number;
}

const DATA = [
    {
        icon: UrbanLiving,
        title: 'Modern Urban Living',
        description:
            'J One Tower in Business Bay offers stylish, fully furnished apartments with smart layouts and premium finishes, set within a dynamic community.',
    },
    {
        icon: RentalAppeal,
        title: 'Strong Rental Appeal',
        description:
            'This 12th floor unit with peaceful community and lake views is vacant and ready for immediate occupancy, appealing to long term tenants and ensuring consistent rental demand.',
    },
    {
        icon: InvestmentPlant,
        title: 'Attractive Investment Returns',
        description:
            'The unit provides an estimated net rental yield of 5.08% the first year, a projected average rental yield over 5 years 5.24%, and an annualized ROI of 11%.',
    },
    {
        icon: PrimeLocation,
        title: 'Prime Location',
        description:
            'Strategically located in Business Bay with easy access to Downtown Dubai, Dubai Mall and metro stations, ensuring excellent connectivity.',
    },
];

const PropertyStatusPills = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={styles.pillWrapper}>
            <View style={[styles.pill, styles.verified]}>
                <Text style={[styles.text, styles.verifiedText]}>
                    Verified by Trustee
                </Text>
            </View>

            <View style={[styles.pill, styles.open]}>
                <Text style={[styles.text, styles.openText]}>
                    Open for Investment
                </Text>
            </View>

            {/* <View style={[styles.pill, styles.tokenized]}>
                <Text style={[styles.text, styles.tokenizedText]}>
                    Fully Tokenized
                </Text>
            </View> */}
        </View>
    );
};

const PropertyInfoCard = ({ data, propertyId }: { data: any, propertyId: number }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();

    const city = capitalizeWords(data?.meta?.find(
        (item: any) => item.metaKey === "city"
    )?.metaValue);

    const state = capitalizeWords(data?.meta?.find(
        (item: any) => item.metaKey === "state"
    )?.metaValue);

    const country = capitalizeWords(data?.meta?.find(
        (item: any) => item.metaKey === "country"
    )?.metaValue);

    const locationText = [city, state, country]
        .filter(Boolean)
        .join(", ");

    const wayToBuyFraction = useCallback(() => {
        navigation.navigate(Routes.PROPERTY.BUYFRACTION, {
            propertyId,
        });
    }, [navigation]);

    const soldPercentage =
        data?.totalFractions > 0
            ? ((data.totalSoldFractions / data.totalFractions) * 100).toFixed(0)
            : 0;

    return (
        <View style={styles.mainWrapper}>
            <View>
                {locationText && (
                    <View style={styles.location}>
                        <SimpleLineIcons name="location-pin" size={10} color={colors.text.yellow} />
                        <Text style={styles.locationText}>
                            {locationText}
                        </Text>
                    </View>
                )}
                <Text style={styles.title}>
                    {data?.assetTitle}
                </Text>
            </View>
            <View style={styles.card}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Price per Fraction</Text>
                    <Text style={styles.priceValue}>
                        ₹ {formatAmountWithCommas(data?.price?.currentPricePerFraction)}
                    </Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(data?.totalSoldFractions / data?.totalFractions) * 100}%` }
                            ]}
                        />
                    </View>
                    <View style={[styles.priceRow, { marginTop: 10 }]}>
                        <Text style={styles.progressText}>
                            {data?.totalSoldFractions}/{data?.totalFractions} ({soldPercentage}%) Fractions Sold!
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.bottomRow}>
                    <View>
                        <Text style={styles.normalText}><Text style={styles.greenText}>{data?.totalBuyersCount}</Text>{" "}Investors</Text>
                        <Text style={styles.normalText}>
                            <Text style={styles.greenText}>12%</Text>{" "}Average Return
                        </Text>
                    </View>

                    <ButtonPrimary
                        title={
                            data?.isSoldOut ? ButtonTextTypes.Sold_Out : ButtonTextTypes.Buy_Fraction
                        }
                        width={ButtonWidthTypes.Medium}
                        align={ButtonAlignTypes.Center}
                        buttonStyle={styles.buyButtonStyle}
                        textStyle={styles.buyTextStyles}
                        disabled={data?.isSoldOut}
                        onPress={wayToBuyFraction}
                    />
                </View>
                {data?.isSoldOut && (
                    <Text style={styles.soldOutText}>All fractions for this property have been sold</Text>
                )}
            </View>
        </View>
    );
};

const PropertyDescription = ({ data }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [expanded, setExpanded] = useState(false);

    const shortDescription = data?.meta?.find(
        (item: any) => item.metaKey === "shortDescription"
    )?.metaValue;

    const detailedDescription = data?.meta?.find(
        (item: any) => item.metaKey === "detailedDescription"
    )?.metaValue;

    const paragraphs = detailedDescription
        ?.split(/\n\s*\n/)
        .filter(Boolean) || [];

    const textToShow = expanded
        ? paragraphs.join("\n\n")
        : paragraphs[0];

    if (!shortDescription && !detailedDescription) return null;

    return (
        <>
            <View style={styles.divider} />
            <View style={styles.descriptionWrapper}>
                <View style={styles.header}>
                    <Ionicons
                        name="arrow-forward-circle-outline"
                        size={18}
                        color={colors.icon.primary}
                    />
                    <Text style={styles.descriptionTitle}>
                        Property Description
                    </Text>
                </View>

                <View style={styles.descriptionTextWrapper}>
                    <Text style={styles.description}>
                        {shortDescription}
                    </Text>

                    <Text style={styles.description}>
                        {textToShow}
                        {" "}
                        {paragraphs?.length > 1 && (
                            <Text
                                style={styles.readMore}
                                onPress={() => setExpanded(prev => !prev)}
                            >
                                {expanded ? "Read Less" : "Read More"}
                            </Text>
                        )}
                    </Text>
                </View>
            </View>
        </>
    )
};

const WhyTheyInvested = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.descriptionWrapper}>
            <View style={styles.header}>
                <Ionicons
                    name="arrow-forward-circle-outline"
                    size={18}
                    color={colors.icon.primary}
                />
                <Text style={styles.descriptionTitle}>
                    Why they invested in this property
                </Text>
            </View>

            <View style={styles.grid}>
                {DATA.map((item, index) => (
                    <View
                        key={index}
                        style={styles.investCard}
                    >
                        <item.icon width={26} height={26} />
                        <Text style={styles.investTitle}>{item.title}</Text>
                        <Text style={styles.investDescription}>{item.description}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const InvestmentSummaryBar = ({
    principal,
    rental,
    appreciation,
}: InvestmentProps) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const format = (value: number) =>
        `₹ ${value.toLocaleString('en-IN')}`;

    return (
        <View style={styles.barContainer}>
            <SummaryItem
                label="Investment"
                value={format(principal)}
                dotColor="#DFDFDF"
            />
            <SummaryItem
                label="Rental Income"
                value={format(rental)}
                dotColor="#2F5BCC"
            />
            <SummaryItem
                label="Value Appreciation"
                value={format(appreciation)}
                dotColor="#FFB816"
            />
        </View>
    );
};

const SummaryItem = ({
    label,
    value,
    dotColor,
}: {
    label: string;
    value: string;
    dotColor: string;
    showDivider?: boolean;
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={styles.item}>
            <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <View>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.value}>{value}</Text>
                </View>
            </View>
        </View>
    );
};

const PropertyDetails = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const routes = useRoute();
    const { propertyId } = routes?.params as { propertyId: number };
    const { data, isLoading, refetch } = useAssetByIdApi(propertyId);
    const sliderImages = data?.documents
        ? data.documents
            .filter((item: any) => item?.documentType === "ASSET_IMAGE")
            .map((item: any) => item?.url)
        : [];
    const sliderVideos = data?.documents
        ? data.documents
            .filter((item: any) => item?.documentType === "ASSET_VIDEO")
            .map((item: any) => item?.url)
        : [];
    const [summary, setSummary] = useState<InvestmentProps>();

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const finalYear = summary;

    const totalInvestment = finalYear?.principal ?? 0;
    const totalRental = finalYear?.rental ?? 0;
    const totalAppreciation = finalYear?.appreciation ?? 0;

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {isLoading ? (
                        <DetailsSkeletonLoader />
                    ) : (
                        <>
                            <ImageSlider
                                images={sliderImages}
                                videos={sliderVideos}
                                propertyId={propertyId}
                                isFavourite={data?.isFavourite}
                            />
                            <PropertyStatusPills />
                            <PropertyInfoCard data={data} propertyId={propertyId} />
                            <PropertyDescription data={data} />
                            <View style={styles.divider} />
                            <WhyTheyInvested />
                            <View style={styles.divider} />
                            <InvestmentCalculator
                                onSummaryChange={(summary: any) => {
                                    setSummary(summary);
                                }}
                            />
                            <InvestmentSummaryBar
                                principal={totalInvestment}
                                rental={totalRental}
                                appreciation={totalAppreciation}
                            />

                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default PropertyDetails;