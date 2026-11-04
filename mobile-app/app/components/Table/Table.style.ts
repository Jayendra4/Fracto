import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) =>
    StyleSheet.create({
        wrapper: {
            backgroundColor: colors.isLight ? colors.background.darkBlue : "#041221",
            borderRadius: 18,
            paddingVertical: 8,
            maxHeight: 500,
        },
        headerRow: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#7575754D",
        },
        row: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#7575754D",
        },
        cellContainer: {
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            minWidth: 70,
        },
        headerCell: {
            color: colors.text.lightGrey,
            fontSize: 12,
            fontFamily: "WorkSans-Regular",
            textAlign: "center",
        },
        cell: {
            color: colors.text.default,
            fontSize: 12,
            fontFamily: "WorkSans-Regular",
            textAlign: "center",
        },
    });