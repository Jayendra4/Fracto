import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background.main,
    },
    container: {
        flex: 1,
        paddingTop: 10,
        rowGap: 16,
    },
    editWrapper: {
        marginHorizontal: 16,
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    editText: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    cancelText: {
        color: colors.text.extraLight,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    referralWrapper: {
        alignItems: 'flex-start',
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 1,
    },
    copy: { paddingHorizontal: 5 },
    referTitle: {
        color: colors.text.default,
        fontSize: 9,
        fontFamily: 'WorkSans-Regular',
    },
    referCode: {
        color: colors.text.default,
        fontSize: 11,
        fontFamily: 'WorkSans-Medium',
    },
    profileWrapper: {
        alignItems: 'center',
        marginTop: 20,
    },
    profile: {
        position: 'relative',
        marginBottom: 16,
        width: 94,
        height: 94,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageWrapper: {
        width: 94,
        height: 94,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.border.lightGrey,
        overflow: 'hidden',
    },
    profileImage: {
        width: 94,
        height: 94,
        borderRadius: 100,
    },
    camera: {
        position: 'absolute',
        bottom: -14,
        right: -6,
    },
    username: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        fontSize: 24,
        textAlign: 'center',
    },
    input: {
        rowGap: 16,
        marginBottom: 18,
        flex: 1,
        marginHorizontal: 16,
    },
    inputField: {
        borderColor: '#979797',
    },
    inputLabel: {
        fontSize: 14,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    changePasswordBtn: {
        alignSelf: 'flex-end',
    },
})