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
    moneyWrapper: {
        backgroundColor: colors.background.slightly,
        borderRadius: 8,
        marginHorizontal: 16,
        padding: 16,
        paddingVertical: 24,
    },
    header: {
        alignItems: "flex-start",
    },
    title: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    subtitle: {
        fontSize: 10,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Regular',
    },
    divider: {
        width: '100%',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#343F4B',
        marginVertical: 10,
    },
    labelInput: {
        fontFamily: 'WorkSans-Medium',
        fontSize: 16,
        color: colors.text.default,
        marginBottom: 6,
    },
    inputField: {
        borderWidth: 0.8,
        height: 40,
        borderRadius: 3,
    },
    inputText: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 13,
    },
    inputs: {
        marginTop: 16,
    },
    defaultAmountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20,
        marginTop: 16,
    },
    amount: {
        height: 30,
        minWidth: 70,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    selectedAmount: {
        backgroundColor: '#F5F5F529',
        borderColor: colors.border.primary,
    },
    deselectedAmount: {
        backgroundColor: '#F5F5F50F',
        borderColor: colors.isLight ? colors.border.divider : '#F5F5F566',
    },
    amountText: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
    },
    paymentMode: {
        rowGap: 12,
    },
    radioRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: colors.isLight ? 0.6 : 1,
        borderColor: colors.isLight ? colors.border.divider : "#F5F5F533",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: colors.isLight
            ? colors.background.surface
            : "transparent",
    },
    radio: {
        width: 14,
        height: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.isLight ? colors.text.muted : "#9AA4AE",
        marginRight: 12,
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: colors.isLight ? '#4F86C0' : colors.constant.white,
        width: 16,
        height: 16,
    },
    innerRadio: {
        width: 10,
        height: 10,
        backgroundColor: colors.isLight ? "#4F86C0" : colors.constant.white,
        borderWidth: colors.isLight ? 0 : 1,
        borderRadius: 10,
        borderColor: colors.border.slightly,
    },
    radioTitle: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
        color: colors.text.muted,
    },
    radioTitleSelected: {
        color: colors.text.default,
    },
    radioSubtitle: {
        fontSize: 12,
        color: colors.isLight ? colors.text.muted : "#8194A7",
        fontFamily: "WorkSans-Regular",
        marginTop: 4,
    },
    bankWrapper: {
        height: 50,
        borderWidth: 1,
        borderColor: "#4F86C0",
        backgroundColor: '#58a9ff1a',
        marginTop: 14,
        borderRadius: 6,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    bankName: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-SemiBold',
    },
    bankHolderName: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
    },
    buttonStyles: { marginTop: 10, height: 40 },
    textStyles: { fontSize: 16, },
    errorText: {
        fontSize: 12,
        marginTop: 6,
        color: colors.danger.default,
    },
    disabled: {
        opacity: 0.5,
    },
    addAccountText: {
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
        color: colors.text.primary,
        textDecorationLine: 'underline',
    },
    allowShrink: {
        flexShrink: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceWrapper: {
        marginTop: 6,
        rowGap: 2,
    },
    balance: {
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
        color: colors.text.primary,
    },
    withdrawAmount: {
        fontSize: 12,
        fontFamily: "WorkSans-Medium",
        color: colors.isLight ? colors.text.yellow : colors.text.darkYellow,
    },
    danger: {
        color: colors.text.danger,
    },
})