import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    menuOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    menuBox: {
        position: "absolute",
        top: 100,
        right: 20,
        backgroundColor: colors.background.inverse,
        borderRadius: 8,
        paddingVertical: 8,
        minWidth: 150,
        elevation: 6,
    },
    menuItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    menuText: {
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.inverse,
    },
});