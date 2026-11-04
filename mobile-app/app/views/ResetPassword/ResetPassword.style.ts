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
        rowGap: 6,
        marginBottom: 30,
    },
    title: {
        color: colors.text.title,
        fontSize: 24,
        fontFamily: 'WorkSans-Medium',
        verticalAlign: 'middle',
    },
    emailInfo: {
        color: colors.text.subTitle,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
        verticalAlign: 'middle',
        textAlign: 'center',
        maxWidth: '85%',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
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
        borderColor: error ? colors.danger.default : colors.border.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusStick: {
        height: 18,
    },
    timerWrapper: {
        width: '90%',
        marginTop: 12,
        alignItems: 'flex-end',
        alignSelf: 'center',
    },
    timer: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
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
    errorWrapper: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    errorText: {
        fontSize: 16,
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
        textAlign: 'center',
    },
    errordiff: {
        color: colors.danger.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    inputs: {
        rowGap: 20,
        marginBottom: 18,
    },
});