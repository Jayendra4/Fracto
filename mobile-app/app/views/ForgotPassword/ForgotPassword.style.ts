import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    container: {
        flex: 1,
        paddingTop: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 40,
        position: 'relative',
        marginHorizontal: 24,
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
        marginHorizontal: 24,
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
    animatedTabs: {
        marginHorizontal: 16,
        marginBottom: 30,
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
    inputs: {
        flex: 1,
        marginHorizontal: 24,
        rowGap: 16,
    },
});