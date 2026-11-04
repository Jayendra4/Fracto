import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    container: {
        flex: 1,
        paddingTop: 10,
        rowGap: 16,
    },
    scrollContainer: {
        rowGap: 30,
        paddingVertical: 10,
    },
    spaceHorizontal: {
        marginHorizontal: 16,
        backgroundColor: colors.background.slightly,
        paddingVertical: 12,
        borderRadius: 10,
    },
    propertyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 12,
        marginHorizontal: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: colors.background.default,
    },
    propertyImage: {
        height: 114,
        width: 138,
        borderRadius: 4,
        overflow: "hidden",
    },
    propertyTitle: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    shrink: {
        flexShrink: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 2,
        marginTop: 6,
    },
    cardlocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 2,
    },
    propertyLocation: {
        color: colors.text.lightGrey,
        fontSize: 10,
        fontFamily: 'WorkSans-Medium',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border.lightGrey,
        marginVertical: 10,
    },
    divider2: {
        marginHorizontal: 10,
        marginBottom: 30,
    },
    divider3: {
        marginVertical: 3,
    },
    fractionDivider: { marginVertical: 16, marginHorizontal: 10 },
    glassHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.5)', // 👈 glass shine
    },
    cardInfoWrapper: {
        rowGap: 4,
    },
    infoRowWrapper: {
        rowGap: 6,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: 'center',
        columnGap: 6,
    },
    infoLabel: {
        color: colors.text.lightGrey,
        fontSize: 13,
        fontFamily: 'WorkSans-Regular',
        flexShrink: 1,
    },
    infoValue: {
        color: colors.text.default,
        fontSize: 13,
        fontFamily: 'WorkSans-Regular',
    },
    section: {
        rowGap: 8,
        marginTop: 24,
        paddingHorizontal: 10,
    },
    sectionLabel: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    required: {
        color: colors.text.danger,
    },
    counter: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: colors.isLight ? 0.6 : 1.6,
        borderColor: colors.border.default,
        borderRadius: 6,
        paddingLeft: 16,
        height: 48,
        overflow: "hidden",
        backgroundColor: colors.isLight
            ? colors.background.surface
            : colors.background.darkBlue,
    },
    units: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
    },
    buyInput: {
        flex: 1,
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
    },
    counterButtonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    verticalDivider: {
        backgroundColor: colors.border.lightGrey,
        width: 1,
        height: 28,
    },
    counterButton: {
        padding: 12,
    },
    counterValue: {
        flex: 1,
        textAlign: "center",
        color: colors.text.primary,
        fontSize: 16,
    },
    totalFractionsWrapper: {
        marginTop: 10,
    },
    maxWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 12,
        flexShrink: 1,
    },
    maxText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: colors.text.primary,
        textDecorationLine: 'underline',
    },
    summaryWrapper: {
        rowGap: 10,
        paddingHorizontal: 10,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        columnGap: 18,
    },
    summaryLabel: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
        flexShrink: 0,
    },
    summaryValue: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    summarySub: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        marginTop: 4,
    },
    allowShrink: {
        flexShrink: 1,
    },
    errorText: {
        color: colors.text.danger,
        fontSize: 13,
        fontFamily: 'WorkSans-Medium',
    },
    termsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    termsTitle: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
        marginLeft: 14,
    },
    termsLink: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
        color: "#2F5BCC",
        textDecorationLine: 'underline',
    },
    paymentMethodWrapper: {
        marginTop: 16,
        rowGap: 4,
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    paymentLabel: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    mutedText: {
        color: colors.text.muted,
    },
    buttonsWrapper: {
        paddingHorizontal: 10,
        marginTop: 8,
        rowGap: 14,
    },
    confirmButton: {
        borderRadius: 4,
    },
    buttonText: {
        fontSize: 16,
    },
    backButton: {
        borderRadius: 4,
        borderColor: "#4F86C0",
    },
    listing: {
        rowGap: 20,
        paddingHorizontal: 6,
    },
    recommendedTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        paddingHorizontal: 10,
    },
    recommendedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background.default,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        columnGap: 12,
        overflow: "hidden",
    },
    recommendedImage: {
        height: 175,
        width: 150,
        borderRadius: 4,
    },
    recommendedContent: {
        flex: 1,
        rowGap: 6,
    },
    cardTitle: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    detailsButton: {
        marginTop: 6,
        borderRadius: 4,
        height: 28,
    },
    detailsButtonText: {
        fontSize: 12,
    },
    emptyWrapper: {
        alignItems: 'center',
        paddingBottom: 16,
    },
    emptyText: {
        color: colors.text.lightGrey,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },

    promoWrapper: {
        marginVertical: 20,
        marginHorizontal: 8,
    },
    promoTitle: {
        color: colors.text.default,
        fontSize: 14,
        marginBottom: 10,
        fontFamily: "WorkSans-Medium",
    },

    promoInputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
    },

    inputContainer: {
        flex: 1,
    },

    applyButton: {
        height: 48,
        width: 75,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background.primary,
        borderRadius: 8,
    },

    applyText: {
        color: "#fff",
        fontFamily: "WorkSans-Medium",
    },
    promoHint: {
        color: colors.text.muted,
        marginTop: 4,
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
    },

    modalOverlay: {
        flex: 1,
        marginTop: 10,
        backgroundColor: colors.isLight
            ? "rgba(0, 0, 0, 0)"
            : "rgba(0, 0, 0, 0)",
        justifyContent: "center",
        alignItems: "center",
    },

    couponCard: {
        width: "100%",
        backgroundColor: "#1a944738",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 0.5,
        borderColor: colors.success.primary,
    },

    couponTitle: {
        color: colors.success.primary,
        fontSize: 18,
        fontFamily: "WorkSans-Medium",
        flexShrink: 1,
        marginRight: 6,
    },

    couponRedeem: {
        color: colors.success.primary,
    },

    mDivider: {
        height: 1,
        backgroundColor: "#22c55e58",
        marginVertical: 10,
    },
    couponTop: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    savedBadge: {
        backgroundColor: colors.success.primary + "20",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },

    savedText: {
        color: colors.success.primary,
        fontFamily: "WorkSans-Medium",
        fontSize: 12,
    },

    couponDetails: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: 'wrap',
        justifyContent: "space-between",
        rowGap: 4,
        columnGap: 6,
    },

    detailText: {
        color: colors.text.green,
        fontFamily: "WorkSans-Regular",
        fontSize: 12,
    },

    validText: {
        marginTop: 4,
        color: colors.text.green,
        fontFamily: "WorkSans-Regular",
        fontSize: 12,
    },

    closeButton: {
        marginTop: 20,
        alignSelf: "center",
    },

    closeText: {
        color: colors.text.inverse,
        fontFamily: "WorkSans-Medium",
    },
    errorContainer: {
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "rgba(255,0,0,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,0,0,0.4)",
    },
    walletCard: {
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: colors.isLight
            ? colors.background.surface
            : colors.background.darkBlue,
        borderWidth: 1,
        borderColor: colors.border.lightGrey,
        justifyContent: "space-between",
        marginBottom: 18,
    },

    innerWallet: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },

    walletTitle: {
        color: colors.text.muted,
        fontSize: 14,
        fontFamily: "WorkSans-Regular",
    },

    walletAmount: {
        fontSize: 22,
        color: colors.text.default,
        fontFamily: "WorkSans-Medium",
        marginTop: 6
    },

    shortfallBadge: {
        backgroundColor: colors.text.danger + "15",
        borderColor: colors.text.danger,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        flexShrink: 1,
        marginLeft: 18,
    },

    shortfallText: {
        color: colors.text.danger,
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
    },

    dottedDivider: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 16,
    },

    dot: {
        width: 6,
        height: 1,
        borderRadius: 2,
        backgroundColor: colors.border.divider,
    },

    discountRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    discount: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    discountLab: {
        color: colors.success.primary,
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
    },

    discountTag: {
        backgroundColor: colors.success.primary + "15",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },

    discountTagText: {
        color: colors.success.primary,
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
    },
})