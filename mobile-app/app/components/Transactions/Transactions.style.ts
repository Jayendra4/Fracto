import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.background.darkBlue,
            borderRadius: 5,
            marginHorizontal: 16,
            padding: 16,
        },
        titleWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        header: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
        },
        seeAll: {
            height: 20,
            borderRadius: 4,
            paddingHorizontal: 8,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.text.primary,
        },
        seeAllText: {
            color: colors.constant.white,
            fontSize: 10,
            fontFamily: 'WorkSans-Medium',
        },
        card: {
            flexDirection: "row",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: '#6D96C0',
            borderRadius: 6,
            paddingVertical: 12,
            paddingHorizontal: 10,
            backgroundColor: colors.isLight ? colors.constant.white : '#02091099',
        },
        left: {
            flex: 1,
        },
        right: {
            alignItems: "flex-end",
        },
        title: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-Regular',
        },
        subText: {
            color: colors.text.lightGrey,
            fontSize: 10,
            marginTop: 2,
            fontFamily: 'WorkSans-Regular',
        },
        amount: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        statusBadge: {
            marginTop: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 4,
            borderWidth: 1,
        },
        approved: {
            borderColor: colors.border.green,
            backgroundColor: colors.isLight ? colors.constant.white : "#061F0C",
        },
        rejected: {
            borderColor: colors.border.danger,
            backgroundColor: colors.isLight ? colors.constant.white : "#120503",
        },
        pending: {
            borderColor: colors.border.yellow,
            backgroundColor: colors.isLight ? colors.constant.white : "#161000ff",
        },
        statusText: {
            fontSize: 10,
            fontFamily: 'WorkSans-Medium',
        },
        approvedText: {
            color: colors.text.green,
        },
        rejectedText: {
            color: colors.text.danger,
        },
        pendingText: {
            color: colors.text.yellow,
        },
        separator: {
            height: 16,
        },
        emptyContainer: {
            flex: 1,
        },
        emptyText: {
            color: colors.text.lightGrey,
            fontFamily: 'WorkSans-Medium',
            fontSize: 18,
        },
        dropdownTrigger: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginLeft: 'auto',
        },
        filterText: {
            color: colors.text.default,
            fontSize: 13,
            fontFamily: 'WorkSans-Regular',
            lineHeight: 20,
            marginBottom: 2,
        },
    });
