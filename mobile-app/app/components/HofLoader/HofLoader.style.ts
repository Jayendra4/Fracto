import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        backgroundColor: colors.background.default,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 72,
        height: 72,
    },
    spacer: {
        marginVertical: 16,
    },
})