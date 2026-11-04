import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) =>
    StyleSheet.create({
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
            rowGap: 16,
            paddingVertical: 10,
        },
        totalCard: {
            flex: 1,
            height: 75,
            marginHorizontal: 16,
            borderRadius: 4,
            paddingHorizontal: 16,
            justifyContent: "space-between",
            flexDirection: 'row',
            alignItems: 'center',
        },
        totalTitle: {
            color: colors.constant.white,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        totalValue: {
            color: colors.constant.white,
            fontSize: 16,
            fontFamily: 'WorkSans-Medium',
            marginRight: 6,
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
        row: {
            flexDirection: "row",
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 16,
        },
        statWrapper: { rowGap: 16 },
        statCard: {
            backgroundColor: colors.background.slightly,
            borderRadius: 4,
            height: 114,
            width: '48%',
            borderWidth: 1,
            borderColor: '#F5F5F533',
            rowGap: 4,
            justifyContent: 'center',
            paddingHorizontal: 14,
        },
        statFilterWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 4,
            alignSelf: 'flex-start',
        },
        statLabel: {
            color: colors.text.lightGrey,
            fontSize: 10,
            fontFamily: 'WorkSans-Regular',
        },
        statTitle: {
            color: colors.text.default,
            fontSize: 13,
            fontFamily: 'WorkSans-Regular',
        },
        statValue: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
        },
        positiveBadge: {
            alignSelf: "flex-start",
        },
        negativeBadge: {
            alignSelf: "flex-start",
            backgroundColor: '#F03F2329',
        },
        negativeText: {
            color: colors.text.danger,
        },
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
            backgroundColor: "#020910",
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
            height: 1,
            backgroundColor: "#F5F5F533",
            marginVertical: 8,
        },
        incomeBottomRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
        },
        incomeLabel: {
            color: "#F5F5F5B2",
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
        },
        residentNegativeText: {
            color: colors.text.danger,
            fontSize: 16,
        },
        residentPositiveText: {
            fontSize: 16,
        },
        noticeWrapper: {
            backgroundColor: colors.background.slightly,
            minHeight: 400,
            borderRadius: 4,
            marginHorizontal: 16,
        },
        noticeHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#333E4A',
        },
        noticeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 8,
        },
        noticeTitle: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
        },
        filterWrapper: {
            backgroundColor: colors.background.slightly,
            borderRadius: 4,
            borderWidth: 0.5,
            borderColor: colors.isLight ? colors.border.divider : '#EFEFEF33',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: 8,
            paddingHorizontal: 16,
        },
        sliderRotate: {
            transform: [{ rotate: '270deg' }],
        },
        filterText: {
            color: colors.text.default,
            fontFamily: 'WorkSans-Regular',
            fontSize: 14,
            lineHeight: 24,
        },
        noticeContent: {
            flex: 1,
            padding: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyNotice: {
            color: colors.text.lightGrey,
            fontSize: 16,
            fontFamily: 'WorkSans-Regular',
        },
    });