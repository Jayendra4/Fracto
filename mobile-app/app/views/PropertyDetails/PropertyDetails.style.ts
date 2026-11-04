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
        pillWrapper: {
            flexDirection: "row",
            flexWrap: 'wrap',
            gap: 12,
            marginHorizontal: 16,
            marginTop: 10,
        },
        pill: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
        },
        text: {
            fontSize: 12,
            fontFamily: 'WorkSans-Medium',
        },
        verified: {
            borderColor: colors.border.green,
            backgroundColor: "#33BD5629",
        },
        verifiedText: {
            color: colors.text.green,
        },
        open: {
            borderColor: colors.border.yellow,
            backgroundColor: '#FFB81629',
        },
        openText: {
            color: colors.text.yellow,
        },
        tokenized: {
            borderColor: colors.border.danger,
            backgroundColor: '#F03F2329',
        },
        tokenizedText: {
            color: colors.text.danger,
        },
        mainWrapper: {
            marginHorizontal: 16,
            marginTop: 6,
        },
        card: {
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 8,
            backgroundColor: colors.background.darkBlue,
        },
        location: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 6,
            marginBottom: 4,
        },
        locationText: {
            color: colors.text.yellow,
            fontSize: 11,
            fontFamily: 'WorkSans-Regular',
        },
        title: {
            color: colors.text.default,
            fontSize: 20,
            fontFamily: 'WorkSans-Medium',
            marginBottom: 16,
        },
        priceRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        priceLabel: {
            color: colors.isLight ? colors.text.lightGrey : "#C2C2C2",
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        priceValue: {
            color: colors.text.default,
            fontSize: 24,
            fontFamily: 'WorkSans-SemiBold',
        },
        progressContainer: {
            marginTop: 12,
        },
        progressTrack: {
            height: 8,
            backgroundColor: colors.constant.white,
            borderRadius: 8,
            overflow: "hidden",
        },
        progressFill: {
            width: "64%",
            height: "100%",
            backgroundColor: colors.border.green,
            borderRadius: 8,
        },
        progressText: {
            color: colors.text.default,
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
        },
        cardDivider: {
            height: 1,
            backgroundColor: colors.border.lightGrey,
            marginVertical: 14,
        },
        bottomRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        normalText: {
            color: colors.text.default,
            fontFamily: 'WorkSans-Regular',
            fontSize: 12,
            marginBottom: 4,
        },
        greenText: {
            color: colors.text.green,
            fontFamily: 'WorkSans-Medium',
        },
        buyButtonStyle: {
            height: 38,
            borderRadius: 4,
            width: 147,
            alignSelf: 'flex-end',
        },
        buyTextStyles: {
            fontSize: 14,
        },
        divider: {
            height: 0.6,
            backgroundColor: "#555555",
            marginVertical: 20,
            marginHorizontal: 16,
        },
        descriptionWrapper: {
            marginHorizontal: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
            columnGap: 8,
        },
        descriptionTitle: {
            fontSize: 16,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.default,
        },
        descriptionTextWrapper: {
            rowGap: 16,
        },
        description: {
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
            lineHeight: 17,
            color: colors.isLight ? colors.text.lightGrey : "#ACACAC",
        },
        readMore: {
            color: colors.text.yellow,
            fontFamily: 'WorkSans-Regular',
            fontSize: 12,
            textDecorationLine: 'underline',
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: 10,
            rowGap: 13,
        },
        investCard: {
            width: '48%',
            borderRadius: 6,
            padding: 10,
            borderWidth: colors.isLight ? 0.5 : 1,
            borderColor: '#424242',
            backgroundColor: colors.isLight ? colors.background.darkBlue : '#05172A',
        },
        investTitle: {
            fontSize: 15,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.default,
            marginTop: 8,
        },
        investDescription: {
            fontSize: 10,
            lineHeight: 16,
            color: colors.text.lightGrey,
            fontFamily: 'WorkSans-Regular',
            marginTop: 6,
        },
        barContainer: {
            flexDirection: "row",
            backgroundColor: colors.background.darkBlue,
            borderRadius: 4,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 16,
            marginHorizontal: 16,
        },
        item: {
            flex: 1,
            alignItems: "center",
            position: "relative",
        },
        row: {
            flexDirection: "row",
            alignItems: "flex-start",
        },
        dot: {
            width: 10,
            height: 10,
            borderRadius: 10,
            marginRight: 6,
            marginTop: 3,
        },
        label: {
            color: colors.text.default,
            fontSize: 10,
            fontFamily: 'WorkSans-Regular',
        },
        value: {
            color: colors.text.default,
            fontSize: 10,
            fontFamily: 'WorkSans-Medium',
            textAlign: 'center',
            marginTop: 2,
        },
        soldOutText: {
            textAlign: 'center',
            marginTop: 6,
            fontSize: 12,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.danger,
            opacity: 0.6,
        },
    });