import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background.main,
    },
    container: {
        flex: 1,
        paddingBottom: 10,
        rowGap: 16,
    },
    imageBackground: {
        height: 158,
        justifyContent: 'flex-start',
        paddingTop: 10,
    },
    referralWrapper: {
        position: "absolute",
        bottom: 3,
        right: 8,
        alignItems: 'flex-end',
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
    brokerInformation: {
        rowGap: 10,
        marginHorizontal: 16,
        marginTop: -70,
    },
    editWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
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
        color: "#73B7FF",
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    profileWrapper: {
        alignItems: 'center',
    },
    profile: {
        position: 'relative',
        marginBottom: 16,
        width: 100,
        height: 100,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 100,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.border.lightGrey,
        overflow: 'hidden',
    },
    profileImage: {
        width: 100,
        height: 100,
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
        fontSize: 20,
        textAlign: 'center',
    },
    brokerProfile: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.extraLight,
    },
    certifiedWrapper: {
        height: 36,
        backgroundColor: '#33BD561F',
        borderRadius: 4,
        flexDirection: 'row',
        columnGap: 10,
        justifyContent: 'center',
        marginHorizontal: 16,
        alignItems: 'center',
    },
    certifiedText: {
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
        color: colors.text.green,
    },
    performanceWrapper: {
        alignItems: 'center',
        rowGap: 10,
        marginBottom: 10,
    },
    overviewText: {
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.lightGrey,
    },
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 10,
    },
    overviewBox: {
        height: 61,
        backgroundColor: colors.background.darkBlue,
        borderWidth: 1,
        borderColor: '#F5F5F533',
        width: '29%',
        borderRadius: 6,
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 6,
        justifyContent: 'space-between',
    },
    overviewTitle: {
        color: colors.text.extraLight,
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
    },
    overviewValue: {
        color: colors.text.default,
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 16,
    },
    spaceHorizontal: {
        marginHorizontal: 16,
    },
    divider: {
        height: colors.isLight ? 0.5 : 1.4,
        backgroundColor: colors.border.divider,
        marginVertical: 16,
    },
    inputsMainWrapper: {
        rowGap: 10,
    },
    inputsWrapper: {
        borderWidth: colors.isLight ? 0.5 : 1.4,
        borderColor: colors.isLight ? colors.border.divider : '#F5F5F51A',
        borderRadius: 16,
        marginTop: 10,
        marginHorizontal: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    basicInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    basicTitle: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    cancelText: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
    },
    input: {
        rowGap: 16,
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
    label: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
        marginBottom: 10,
        color: colors.text.default,
    },
    checkIcon: {
        color: colors.icon.green,
    },
    verfiyWrapper: {
        backgroundColor: '#33BD5621',
        borderWidth: 1,
        borderColor: '#33BD564D',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
        borderRadius: 6,
        paddingHorizontal: 16,
    },
    verifyText: {
        color: colors.text.green,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    pendingIcon: {
        color: "#E56B00",
    },
    pendingWrapper: {
        backgroundColor: "#E56B001F",
        borderColor: "#E56B00",
    },
    pendingText: {
        color: "#E56B00",
    },
    emptyLicense: {
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.lightGrey,
        textAlign: "center",
    }
})