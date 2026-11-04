import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./ReferralDetails.types";
import Building from "../../assets/icons/building.svg";
import BuildingLight from "../../assets/icons/building-light.svg";
import Feather from "react-native-vector-icons/Feather";
import ResearchArrow from "../../assets/icons/research-arrow.svg";
import ResearchArrowLight from "../../assets/icons/research-arrow-light.svg";
import Commission from "../../assets/icons/commission.svg";
import CommissionLight from "../../assets/icons/commission-light.svg";
import AssetOverview from "../../assets/icons/asset-overview.svg";
import AssetOverviewLight from "../../assets/icons/asset-overview-light.svg";
import AssetLocation from "../../assets/icons/asset-location.svg";
import AssetLocationLight from "../../assets/icons/asset-location-light.svg";
import SizeValuation from "../../assets/icons/size-valuation.svg";
import SizeValuationLight from "../../assets/icons/size-valuation-light.svg";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import { formatAmountWithCommas } from "../../util/helper";
import { useGetInvestorActivityApi } from "../../services/auth.service";

interface Props {
    icon: React.ReactNode;
    title: string,
    fieldsData: { id: string, label: string, value: string }[];
};

const DetailBox = ({ icon, title, fieldsData }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={styles.infoWrapper}>
            <View style={styles.row}>
                {icon}
                <Text style={styles.infoTitle}>{title}</Text>
            </View>
            <View style={styles.allFields}>
                {fieldsData?.map((field) => (
                    <View key={field?.id} style={styles.fieldsWrapper}>
                        <Text style={styles.label}>{field?.label}</Text>
                        <Text style={styles.value}>{field?.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

const ReferralDetails = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const route = useRoute<any>();
    const referral = route.params?.data;
    const isInvestor = referral?.referralUsesType === "InvestorSignup";
    const { data } = useGetInvestorActivityApi(referral?.user?.id);

    const investorFields = [
        { id: "1", label: "Full Name", value: referral?.user?.name ?? "—" },
        { id: "2", label: "Email", value: referral?.user?.email ?? "—" },
        { id: "3", label: "Contact", value: referral?.user?.mobile ?? "—" },
        { id: "4", label: "User Type", value: referral?.user?.type ?? "—" },
        { id: "5", label: "KYC Status", value: referral?.user?.kycStatus ?? "—" },
        { id: "6", label: "Location", value: "N/A" },
    ];

    const investorStats = [
        { id: "1", label: "Usage Count", value: String(referral?.usageCount ?? 0) },
        { id: "2", label: "Reward Limit", value: String(referral?.rewardLimit ?? 0) },
    ];

    const assetOwnerFields = [
        {
            id: "1",
            label: "Email",
            value: referral?.assetOwnerEmail,
        },
        {
            id: "2",
            label: "Owner Status",
            value: referral?.assetOwnerStatus,
        },
        {
            id: "3",
            label: "Admin Status",
            value: referral?.adminStatus,
        },
        {
            id: "4",
            label: "Onboarding Active",
            value: referral?.isAssetOnBording ? "Yes" : "No",
        },
    ];

    const commissionFields = [
        {
            id: "1",
            label: "Proposed Commission",
            value: `${referral?.proposedCommissionPct}%`,
        },
        {
            id: "2",
            label: "Final rate subject to platform approval",
            value: referral?.finalCommissionPct
                ? `${referral?.finalCommissionPct}%`
                : "—",
        },
    ];

    const assetOverviewFields = [
        {
            id: "1",
            label: "Asset Type",
            value: referral?.propertyDetails?.assetType ?? "—",
        },
        {
            id: "2",
            label: "Ownership Model",
            value: referral?.propertyDetails?.ownershipModel,
        },
        {
            id: "3",
            label: "Market Value",
            value: `₹ ${formatAmountWithCommas(referral?.propertyDetails?.marketValue)}`,
        },
    ];

    const assetLocationFields = [
        {
            id: "1",
            label: "City",
            value: referral?.propertyDetails?.city,
        },
        {
            id: "2",
            label: "State",
            value: `${referral?.propertyDetails?.state} (${referral?.propertyDetails?.country?.split(" ")?.slice(-1)?.join('')})`,
        },
        {
            id: "3",
            label: "PIN Code",
            value: referral?.propertyDetails?.pincode,
        },
    ];

    const sizeFields = [
        {
            id: "1",
            label: "Land Area",
            value: referral?.propertyDetails?.landArea
                ? `${referral?.propertyDetails?.landArea} sq.ft`
                : "Final rate subject to platform approval",
        },
        {
            id: "2",
            label: "Built-up Area",
            value: `${referral?.propertyDetails?.builtupArea} sq.ft`,
        },
    ];

    const activities = [
        {
            id: "1",
            title: "Referral Created",
            color: styles.green,
            value: moment(referral?.createdAt).format("DD/MM/YYYY, HH:mm:ss"),
        },
        {
            id: "2",
            title: "Invitation Sent",
            color: styles.blue,
            value: `Sent to: ${referral?.assetOwnerEmail}`,
        },
        {
            id: "3",
            title: "Status Update",
            color: styles.orange,
            value: `Current: ${referral?.assetOwnerStatus} (Admin: ${referral?.adminStatus})`,
        },
    ];

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.detailWrapper}>
                        <View style={styles.row}>
                            {colors.isLight ? (
                                <BuildingLight width={20} height={20} />
                            ) : (
                                <Building width={20} height={20} />
                            )}
                            <Text style={styles.detailTitle}>
                                {isInvestor
                                    ? referral?.user?.name
                                    : referral?.propertyDetails?.assetTitle ?? "—"}
                            </Text>
                        </View>

                        <View style={[styles.row, styles.spaceEqualRow]}>
                            <Text style={styles.subDetail}>
                                Code: <Text style={styles.code}>
                                    {isInvestor ? referral?.referralCode : referral?.campaign?.code}
                                </Text>
                            </Text>

                            {isInvestor ? (
                                <Text style={styles.subDetail}>
                                    First Used:{" "}
                                    <Text style={styles.date}>
                                        {moment(
                                            isInvestor ? referral?.firstUsedAt : referral?.createdAt
                                        ).format("DD/MM/YYYY")}
                                    </Text>
                                </Text>
                            ) : (
                                <Text style={styles.subDetail}>
                                    Sent:{" "}
                                    <Text style={styles.date}>
                                        {moment(referral?.createdAt).format("DD/MM/YYYY")}
                                    </Text>
                                </Text>
                            )}

                            <View style={[
                                styles.statusWrapper,
                                (isInvestor ? referral?.user?.kycStatus : referral?.assetOwnerStatus) !== "Approved"
                                && styles.orangeLight,
                            ]}>
                                <View
                                    style={[
                                        styles.dot,
                                        (isInvestor ? referral?.user?.kycStatus : referral?.assetOwnerStatus) === "Approved"
                                            ? styles.green
                                            : styles.orange,
                                    ]}
                                />
                                <Text style={[styles.subDetail, styles.whiteDetail]}>
                                    {(isInvestor ? referral?.user?.kycStatus : referral?.assetOwnerStatus)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {isInvestor ? (
                        <>
                            <DetailBox
                                icon={<Feather name="user" size={18} color={colors.icon.primary} />}
                                title="Investor Information"
                                fieldsData={investorFields}
                            />

                            <DetailBox
                                icon={<Feather name="bar-chart" size={18} color={colors.icon.primary} />}
                                title="Referral Stats"
                                fieldsData={investorStats}
                            />

                            <View style={styles.referralWrapper}>
                                <Text style={styles.header}>Activity Timeline</Text>

                                <View style={styles.activityWrapper}>
                                    {data?.data?.map((item: any) => (
                                        <View key={item.id}>
                                            <View style={[styles.statusTextRow, styles.investorTextRow]}>
                                                <View style={[styles.dot, styles.topSpace, styles.blue]} />
                                                <View style={styles.allowShrink}>
                                                    <Text style={styles.statusText}>{item.label}</Text>
                                                    <Text style={styles.timestamp}>
                                                        {moment(item?.createdAt).format("DD/MM/YYYY, HH:mm:ss")}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <DetailBox
                                icon={<Feather name="user" size={18} color={colors.icon.primary} />}
                                title="Asset Owner Information"
                                fieldsData={assetOwnerFields}
                            />

                            <DetailBox
                                icon={colors.isLight ?
                                    <CommissionLight width={18} height={18} /> :
                                    <Commission width={18} height={18} />
                                }
                                title="Commission Details"
                                fieldsData={commissionFields}
                            />

                            <DetailBox
                                icon={colors.isLight ?
                                    <AssetOverviewLight width={18} height={18} /> :
                                    <AssetOverview width={18} height={18} />
                                }
                                title="Asset Overview"
                                fieldsData={assetOverviewFields}
                            />

                            <DetailBox
                                icon={colors.isLight ?
                                    <AssetLocationLight width={18} height={18} /> :
                                    <AssetLocation width={18} height={18} />
                                }
                                title="Asset Location"
                                fieldsData={assetLocationFields}
                            />

                            <DetailBox
                                icon={colors.isLight ?
                                    <SizeValuationLight width={18} height={18} /> :
                                    <SizeValuation width={18} height={18} />
                                }
                                title="Size & Valuation"
                                fieldsData={sizeFields}
                            />

                            <View style={styles.referralWrapper}>
                                <View style={styles.row}>
                                    {colors.isLight ? (
                                        <ResearchArrowLight width={18} height={18} />
                                    ) : (
                                        <ResearchArrow width={18} height={18} />
                                    )}
                                    <Text style={styles.header}>Referral Activity History</Text>
                                </View>

                                <View style={styles.activityWrapper}>
                                    {activities.map(item => (
                                        <View key={item?.id}>
                                            <View style={styles.statusTextRow}>
                                                <View style={[styles.dot, styles.topSpace, item.color]} />
                                                <View>
                                                    <Text style={styles.statusText}>{item?.title}</Text>
                                                    <Text style={styles.timestamp}>{item?.value}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default ReferralDetails;