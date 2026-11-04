import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) =>
    StyleSheet.create({
        card: {
            backgroundColor: colors.background.default,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border.prime,
            marginHorizontal: 16,
        },
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
        },
        bankName: {
            color: colors.text.default,
            fontSize: 18,
            fontFamily: 'WorkSans-SemiBold',
            flexShrink: 1,
            marginRight: 6,
        },
        verifiedRow: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 4,
        },
        verified: {
            color: colors.text.green,
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
        },
        detail: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
            marginBottom: 4,
        },
        bottomRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
        },
        switchRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        statusText: {
            color: colors.text.primary,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        removeBtn: {
            backgroundColor: "#F03F2329",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: colors.border.danger,
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 0,
        },
        removeText: {
            color: colors.text.danger,
            fontSize: 12,
            fontFamily: 'WorkSans-Medium',
        },
    });