import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    container: {
        flex: 1,
        rowGap: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 30,
        position: 'relative',
        marginHorizontal: 24,
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
        color: colors.text.default,
        fontSize: 24,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
        verticalAlign: 'middle',
    },
    emailInfo: {
        color: colors.text.lightGrey,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
        verticalAlign: 'middle',
        textAlign: 'center',
        maxWidth: '85%',
    },
    selectContainer: {
        justifyContent: 'center',
        marginBottom: 60,
    },
    selectTitle: {
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        textAlign: 'center',
    },
    selectSubTitle: {
        maxWidth: '75%',
    },
    typesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
    },
    typeWrapper: {
        height: 170,
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#4F86C04D",
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeWrapper: {
        borderColor: colors.border.primary,
    },
    typeButton: {
        height: 32,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
        borderRadius: 8,
        marginTop: 30,
        justifyContent: 'center',
        alignSelf: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.text.primary,
    },
    typeTitle: {
        color: colors.text.primary,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    typeButtonActive: {
        backgroundColor: colors.text.primary,
        borderWidth: 0,
    },
    typeTitleActive: {
        color: colors.constant.white,
    },
    continueButton: {
        marginHorizontal: 16,
        marginTop: 'auto',
        marginBottom: 16,
    },
})