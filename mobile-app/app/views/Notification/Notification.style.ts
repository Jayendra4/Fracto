import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: colors.border.lightGrey,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    countLoader: {
        flexGrow: 1,
        marginLeft: 14,
        marginRight: 20
    },
    unreadCount: {
        fontSize: 13,
        color: colors.text.danger,
        fontFamily: 'WorkSans-Medium',
        flexGrow: 1,
        marginLeft: 14,
    },
    markReadWrapper: {
        backgroundColor: '#F5F5F529',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border.primary,
        width: 125,
        height: 32,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        columnGap: 6,
    },
    markRead: {
        fontSize: 10,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    listContent: {
        marginTop: 20,
        paddingBottom: 50,
        paddingHorizontal: 16,
    },
    separator: {
        height: 20,
    },
    card: {
        backgroundColor: colors.background.darkBlue,
        borderRadius: 4,
        paddingVertical: 17,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#828282',
        minHeight: 90,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 4,
        marginRight: 8,
    },
    redDot: {
        backgroundColor: colors.text.danger,
    },
    greenDot: {
        backgroundColor: colors.icon.green,
    },
    title: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
        marginRight: 10,
    },
    time: {
        fontSize: 12,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    description: {
        fontSize: 11,
        lineHeight: 13,
        fontFamily: 'WorkSans-Regular',
        color: colors.isLight ? colors.constant.black : colors.text.mutedLight,
    },
    swipeAction: {
        backgroundColor: "#33BD5652",
        justifyContent: "center",
        alignItems: "center",
        width: 61,
        borderRadius: 6,
    },
    swipeText: {
        color: colors.text.green,
        fontFamily: 'WorkSans-Medium',
        fontSize: 10,
        marginTop: 6,
        textAlign: 'center',
    },
    emptyWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    emptyText: {
        color: colors.text.lightGrey,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        textAlign: "center",
    },
});