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
        rowGap: 10,
        marginHorizontal: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        fontSize: 20,
        lineHeight: 28,
    },
    cardsWrapper: {
        marginHorizontal: 16,
        rowGap: 14,
        marginTop: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#484848',
        padding: 16,
    },
    document: {
        width: '100%',
        height: 400,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
    },
});