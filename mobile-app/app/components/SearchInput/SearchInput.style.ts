import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.isLight ? colors.background.darkBlue : colors.background.primaryLight,
        borderRadius: 8,
        paddingLeft: 14,
        paddingRight: 2,
        minHeight: 40,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Regular',
    },
    empty: { padding: 10 },
})