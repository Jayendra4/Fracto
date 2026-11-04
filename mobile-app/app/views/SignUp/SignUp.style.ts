import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
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
        marginBottom: 30,
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
        marginBottom: 14,
    },
    title: {
        color: colors.text.title,
        fontSize: 24,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
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
    inputs: {
        flex: 1,
        rowGap: 20,
        marginBottom: 18,
    },
    bottomContainer: {
        marginTop: "auto",
        paddingTop: 16,
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
})