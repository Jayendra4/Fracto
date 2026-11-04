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
    animatedTabs: {
        marginHorizontal: 16,
        marginTop: 10,
    },
    addButton: {
        marginHorizontal: 16,
        height: 32,
        borderRadius: 4,
        columnGap: 6,
        paddingHorizontal: 10,
    },
    addButtonText: {
        fontSize: 14,
    },
    cardList: {
        rowGap: 16,
        paddingBottom: 16,
    },
    emptyMessage: {
        textAlign: "center",
        color: colors.text.lightGrey,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        marginTop: 20,
    }
});