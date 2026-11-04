import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors, otpError: boolean) => StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    container: {
        flex: 1,
        paddingTop: 80,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginHorizontal: 24,
    },
    animatedTabs: {
        marginHorizontal: 16,
        marginBottom: 30,
    },
    inputs: {
        rowGap: 20,
        marginBottom: 18,
        marginHorizontal: 24,
    },
    spaceHorizontal: {
        marginHorizontal: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    forgotText: {
        color: colors.text.primary,
        fontSize: 14,
        fontFamily: "WorkSans-Regular",
        lineHeight: 20,
        verticalAlign: 'middle',
    },
    primaryButton: {
        marginTop: 30,
    },
    loginButton: {
        marginTop: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 40,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 14,
        color: colors.text.default,
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
        verticalAlign: 'middle',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 24,
    },
    signupText: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
    },
    signupLink: {
        color: colors.text.link,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
        textDecorationLine: 'underline',
        textDecorationColor: colors.text.link,
        textDecorationStyle: 'solid',
    },
    resendLink: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignSelf: 'center',
    },
    pinCodeText: {
        color: colors.text.default,
        fontSize: 26,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
    },
    pinCodeContainer: {
        width: 36,
        height: 36,
        borderRadius: 6,
        borderWidth: 1.6,
        borderColor: otpError ? colors.danger.default : colors.border.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusStick: {
        height: 18,
    },
    otpTitle: {
        fontSize: 16,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        marginBottom: 6,
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        alignItems: 'center',
    },
    timerWrapper: {
        alignItems: 'flex-start',
        alignSelf: 'center',
    },
    timer: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
});