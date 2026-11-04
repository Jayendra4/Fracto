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
            flexGrow: 1,
            rowGap: 24,
            backgroundColor: colors.background.slightly,
            paddingVertical: 24,
        },
        infoWrapper: {
            rowGap: 10,
            alignItems: 'center',
        },
        profileBox: {
            width: 64,
            height: 64,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        avatar: {
            width: 64,
            height: 64,
            borderRadius: 100,
        },
        userName: {
            color: colors.text.default,
            fontSize: 20,
            fontFamily: 'WorkSans-Regular',
            textAlign: 'center',
        },
        userId: {
            color: colors.text.extraLight,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
            textAlign: 'center',
        },
        detailsWrapper: {
            backgroundColor: colors.background.default,
            borderWidth: 1,
            borderColor: colors.border.lightGrey,
            marginHorizontal: 16,
            borderRadius: 10,
            padding: 16,
            rowGap: 16,
        },
        detailsTitle: {
            color: colors.text.default,
            fontSize: 20,
            fontFamily: 'WorkSans-Medium',
        },
        divider: {
            height: 1.4,
            backgroundColor: colors.isLight ? colors.background.darkBlue : '#F5F5F533',
        },
        horizontalSpace: {
            marginHorizontal: 16,
        },
        infoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 10,
        },
        label: {
            color: colors.text.extraLight,
            fontSize: 16,
            fontFamily: 'WorkSans-Regular',
        },
        value: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-Medium',
        },
        viewMore: {
            color: colors.text.primary,
            fontSize: 16,
            fontFamily: 'WorkSans-Regular',
        },
        investmentWrapper: {
            marginHorizontal: 16,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionTitle: {
            fontSize: 20,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.default,
        },
        seeAll: {
            fontSize: 14,
            color: colors.text.primary,
            fontFamily: 'WorkSans-Regular',
        },
        cardWrapper: {
            rowGap: 16,
        },
        card: {
            borderRadius: 10,
            paddingVertical: 9,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: '#F5F5F533',
        },
        cardTitle: {
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
            color: colors.text.default,
            marginBottom: 3,
        },
        cardSub: {
            fontSize: 12,
            color: '#F5F5F5B2',
            fontFamily: 'WorkSans-Regular',
        },
        complianceWrapper: {
            marginHorizontal: 16,
        },
        complianceCard: {
            rowGap: 16,
        },
        complianceItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderWidth: 1,
            borderColor: "#F5F5F533",
            padding: 12,
            borderRadius: 10,
        },
        statusIconWrapper: {
            width: 28,
            height: 28,
            borderRadius: 4,
            backgroundColor: '#E56B001F',
            marginRight: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        itemLeft: {
            flex: 1,
            paddingRight: 12,
        },
        itemTitle: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
        },
        itemSub: {
            color: colors.text.extraLight,
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
            marginTop: 2,
        },
        statusDot: {
            width: 6,
            height: 6,
            borderRadius: 20,
            backgroundColor: colors.background.green,
        },
        statusBadge: {
            paddingHorizontal: 7,
            borderRadius: 4,
            flexDirection: 'row',
            columnGap: 6,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: 22,
        },
        statusText: {
            fontSize: 12,
            fontFamily: 'WorkSans-Medium',
        },
        pendingBackground: {
            backgroundColor: '#E56B001F',
            borderColor: '#E56B0099',
        },
        completedBackground: {
            backgroundColor: '#33BD561F',
            borderColor: '#33BD5699',
        },
        pendingDot: {
            backgroundColor: "#E56B00",
        },
        completedDot: {
            backgroundColor: colors.text.green,
        },
        pendingText: {
            color: "#E56B00",
        },
        completedText: {
            color: colors.text.green,
        },
    });