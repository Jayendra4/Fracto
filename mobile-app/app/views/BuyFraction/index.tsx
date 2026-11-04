import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ScrollView,
    View,
    Text,
    Image,
    FlatList,
    TextInput,
    Pressable,
    Animated,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./BuyFraction.style";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import Feather from "react-native-vector-icons/Feather";
import Checkbox from "../../components/Checkbox";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { capitalizeWords, formatAmountWithCommas } from "../../util/helper";
import { useApplyCoupon, useAssetApi, useAssetByIdApi, useUserWalletApi } from "../../services/auth.service";
import Routes, { NavigationProp } from "../../constant/Routes";
import Toast from "react-native-toast-message";
import { useAssetPurchaseRequestApi } from "../../services/hooks/useApi";
import SkeletonClassic from "../../util/SkeletonClassic";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { KycStatusType } from "../../components/Navigation/TabBar/TabBar.types";
import AddBankAccountModal from "../../components/Modals/AddBankAccountModal";
import TextInputClassic from "../../components/TextInputClassic";
import { AccountType } from "../../store/authSlice.types";
import { Video } from "react-native-video";

const getLocationFromMeta = (meta: any[] = []) => {
    const map: any = {};

    meta.forEach((m) => {
        map[m.metaKey] = m.metaValue;
    });

    return [
        capitalizeWords(map.city),
        capitalizeWords(map.state),
        capitalizeWords(map.country),
    ]
        .filter(Boolean)
        .join(", ");
};

const BuyFraction = () => {
    const { colors, themeAppearance } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const isKycApproved = userDetails?.kycStatus === KycStatusType.Approved;
    const isKycSubmitted = userDetails?.kycStatus === KycStatusType.Submitted;
    const routes = useRoute();
    const { propertyId } = routes?.params as { propertyId: number };
    const { data, isLoading: propertyLoading } = useAssetByIdApi(propertyId);
    const { data: wallet, refetch: refetchWallet } = useUserWalletApi();

    const [coupon, setCoupon] = useState("");
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const { mutateAsync: applyCoupon, isPending: couponLoading } = useApplyCoupon();
    const [couponError, setCouponError] = useState("");
    const [couponData, setCouponData] = useState<any>(null);
    const { mutateAsync, isPending: purchaseLoading, error: assetPurchaseError } =
        useAssetPurchaseRequestApi();
    const [units, setUnits] = useState<string>("1");
    const [terms, setTerms] = useState<boolean>(false);
    const LIMIT = 10;
    const [page, setPage] = useState(1);
    const skip = (page - 1) * LIMIT;
    const [recommendedData, setRecommendedData] = useState<any[]>([]);
    const [showAddBank, setShowAddBank] = useState(false);

    const walletBalance = Number(wallet?.amount || 0);
    const numericUnits = Number(units || 0);
    const maxUnits = Number(data?.remainingFractions || 0);

    const { data: asset, isLoading, isFetching } = useAssetApi({
        skip,
        take: LIMIT,
        assetStatus: "Available",
        isVisible: true,
    });

    useEffect(() => {
        if (asset?.data) {
            setRecommendedData(prev =>
                page === 1 ? asset.data : [...prev, ...asset.data]
            );
        }
    }, [asset]);

    useFocusEffect(
        useCallback(() => {
            refetchWallet();
        }, [refetchWallet])
    );

    const handleLoadMore = () => {
        if (!isFetching && asset?.data?.length === LIMIT) {
            setPage(prev => prev + 1);
        }
    };

    const handleApplyCoupon = async () => {
        try {
            const res = await applyCoupon({
                code: coupon?.trim(),
                assetId: data?.id,
                fractions: Number(units),
            });
            setCouponError("");
            setCouponData(res);
        } catch (err: any) {
            setCouponData(null);
            setCouponError(err?.message || "Invalid coupon");
        }
    };

    useEffect(() => {
        if (couponData) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [couponData, opacityAnim, scaleAnim]);

    const image = data?.documents?.find((item: any) => item?.url);

    const isWebm = image?.url?.toLowerCase().endsWith('.webm');

    const locationText = getLocationFromMeta(data?.meta);
    const yieldPA = data?.meta?.find((item: any) =>
        item?.metaKey === 'expectedYieldPercentage')?.metaValue || 0;

    const getMoreDetails = useCallback((id: number) => {
        navigation.navigate(Routes.PROPERTY.DETAILS, {
            propertyId: id,
        })
    }, [navigation]);

    const pricePerFraction = data?.price?.currentPricePerFraction || 0;

    const yieldPercentage = Number(
        data?.meta?.find((item: any) => item?.metaKey === "expectedYieldPercentage")?.metaValue || 0
    );

    const appreciationPercentage = Number(
        data?.meta?.find((item: any) => item?.metaKey === "expectedAppreciationPercentage")?.metaValue || 0
    );

    const totalExpectedReturn = yieldPercentage + appreciationPercentage;

    const totalPayable = React.useMemo(() => {
        return Number(units || 0) * pricePerFraction;
    }, [units, pricePerFraction]);

    const wayToAssets = useCallback(() => {
        navigation.replace(Routes.TABS.HOME, {
            screen: Routes.TABS.ASSET,
        })
    }, [navigation]);

    const confirmAssetPurchase = useCallback(async (assetId: number) => {
        try {
            if (numericUnits > maxUnits) {
                Toast.show({
                    type: 'error',
                    text1: `You can only buy up to ${maxUnits} fractions`,
                });
                return;
            }

            await mutateAsync({
                assetId,
                ...(couponData?.code && { couponCode: couponData?.code }),
                fractions: numericUnits,
            })
            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Investment Successful",
                mainText: "Your investment has been recorded successfully.",
                subText: "You can view the details and track performance from your portfolio.",
                onForward: wayToAssets,
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || assetPurchaseError?.message || 'Invalid Request',
            });
        }
    }, [assetPurchaseError, mutateAsync, numericUnits, couponData, maxUnits]);

    const savedAmount = useMemo(() => {
        if (!couponData?.coupon) return 0;

        const discountValue = Number(couponData?.coupon?.discountValue || 0);
        const maxDiscount = Number(couponData?.coupon?.maxDiscountAmount || 0);

        const discount = (totalPayable * discountValue) / 100;

        return Math.min(discount, maxDiscount);
    }, [totalPayable, couponData]);

    const originalAmount = totalPayable;
    const finalPayable = originalAmount - savedAmount;
    const shortfall = Math.max(0, finalPayable - walletBalance);

    const {
        isDisabled,
        buttonTitle,
        onButtonPress
    } = useMemo(() => {
        if (isKycSubmitted) {
            return {
                isDisabled: false,
                buttonTitle: ButtonTextTypes.KYC_under_review,
                onButtonPress: () => userDetails?.type === AccountType.Company ?
                    navigation.navigate(Routes.TABS.HOME, {
                        screen: Routes.TABS.ONBOARDING
                    }) :
                    navigation.navigate(Routes.TABS.HOME, {
                        screen: Routes.TABS.KYC,
                    }),
            };
        }

        if (!isKycApproved) {
            return {
                isDisabled: false,
                buttonTitle: ButtonTextTypes.Complete_KYC_to_Invest,
                onButtonPress: () => userDetails?.type === AccountType.Company ?
                    navigation.navigate(Routes.TABS.HOME, {
                        screen: Routes.TABS.ONBOARDING
                    }) :
                    navigation.navigate(Routes.TABS.HOME, {
                        screen: Routes.TABS.KYC,
                    }),
            };
        }

        if (!userDetails?.isBankAdded) {
            return {
                isDisabled: false,
                buttonTitle: ButtonTextTypes.Add_Bank_to_Invest,
                onButtonPress: () => setShowAddBank(true),
            };
        }

        if (numericUnits > 0 && finalPayable > walletBalance) {
            return {
                isDisabled: false,
                buttonTitle: ButtonTextTypes.Add_Money_to_Wallet,
                onButtonPress: () =>
                    navigation.navigate(Routes.FUNDS.ADDMONEY, {
                        requiredAmount: shortfall,
                        onAction: () => navigation.goBack(),
                    }),
            };
        }

        if (numericUnits <= 0 || !terms) {
            return {
                isDisabled: true,
                buttonTitle: ButtonTextTypes.Confirm_And_Invest,
                onButtonPress: () => { },
            };
        }

        return {
            isDisabled: false,
            buttonTitle: ButtonTextTypes.Confirm_And_Invest,
            onButtonPress: () => confirmAssetPurchase(data?.id),
        };
    }, [
        isKycApproved,
        numericUnits,
        finalPayable,
        walletBalance,
        terms,
        navigation,
        data?.id,
        confirmAssetPurchase,
    ]);

    const renderRecommendedItem = useCallback(({ item }: any) => {
        const locationInnerText = getLocationFromMeta(item?.meta);

        return (
            <View style={styles.recommendedCard}>
                <Image
                    source={{ uri: item?.documents?.[0]?.url }}
                    style={styles.recommendedImage}
                    resizeMode="cover"
                />

                <View style={[styles.recommendedContent, styles.shrink]}>
                    <Text style={styles.cardTitle}>{item?.assetTitle}</Text>
                    {locationInnerText && (
                        <View style={styles.cardlocationRow}>
                            <EvilIcons name="location" size={12} color={colors.text.lightGrey} />
                            <Text style={styles.propertyLocation}>
                                {locationInnerText}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.divider, styles.divider3]} />

                    <View style={styles.cardInfoWrapper}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel} numberOfLines={1}>
                                Price of Fraction:
                            </Text>
                            <Text style={styles.infoValue}>
                                ₹{formatAmountWithCommas(item?.currentPricePerFraction || 0)}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel} numberOfLines={1}>
                                ROI:
                            </Text>
                            <Text style={styles.infoValue}>
                                {item?.financials?.roi?.fiveYearROI || 0}%
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel} numberOfLines={1}>
                                Yield:
                            </Text>
                            <Text style={styles.infoValue}>
                                {item?.financials?.yield?.actualYieldPercent || 0}%
                            </Text>
                        </View>
                    </View>

                    <ButtonPrimary
                        title={ButtonTextTypes.Get_More_Details}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        buttonStyle={styles.detailsButton}
                        textStyle={styles.detailsButtonText}
                        onPress={() => getMoreDetails(item?.id)}
                    />
                </View>
            </View>
        )
    }, [colors, navigation]);

    console.log(data)

    return (
        <>
            <SafeAreaView style={styles.root}>
                <View style={styles.container}>
                    <PropertyHeader enableBack />

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.spaceHorizontal}>
                            {propertyLoading ? (
                                <SkeletonClassic
                                    height={134}
                                    width="auto"
                                    borderRadius={8}
                                    style={{ marginHorizontal: 10 }}
                                />
                            ) : (
                                <View style={styles.propertyCard}>
                                    {isWebm && image?.url ? (
                                        <View style={styles.propertyImage}>
                                            <Video
                                                source={{ uri: image.url }}
                                                style={styles.propertyImage}
                                                resizeMode="cover"
                                                repeat
                                                muted
                                                paused={false}
                                            />
                                        </View>
                                    ) : (
                                        <Image
                                            source={{ uri: image?.url }}
                                            style={styles.propertyImage}
                                            resizeMode="cover"
                                        />
                                    )}

                                    <View style={[styles.shrink, { flex: 1 }]}>
                                        <Text style={styles.propertyTitle}>
                                            {data?.assetTitle}
                                        </Text>
                                        {locationText && (
                                            <View style={styles.locationRow}>
                                                <EvilIcons name="location" size={12} color={colors.text.lightGrey} />
                                                <Text style={styles.propertyLocation}>
                                                    {locationText}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={styles.divider} />

                                        <View style={styles.infoRowWrapper}>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel} numberOfLines={1}>
                                                    Price per Fraction:
                                                </Text>
                                                <Text style={styles.infoValue}>
                                                    ₹{formatAmountWithCommas(data?.price?.currentPricePerFraction || 0)}
                                                </Text>
                                            </View>

                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel} numberOfLines={1}>
                                                    ROI:
                                                </Text>
                                                <Text style={styles.infoValue}>
                                                    {totalExpectedReturn || 0}%
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    Number of Fractions to Buy{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>

                                <View style={styles.counter}>
                                    <Text style={styles.units}>Units: </Text>
                                    <TextInput
                                        value={units}
                                        onChangeText={(text) => {
                                            const sanitized = text?.replace(/[^0-9]/g, "");
                                            const numeric = Number(sanitized || 0);

                                            if (numeric <= maxUnits) {
                                                setUnits(sanitized);
                                            } else {
                                                setUnits(String(maxUnits));
                                            }
                                        }}
                                        placeholder="Enter how much fractions to buy"
                                        placeholderTextColor={colors.text.muted}
                                        style={styles.buyInput}
                                        keyboardType="number-pad"
                                        returnKeyType="done"
                                        keyboardAppearance={themeAppearance}
                                    />

                                    <View style={styles.counterButtonWrapper}>
                                        <Pressable
                                            onPress={() =>
                                                setUnits(prev => {
                                                    const next = Math.min(maxUnits, Number(prev) + 1);
                                                    return String(next);
                                                })
                                            }
                                            style={styles.counterButton}
                                        >
                                            <Feather name="plus" size={16} color={colors.icon.primary} />
                                        </Pressable>
                                        <View style={styles.verticalDivider} />
                                        <Pressable
                                            onPress={() =>
                                                setUnits(prev => String(Math.max(0, Number(prev) - 1)))
                                            }
                                            style={styles.counterButton}
                                        >
                                            <Feather name="minus" size={16} color={colors.icon.primary} />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.summaryWrapper, styles.totalFractionsWrapper]}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Remaining Fractions</Text>
                                    <View style={styles.maxWrapper}>
                                        <Text
                                            style={styles.maxText}
                                            onPress={() => setUnits(String(maxUnits))}
                                        >
                                            Buy Max
                                        </Text>
                                        <View style={styles.allowShrink}>
                                            <Text style={styles.summaryValue} numberOfLines={1}>
                                                {maxUnits}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.summaryWrapper, styles.totalFractionsWrapper]}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Total Fractions</Text>
                                    <View style={styles.allowShrink}>
                                        <Text style={styles.summaryValue} numberOfLines={1}>
                                            {data?.totalFractions}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.divider, styles.fractionDivider]} />

                            <View style={styles.summaryWrapper}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Original Amount</Text>
                                    <View style={styles.allowShrink}>
                                        <Text style={styles.summaryValue} numberOfLines={1}>
                                            ₹ {formatAmountWithCommas(totalPayable)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Estimate Rental Yield</Text>
                                    <Text style={styles.summaryValue} numberOfLines={1}>
                                        {yieldPA}% P.A.
                                    </Text>
                                </View>

                                {couponData?.code && (
                                    <View style={styles.discount}>
                                        <View style={styles.discountRow}>
                                            <Text style={styles.discountLab}>Discount</Text>
                                            <View style={styles.discountTag}>
                                                <Text style={styles.discountTagText}>
                                                    {(couponData?.coupon?.discountValue ?? 0)}% OFF
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={styles.discountLab}>
                                            - ₹ {formatAmountWithCommas(savedAmount ?? 0)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Final Amount</Text>
                                    <View style={styles.allowShrink}>
                                        <Text style={styles.summaryValue} numberOfLines={1}>
                                            ₹ {formatAmountWithCommas(finalPayable)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.dottedDivider}>
                                    {Array.from({ length: 40 }).map((_, i) => (
                                        <View key={i} style={styles.dot} />
                                    ))}
                                </View>

                                <View style={styles.walletCard}>
                                    <Text
                                        style={styles.walletTitle}
                                        numberOfLines={1}
                                    >
                                        Paying from Wallet Balance
                                    </Text>
                                    <View style={styles.innerWallet}>
                                        <Text style={styles.walletAmount}>
                                            ₹ {formatAmountWithCommas(walletBalance)}
                                        </Text>
                                        {shortfall > 0 && (
                                            <View style={styles.shortfallBadge}>
                                                <Text style={styles.shortfallText} numberOfLines={1}>
                                                    Shortfall: ₹{formatAmountWithCommas(shortfall)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                </View>
                            </View>

                            <View style={styles.termsWrapper}>
                                <Checkbox
                                    checked={terms}
                                    onChange={setTerms}
                                    label="I agree to the "
                                    labelStyle={styles.termsTitle}
                                />
                                <Text style={styles.termsLink}>
                                    Terms & Conditions
                                </Text>
                            </View>

                            <View style={styles.promoWrapper}>

                                <View style={styles.promoInputWrapper}>
                                    <View
                                        style={[
                                            styles.inputContainer,
                                            { opacity: totalPayable > 0 && couponData === null ? 1 : 0.5 }
                                        ]}
                                    >
                                        <TextInputClassic
                                            label="Apply Promo Code"
                                            placeholder="Enter coupon code"
                                            value={coupon}
                                            onChangeText={setCoupon}
                                            readOnly={totalPayable < 0 || numericUnits === 0 || couponData !== null}
                                        />
                                    </View>

                                    <Pressable
                                        disabled={!coupon.trim() || totalPayable === 0}
                                        style={[
                                            styles.applyButton,
                                            { opacity: coupon.trim() && totalPayable > 0 ? 1 : 0.5 }
                                        ]}
                                        onPress={() => {
                                            if (couponData) {
                                                setCouponData(null);
                                                setCoupon("");
                                                setCouponError("");
                                            } else {
                                                handleApplyCoupon();
                                            }
                                        }}
                                    >
                                        {couponLoading ? (
                                            <ActivityIndicator size={"small"} color={colors.text.primary} />
                                        ) : couponData ? (
                                            <Feather name="x" size={18} color={colors.constant.white} />
                                        ) : (
                                            <Text style={styles.applyText}>Apply</Text>
                                        )}
                                    </Pressable>
                                </View>

                                {couponError && !couponData ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorText}>{couponError}</Text>
                                    </View>
                                ) : !couponData ? (
                                    <Text style={styles.promoHint}>
                                        Select fractions to apply a promotional code
                                    </Text>
                                ) : null}

                                {couponData && !couponError && (
                                    <View style={styles.modalOverlay}>
                                        <Animated.View
                                            style={[
                                                styles.couponCard,
                                                {
                                                    opacity: opacityAnim,
                                                    transform: [{ scale: scaleAnim }],
                                                },
                                            ]}
                                        >
                                            <View>
                                                <View style={styles.couponTop}>
                                                    <Text style={styles.couponTitle} numberOfLines={1}>
                                                        Coupon is valid
                                                    </Text>
                                                    <View style={styles.savedBadge}>
                                                        <Text style={styles.savedText}>SAVED ₹{savedAmount}</Text>
                                                    </View>
                                                </View>

                                                <Text style={styles.couponRedeem} numberOfLines={2}>
                                                    {couponData?.coupon?.description}
                                                </Text>
                                            </View>

                                            <View style={styles.mDivider} />

                                            <View style={styles.couponDetails}>
                                                <Text style={styles.detailText}>
                                                    Min Purchase: ₹{couponData?.coupon?.minPurchaseAmount}
                                                </Text>
                                                <Text style={styles.detailText}>
                                                    Max Discount: ₹{couponData?.coupon?.maxDiscountAmount}
                                                </Text>
                                                <Text style={styles.detailText}>
                                                    Valid Till: {new Date(couponData?.coupon?.validTill).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </Text>
                                            </View>

                                        </Animated.View>
                                    </View>
                                )}
                            </View>

                            <View style={styles.buttonsWrapper}>
                                <ButtonPrimary
                                    title={buttonTitle}
                                    width={ButtonWidthTypes.Full}
                                    align={ButtonAlignTypes.Center}
                                    disabled={isDisabled}
                                    buttonStyle={styles.confirmButton}
                                    textStyle={styles.buttonText}
                                    loading={purchaseLoading}
                                    onPress={onButtonPress}
                                />
                            </View>
                        </View>

                        <View style={styles.spaceHorizontal}>
                            <Text style={styles.recommendedTitle}>
                                Recommended Properties
                            </Text>
                            <View style={[styles.divider, styles.divider2]} />

                            <FlatList
                                data={isLoading && page === 1 ? Array.from({ length: 4 }) : recommendedData}
                                keyExtractor={(item, index) => `${item?.id ?? "skeleton"}-${index}`}
                                renderItem={
                                    isLoading && page === 1
                                        ? () => (
                                            <SkeletonClassic
                                                height={210}
                                                width="auto"
                                                borderRadius={8}
                                            />
                                        )
                                        : renderRecommendedItem
                                }
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={
                                    isFetching && page > 1 ? (
                                        <SkeletonClassic height={210} width="auto" borderRadius={8} />
                                    ) : null
                                }
                                scrollEnabled={false}
                                contentContainerStyle={styles.listing}
                                ListEmptyComponent={
                                    !isLoading ? (
                                        <View style={styles.emptyWrapper}>
                                            <Text style={styles.emptyText}>
                                                No recommended properties available.
                                            </Text>
                                        </View>
                                    ) : null
                                }
                            />
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>

            <AddBankAccountModal
                visible={showAddBank}
                onClose={() => setShowAddBank(false)}
                onAction={() => navigation.goBack()}
            />
        </>
    );
};

export default BuyFraction;
