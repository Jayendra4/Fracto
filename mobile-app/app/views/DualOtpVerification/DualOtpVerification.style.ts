import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors, error: boolean) => StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 40,
        position: 'relative',
    },
    goBack: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    logo: {
        resizeMode: 'contain',
        flexGrow: 1,
        alignItems: 'center',
    },
    details: {
        alignItems: 'center',
        rowGap: 14,
        marginBottom: 30,
    },
    title: {
        color: colors.text.title,
        fontSize: 24,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 28,
        verticalAlign: 'middle',
    },
    emailInfo: {
        color: colors.text.subTitle,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
        verticalAlign: 'middle',
        textAlign: 'center',
    },
    bottomContainer: {
        marginTop: 'auto',
        rowGap: 18,
        marginBottom: 16,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signupText: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
    },
    signupLink: {
        color: colors.text.link,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    verfication: {
        rowGap: 30,
        justifyContent: 'space-between',
        flex: 1,
        marginBottom: 30,
    },
    emailVerfiyWrapper: {
        alignItems: 'flex-start',
        rowGap: 6,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        alignSelf: 'flex-start',
        marginTop: 20,
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
        borderColor: error ? colors.danger.default : colors.border.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusStick: {
        height: 18,
    },
    otpResendWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    timerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    timer: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    dontReceive: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    resendLink: {
        color: colors.text.primary,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    errorWrapper: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    errorText: {
        fontSize: 16,
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
    },
    errordiff: {
        color: colors.danger.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
})