import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createstyles = (colors: Colors, error?: string, activateMini?: boolean) => StyleSheet.create({
    label: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
        marginBottom: 10,
        color: colors.text.default,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 6,
    },
    help: {
        marginTop: 3,
    },
    parentheses: {
        fontSize: 14,
        color: colors.text.muted,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderWidth: error ? 1 : colors.isLight ? 1 : 1.6,
        borderRadius: 6,
        paddingHorizontal: 14,
        borderColor: error
            ? colors.danger.default
            : colors.border.default,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text.default,
        fontFamily: "WorkSans-Regular",
    },
    eyeButton: {
        marginLeft: 6,
    },
    eye: {
        width: 20,
        height: 20,
    },
    endText: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    error: {
        fontSize: activateMini ? 11 : 13,
        marginTop: 6,
        color: colors.danger.default,
        fontFamily: 'WorkSans-Medium',
    },
    extraInfo: {
        color: colors.text.muted,
        fontSize: 10,
        fontFamily: 'WorkSans-Medium',
        marginTop: 4,
    },
    strength: {
        fontSize: 13,
        color: colors.text.default,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    strengthBars: {
        flexDirection: 'row',
    },
    strengthBar: {
        width: 14,
        height: 2,
        borderRadius: 2,
        backgroundColor: '#2E2E2E',
        marginLeft: 4,
    },
    required: {
        color: colors.danger.default,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    dropdown: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: activateMini ? 3 : 8,
        maxHeight: activateMini ? 200 : 250,
        backgroundColor: colors.isLight ? colors.constant.white : '#030c18',
        zIndex: 100,
        elevation: 10,
    },
    dropdownClose: {
        position: 'absolute',
        top: -1000,
        bottom: -1000,
        left: -1000,
        right: -1000,
        zIndex: 1,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 14,
        paddingVertical: activateMini ? 6 : 14,
        paddingHorizontal: 16,
    },
    optionText: {
        color: colors.text.default,
        fontSize: activateMini ? 14 : 16,
        fontFamily: 'WorkSans-Regular',
    },
    countryCodeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 6,
    },
    countryCode: {
        fontSize: activateMini ? 12 : 14,
        color: colors.text.default,
        fontFamily: 'AntDesign',
    },
    separator: {
        width: 1,
        height: 24,
        backgroundColor: colors.border.default,
        marginRight: 8,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    radioOuter: {
        width: 16,
        height: 16,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.text.muted,
        backgroundColor: colors.background.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: '#4F86C0',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 10,
        backgroundColor: '#4F86C0',
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text.muted,
        fontFamily: 'WorkSans-Regular',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.default,
        columnGap: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
    },
    noOptions: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noOptionsText: {
        color: colors.text.muted,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
});