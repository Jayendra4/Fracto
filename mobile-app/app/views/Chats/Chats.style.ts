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
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginHorizontal: 16,
    },
    title: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Regular',
    },
    scrollContainer: {
        rowGap: 16,
        paddingVertical: 10,
        marginHorizontal: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
        backgroundColor: colors.background.darkBlue,
        borderRadius: 7,
        paddingHorizontal: 14,
        height: 48,
        marginHorizontal: 16,
    },
    searchInput: {
        flex: 1,
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    chatRow: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10,
        paddingVertical: 6,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 100,
    },
    chatContent: {
        flex: 1,
        rowGap: 4,
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    name: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-SemiBold',
    },
    message: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        flexShrink: 1,
        marginRight: 6,
    },
    newBadge: {
        backgroundColor: "#F03F231F",
        height: 22,
        paddingHorizontal: 7,
        borderRadius: 4,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: "#F03F2399",
        flexDirection: 'row',
        columnGap: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 16,
        backgroundColor: colors.border.danger
    },
    newText: {
        color: colors.text.danger,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
    },
    time: {
        color: colors.text.default,
        fontSize: 10,
        fontFamily: 'WorkSans-Regular',
    },
    addButton: {
        position: "absolute",
        right: 16,
        bottom: 40,
        paddingHorizontal: 8,
        borderRadius: 4,
        height: 32,
        columnGap: 3,
    },
    addButtonText: {
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    buttonStyle: {
        backgroundColor: "#F5F5F51F",
        width: 107,
        paddingHorizontal: 4,
        height: 32,
    },
    textStyle: {
        fontSize: 14,
    },
    empty: {
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
    },
})