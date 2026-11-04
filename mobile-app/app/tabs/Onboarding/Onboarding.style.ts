import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    container: {
        flex: 1,
        paddingTop: 10,
        rowGap: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#F5F5F533",
        marginHorizontal: 16,
    },
    completeButton: {
        paddingHorizontal: 16,
        marginTop: 'auto',
        marginBottom: 16,
    },
})