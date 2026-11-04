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
        titleWrapper: {
            marginHorizontal: 16,
            rowGap: 4,
        },
        title: {
            color: colors.text.default,
            fontFamily: 'WorkSans-SemiBold',
            fontSize: 20,
        },
        subTitle: {
            color: "#F5F5F5B2",
            fontFamily: 'WorkSans-Regular',
            fontSize: 11,
        },
        titleRowWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
            columnGap: 10,
        },
        cardTitleIcon: {
            width: 16,
            height: 16,
            borderRadius: 2,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.isLight ? colors.background.darkBlue : '#F5F5F529',
        },
        cardLabel: {
            fontSize: 14,
            color: colors.text.extraLight,
            fontFamily: "WorkSans-Medium",
        },
        amount: {
            fontSize: 24,
            color: colors.text.default,
            fontFamily: "WorkSans-Medium",
            marginTop: 12,
        },
        currency: {
            fontSize: 14,
            color: colors.text.lightGrey,
            fontFamily: "WorkSans-Regular",
        },
        cardValue: {
            fontSize: 16,
            color: colors.text.default,
            fontFamily: "WorkSans-Medium",
            marginTop: 12,
        },
        infoRow: {
            marginBottom: 12,
        },
        infoLabel: {
            fontSize: 14,
            color: colors.text.extraLight,
            marginBottom: 4,
            fontFamily: "WorkSans-Regular",
        },
        infoValue: {
            fontSize: 16,
            color: colors.text.default,
            fontFamily: "WorkSans-Medium",
        },
        card: {
            backgroundColor: colors.background.default,
            borderWidth: 1.4,
            borderColor: "#F5F5F51A",
            marginHorizontal: 16,
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 8,
        },
        infotitle: {
            fontSize: 20,
            fontFamily: "WorkSans-Regular",
            color: colors.text.default,
        },
    });