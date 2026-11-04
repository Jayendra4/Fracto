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
    wrapper: {
        rowGap: 16,
        paddingBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    headerTitle: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        fontSize: 20,
        lineHeight: 28,
    },

});