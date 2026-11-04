import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    filterBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filterText: {
        color: colors.text.default,
        fontSize: 13,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
        marginBottom: 2,
    },
    filterActionWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
        marginLeft: 'auto',
    },
    filterAction: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        fontSize: 16,
        lineHeight: 24,
    },
    filterGroup: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 12,
    },
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    dropdown: {
        backgroundColor: colors.background.default,
        borderRadius: 8,
        paddingVertical: 8,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownText: {
        color: colors.text.default,
        fontSize: 15,
        fontFamily: 'WorkSans-Medium',
    },
})