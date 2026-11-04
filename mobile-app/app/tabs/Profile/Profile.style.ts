import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.isLight ? "#f8f8f8" : colors.background.main,
    },
    container: {
        flex: 1,
        paddingTop: 16,
        rowGap: 16,
    },
    drawer: {
        marginTop: 16,
        rowGap: 16,
        paddingBottom: 30,
    },
})