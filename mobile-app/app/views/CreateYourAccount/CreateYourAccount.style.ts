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
        rowGap: 14,
        marginBottom: 30,
        paddingHorizontal: 24,
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
    bottomContainer: {
        marginTop: 'auto',
        rowGap: 18,
        marginBottom: 16,
        paddingHorizontal: 24,
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
    typeRow: {
        rowGap: 30,
        paddingHorizontal: 16,
        marginTop: 20,
    },
    typeWrapper: {
        height: 64,
        backgroundColor: '#D9D9D9',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderColor: colors.border.primary,
    },
    typeLogoRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20,
    },
    typeLogoWrapper: {
        flex: 1,
        borderRadius: 6.25,
        backgroundColor: '#2A5A8D',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 7,
    },
    typeTitle: {
        color: colors.constant.white,
        fontFamily: 'WorkSans-Medium',
        fontSize: 20,
    },
    gradientBorder: {
        flex: 1,
        borderRadius: 7.5,
        padding: 1.25,
    },
})