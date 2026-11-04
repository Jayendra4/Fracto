import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    incomeContainer: {
        backgroundColor: colors.background.slightly,
        borderRadius: 4,
        paddingVertical: 16,
        marginHorizontal: 16,
    },
    incomeHeader: {
        paddingHorizontal: 16,
    },
    incomeMeta: {
        color: colors.text.lightGrey,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    incomeHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        columnGap: 20,
    },
    incomeTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    incomeTotal: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        flexShrink: 1,
    },
    divider: {
        height: 1.5,
        backgroundColor: "#F5F5F533",
        marginVertical: 24,
    },
    incomePositiveBadge: {
        alignSelf: "flex-start",
        marginTop: 6,
        height: 27,
        paddingHorizontal: 10,
        columnGap: 8,
    },
    incomeGrowthText: {
        fontSize: 20,
    },
    incomeCard: {
        backgroundColor: colors.background.default,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F5F5F533",
        marginHorizontal: 16,
    },
    incomeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 10,
    },
    propertyName: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-SemiBold',
        flexShrink: 1,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 4,
    },
    locationText: {
        color: colors.text.lightGrey,
        fontSize: 8,
        fontFamily: 'WorkSans-Medium',
    },
    dividerSmall: {
        height: colors.isLight ? 0.5 : 1,
        backgroundColor: colors.border.divider,
        marginVertical: 8,
    },
    incomeBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    incomeLabel: {
        color: colors.text.extraLight,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    incomeAmount: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        marginRight: 10,
    },
    residentPositiveBadge: {
        height: 23,
        paddingHorizontal: 10,
    },
    residentNegativeBadge: {
        height: 23,
        paddingHorizontal: 10,
        backgroundColor: "#F03F2329",
    },
    residentNegativeText: {
        color: colors.text.danger,
        fontSize: 16,
    },
    residentPositiveText: {
        fontSize: 16,
    },
    growthBadge: {
        backgroundColor: "#33BD5629",
        paddingHorizontal: 6,
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 4,
    },
    growthText: {
        color: colors.text.green,
        fontSize: 11,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
})