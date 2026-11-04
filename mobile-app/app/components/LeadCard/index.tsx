import { StyleSheet, Text, View } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import Building from "../../assets/icons/building.svg";
import BuildingLight from "../../assets/icons/building-light.svg";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { timeAgo } from "../../util/helper";

const LeadCard = ({ item }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();

    const renderStatus = (status: string) => {
        switch (status) {
            case 'Approved': return 'Ready';
            case 'Blocked': return 'Blocked';
            default: return 'KYC In Progress';
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Approved':
                return {
                    background: styles.readyBackground,
                    text: styles.readyText,
                    dot: styles.readyDot,
                    icon: <Feather
                        name="check"
                        size={12}
                        color={styles.readyText?.color}
                    />
                };
            case 'Blocked':
                return {
                    background: styles.blockedBackground,
                    text: styles.blockedText,
                    dot: styles.blockedDot,
                    icon: <Feather
                        name="x"
                        size={12}
                        color={styles.blockedText?.color}
                    />
                };
            default:
                return {
                    background: styles.kycBackground,
                    text: styles.kycText,
                    dot: styles.kycDot,
                    icon: <Entypo
                        name="back-in-time"
                        size={12}
                        color={styles.kycText?.color}
                    />
                };
        }
    };

    const statusStyles = getStatusStyles(item?.user?.kycStatus);
    const leadStatusStyles = getStatusStyles(item?.referredPropertyInvited?.adminStatus);

    const openDetailPage = useCallback(() => {
        navigation.navigate(Routes.DASHBOARD.INVESTORDETAILS, {
            leadId: item?.id,
            investorId: item?.user?.id,
        });
    }, [navigation, item]);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.hofId}>HOF ID {item?.user?.id}</Text>
                <View style={[styles.statusBadge, statusStyles.background]}>
                    <View style={[styles.statusDot, statusStyles.dot]} />
                    <Text style={[styles.statusText, statusStyles.text]}>
                        {renderStatus(item?.user?.kycStatus)}
                    </Text>
                </View>
            </View>

            <View style={styles.userInfoWrapper}>
                <Text style={styles.name}>{item?.user?.name}</Text>
                <Text
                    style={styles.email}
                    numberOfLines={1}
                >
                    {item?.user?.email}
                </Text>
            </View>
            <Text style={styles.type}>
                {item?.referralUsesType === "InvestorSignup" ? "Investor" : "Asset Owner"}
            </Text>

            {item?.referralUsesType === "AssetOwnerSignup" && (
                <View style={styles.propertyWrapper}>
                    {colors.isLight ? (
                        <BuildingLight width={16} height={16} />
                    ) : (
                        <Building width={16} height={16} />
                    )}
                    <Text style={styles.property}>
                        {item?.referredPropertyInvited?.propertyDetails?.assetTitle}
                    </Text>
                </View>
            )}

            <View style={styles.cardFooter}>
                {item?.referralUsesType === "AssetOwnerSignup" && (
                    <View style={[
                        styles.detailWrapper,
                        styles.kycWrapper,
                        leadStatusStyles.background,
                    ]}>

                        {leadStatusStyles.icon}
                        <Text style={[styles.kycStatus, leadStatusStyles.text]}>
                            {item?.referredPropertyInvited?.adminStatus}
                        </Text>
                    </View>
                )}
                <View style={[styles.detailWrapper, styles.lastActionWrapper]}>
                    <Text style={styles.lastAction}>Last Action - {timeAgo(item?.updatedAt)}</Text>
                </View>
            </View>

            <ButtonPrimary
                title={ButtonTextTypes.View_Details}
                width={ButtonWidthTypes.Full}
                align={ButtonAlignTypes.Center}
                buttonStyle={styles.viewDetails}
                textStyle={styles.viewDetailsText}
                disabled={item?.user?.kycStatus === null}
                style={{ marginTop: 20 }}
                onPress={openDetailPage}
            />
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.background.default,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#75757566",
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 12,
        marginHorizontal: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    hofId: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
    },
    statusBadge: {
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        height: 28,
        flexDirection: 'row',
        columnGap: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 20,
        backgroundColor: colors.background.green,
    },
    statusText: {
        color: colors.text.green,
        fontSize: 14,
        fontFamily: "WorkSans-Medium",
    },
    userInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    name: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: "Inter-Medium",
    },
    email: {
        color: colors.text.extraLight,
        fontSize: 10,
        fontFamily: "WorkSans-Regular",
    },
    type: {
        color: colors.text.extraLight,
        fontFamily: 'WorkSans-Medium',
        fontSize: 10,
    },
    propertyWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
        marginTop: 12,
    },
    property: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: "WorkSans-SemiBold",
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 12,
        marginTop: 16,
    },
    detailWrapper: {
        height: 24,
        borderWidth: 0.8,
        paddingHorizontal: 8,
        justifyContent: 'center',
        borderRadius: 2,
    },
    kycWrapper: {
        borderColor: colors.border.green,
        backgroundColor: '#33BD561A',
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    lastActionWrapper: {
        borderColor: colors.border.lightGrey,
        backgroundColor: '#F03F231A',
    },
    kycStatus: {
        color: colors.text.green,
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
    },
    lastAction: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
    },
    readyBackground: {
        backgroundColor: '#33BD561F',
        borderColor: '#33BD5699',
    },
    blockedBackground: {
        backgroundColor: '#F03F231F',
        borderColor: '#F03F23',
    },
    kycBackground: {
        backgroundColor: '#E56B001F',
        borderColor: '#E56B0099',
    },
    readyDot: {
        backgroundColor: colors.background.green,
    },
    blockedDot: {
        backgroundColor: colors.text.danger,
    },
    kycDot: {
        backgroundColor: '#E56B00',
    },
    readyText: {
        color: colors.text.green,
    },
    blockedText: {
        color: colors.text.danger,
    },
    kycText: {
        color: '#E56B00',
    },
    viewDetails: {
        borderRadius: 4,
        height: 36,
    },
    viewDetailsText: {
        fontSize: 14,
    },
});

export default LeadCard;