import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        rowGap: 26,
        marginTop: 10,
        paddingBottom: 16,
    },
    upperContent: {
        rowGap: 16,
    },
    balanceWrapper: {
        height: 164,
        borderRadius: 8,
        backgroundColor: '#14406E',
        borderWidth: colors.isLight ? 0 : 1,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        justifyContent: 'center',
        rowGap: 16,
        paddingBottom: 10,
        overflow: 'hidden',
    },
    title: {
        color: colors.isLight ? colors.text.mutedLight : '#A9A8A8',
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    balance: {
        color: colors.constant.white,
        fontSize: 32,
        fontFamily: 'WorkSans-Medium',
    },
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
    },
    buttonStyle: {
        height: 36,
        width: '90%',
        borderRadius: 3,
    },
    secondaryButtonStyle: {
        height: 36,
        width: '45%',
        borderRadius: 3,
        backgroundColor: colors.isLight ? "transparent" : '#2A5A8D33',
        borderColor: '#2A5A8D',
    },
    textStyle: {
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    secondaryTextStyle: {
        color: '#58A9FF',
    },
    pendingWrapper: {
        backgroundColor: colors.background.slightly,
        borderWidth: 1,
        borderColor: '#F5F5F51A',
        height: 185,
        marginHorizontal: 16,
        padding: 16,
    },
    pendingTitle: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.isLight ? colors.text.extraLight : '#A9A8A8',
    },
    pendingAmount: {
        color: colors.text.default,
        fontSize: 32,
        fontFamily: 'WorkSans-Medium',
        marginTop: 10,
    },
    pendingCount: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.isLight ? colors.text.extraLight : '#A9A8A8',
        marginTop: 'auto',
    },
    count: {
        color: colors.text.default,
    },
})