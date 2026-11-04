import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { Colors, useTheme } from "../../util/theme";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useGetBrokerInviteApi, useGetBrokerLeadsApi } from "../../services/auth.service";
import moment from "moment";
import { copyToClipboard } from "../../util/helper";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const tabs = ['Investor Referrals', 'Asset Owner Referrals'];

interface Step {
    title: string;
    subTitle: string;
}

interface Props {
    childTab?: string;
}

const Referrals = ({ childTab }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const navigation = useNavigation<NavigationProp>();
    const [activeTab, setActiveTab] = useState('Investor Referrals');
    const {
        data,
        isPending: inviteLoading,
    } = useGetBrokerInviteApi({
        brokerId: String(userDetails?.id),
        skip: 0,
        take: 10,
    });

    const {
        data: investorData,
        isPending,
    } = useGetBrokerLeadsApi({
        brokerId: String(userDetails?.id),
        type: "InvestorSignup",
        skip: 0,
        take: 10,
    });

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const referralList =
        activeTab === "Investor Referrals"
            ? investorData?.data ?? []
            : data?.data ?? [];

    const isLoading =
        activeTab === "Investor Referrals"
            ? isPending : inviteLoading;

    useEffect(() => {
        if (childTab) {
            setActiveTab(childTab);
        }
    }, [childTab]);

    const buildSteps = (item: any): Step[] => {
        const steps: Step[] = [];

        if (item?.assetOwnerStatus) {
            steps.push({
                title: `Asset Owner ${item?.assetOwnerStatus}`,
                subTitle: moment(
                    item?.assetOwnerStatus === "Approved"
                        ? item?.updatedAt
                        : item?.createdAt
                ).format("YYYY-MM-DD, hh:mm A"),
            });
        }

        if (item?.adminStatus) {
            steps.push({
                title: `Admin Status: ${item?.adminStatus}`,
                subTitle: moment(
                    item?.adminStatus === "Approved"
                        ? item?.approvedAt
                        : item?.createdAt
                ).format("YYYY-MM-DD, hh:mm A"),
            });
        }

        if (item?.isAssetOnBording) {
            steps.push({
                title: "Asset Onboarding Completed",
                subTitle: moment(item?.updatedAt).format("YYYY-MM-DD, hh:mm A"),
            });
        }

        if (item?.user?.kycStatus) {
            steps.push({
                title: `Investor KYC: ${item?.user?.kycStatus}`,
                subTitle: moment(item?.updatedAt).format("YYYY-MM-DD, hh:mm A"),
            });
        }

        return steps;
    };

    const getFullName = (item: any) => {
        if (activeTab === "Investor Referrals") {
            return item?.user?.name ?? "Unknown Investor";
        }
        return `${item?.assetOwnerDetails?.firstName ?? "Unknown"} ${item?.assetOwnerDetails?.lastName ?? "Asset Owner"}`;
    };

    const getEmail = (item: any) => {
        return activeTab === "Investor Referrals"
            ? item?.user?.email
            : item?.assetOwnerEmail;
    };

    const getCode = (item: any) => {
        return activeTab === "Investor Referrals"
            ? item?.referralCode
            : item?.campaign?.code;
    };

    const getSentDate = (item: any) => {
        return moment(
            activeTab === "Investor Referrals"
                ? item?.firstUsedAt
                : item?.createdAt
        ).format("YYYY-MM-DD");
    };

    const wayToDetail = useCallback((item: any) => {
        navigation.navigate(Routes.DASHBOARD.REFERRALDETAILS, {
            data: item,
        });
    }, [navigation]);

    return (
        <>
            <View style={styles.mainWrapper}>
                <View style={styles.titleRow}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.title}>Referrals</Text>
                        <Text style={styles.subTitle}>
                            Track and manage your referral network
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, styles.spaceHorizontal]} />

                <View style={styles.tabsRow}>
                    {tabs.map(tab => (
                        <Pressable key={tab} onPress={() => setActiveTab(tab)}>
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab && styles.activeTabText
                                ]}
                            >
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {activeTab === "Investor Referrals" && investorData?.data?.length === 0 && !isLoading && (
                    <View style={styles.noData}>
                        <Text style={styles.noDataText}>No investor referrals found.</Text>
                    </View>
                )}

                {activeTab !== "Investor Referrals" && data?.data?.length === 0 && !isLoading && (
                    <View style={styles.noData}>
                        <Text style={styles.noDataText}>No asset owner referrals found.</Text>
                    </View>
                )}

                {isLoading && (
                    <ActivityIndicator color={colors.text.primary} size={"large"} />
                )}

                {!isLoading && (
                    <FlatList
                        data={referralList}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={{ rowGap: 20 }}
                        initialNumToRender={10}
                        windowSize={5}
                        scrollEnabled={false}
                        renderItem={({ item }) => {
                            const steps = buildSteps(item);
                            const fullName = getFullName(item);

                            return (
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={{ rowGap: 4, flex: 1 }}>
                                            <View style={styles.nameRow}>
                                                <Text
                                                    style={styles.name}
                                                    numberOfLines={1}
                                                >
                                                    {fullName}
                                                </Text>
                                                <Text style={styles.meta}>
                                                    Code: {getCode(item)}
                                                </Text>

                                                <Pressable
                                                    onPress={() => copyToClipboard(getCode(item))}
                                                    style={{ padding: 4 }}
                                                >
                                                    <Feather name="copy" size={14} color={colors.text.extraLight} />
                                                </Pressable>
                                            </View>

                                            <View style={styles.nameRow}>
                                                <Text
                                                    style={[styles.meta, { flexShrink: 1 }]}
                                                    numberOfLines={1}
                                                >
                                                    {getEmail(item)}
                                                </Text>
                                                <Text style={styles.meta}>
                                                    Sent: {getSentDate(item)}
                                                </Text>
                                            </View>

                                            <View style={styles.toggleWrapper}>
                                                <ButtonPrimary
                                                    title={ButtonTextTypes.View_Details}
                                                    width={ButtonWidthTypes.Half}
                                                    align={ButtonAlignTypes.Left}
                                                    style={{ width: 90 }}
                                                    buttonStyle={styles.detailButton}
                                                    textStyle={styles.detailButtonText}
                                                    onPress={() => wayToDetail(item)}
                                                />

                                                <Pressable
                                                    onPress={() =>
                                                        setExpandedId(expandedId === item?.id ? null : item?.id)
                                                    }
                                                >
                                                    <Text style={styles.toggleText}>
                                                        {expandedId === item?.id ? "Hide Activity" : "Show Activity"}
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>

                                    {expandedId === item?.id && (
                                        <View style={styles.stepsContainer}>
                                            <Text style={styles.timelineTitle}>Activity Timeline</Text>
                                            <View style={styles.divider} />

                                            <View style={styles.stepsWrapper}>
                                                {steps.map((step, index) => (
                                                    <View key={index} style={styles.stepItem}>
                                                        <View style={styles.stepRow}>
                                                            <View style={styles.stepCircleWrapper}>
                                                                <View style={styles.stepCircle}>
                                                                    <View style={styles.circle} />
                                                                </View>
                                                            </View>

                                                            <View style={styles.stepContent}>
                                                                <Text style={styles.stepTitle}>
                                                                    {step.title}
                                                                </Text>
                                                                <Text style={styles.stepLabel}>
                                                                    {step.subTitle}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        {index !== steps?.length - 1 && (
                                                            <View style={styles.stepLine} />
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                    />
                )}
            </View>
        </>
    );
};

export const createStyles = (colors: Colors) => StyleSheet.create({
    mainWrapper: {
        flex: 1,
        rowGap: 24,
    },
    titleRow: {
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    titleWrapper: {
        rowGap: 4,
        flexShrink: 1,
    },
    title: {
        color: colors.text.default,
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 20,
    },
    subTitle: {
        color: colors.text.extraLight,
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
    },
    spaceHorizontal: {
        marginHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.isLight ? colors.background.darkBlue : '#F5F5F533',
    },
    createButton: {
        height: 30,
        width: 160,
        alignSelf: 'flex-end',
        borderRadius: 3,
    },
    createButtonText: {
        fontSize: 12,
    },
    tabsRow: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
    },
    tabText: {
        fontSize: 16,
        fontFamily: "WorkSans-Regular",
        color: colors.text.extraLight,
        paddingBottom: 6,
    },
    activeTabText: {
        color: colors.text.default,
        fontFamily: "WorkSans-Medium",
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary,
    },
    card: {
        marginHorizontal: 16,
        backgroundColor: colors.background.default,
        borderRadius: 10,
        padding: 16,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border.divider,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    headerRight: {
        alignItems: "flex-end",
        gap: 6,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 16,
    },
    name: {
        fontSize: 16,
        fontFamily: "WorkSans-SemiBold",
        color: colors.text.default,
        flexShrink: 1,
    },
    meta: {
        fontSize: 12,
        color: colors.text.extraLight,
        fontFamily: "WorkSans-Regular",
    },
    code: {
        fontSize: 12,
        color: "#CBD5F5",
    },
    toggleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20,
        marginTop: 4,
    },
    toggleText: {
        fontSize: 14,
        color: colors.text.primary,
        fontFamily: "WorkSans-Regular",
        textDecorationLine: 'underline',
    },
    detailButton: {
        height: 30,
        borderRadius: 4,
        paddingHorizontal: 0,
    },
    detailButtonText: {
        fontSize: 12,
    },
    stepsContainer: {
        backgroundColor: "#FFFFFF0A",
        borderRadius: 16,
        padding: 12,
        gap: 16,
        marginTop: 10,
    },
    timelineTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    stepsWrapper: {
        rowGap: 24,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 12,
    },
    stepItem: {
        position: "relative",
    },
    stepCircleWrapper: {
        width: 24,
        height: 24,
        borderRadius: 100,
        backgroundColor: colors.background.slightly,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
        zIndex: 1,
        overflow: 'hidden',
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 100,
        backgroundColor: '#33BD561F',
        justifyContent: "center",
        alignItems: "center",
    },
    circle: {
        width: 12,
        height: 12,
        borderRadius: 100,
        backgroundColor: colors.background.green,
    },
    stepNumber: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    stepLine: {
        position: "absolute",
        left: 12,
        top: 30,
        width: 1,
        height: 74,
        backgroundColor: colors.border.green,
    },
    stepContent: {
        flexShrink: 1,
        rowGap: 4,
    },
    amount: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.green,
    },
    subTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    stepLabel: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
    },
    stepTitle: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    noData: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    noDataText: {
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.extraLight,
    },
});

export default Referrals;