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
    divider: {
        height: colors.isLight ? 0.5 : 1.4,
        backgroundColor: colors.isLight ? colors.text.darkBlue : "#F5F5F533",
        marginHorizontal: 16,
        marginTop: 6,
    },
    scrollContainer: {
        rowGap: 16,
        paddingBottom: 10,
        marginHorizontal: 24,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
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
        flexShrink: 1,
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
    },
    email: {
        color: colors.text.extraLight,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        flexShrink: 1,
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
});