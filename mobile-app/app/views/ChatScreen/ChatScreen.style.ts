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
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        rowGap: 24,
    },
    messageRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    messageRowRight: {
        justifyContent: "flex-end",
    },
    messageRowLeft: {
        justifyContent: "flex-start",
    },
    messageContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    alignEnd: {
        alignItems: 'flex-end',
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 40,
        marginRight: 14,
    },
    bubbleWrapper: {
        flex: 1,
        flexDirection: "column",
    },
    bubbleWrapperRight: {
        alignItems: "flex-end",
    },
    bubbleWrapperLeft: {
        alignItems: "flex-start",
    },
    bubble: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
    },
    myBubble: {
        backgroundColor: "#4F86C0",
        borderBottomRightRadius: 0,
        maxWidth: "80%",
    },
    otherBubble: {
        borderBottomLeftRadius: 0,
        borderWidth: colors.isLight ? 0.5 : 1,
        borderColor: colors.border.divider,
        maxWidth: "90%",
    },
    messageText: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    myText: {
        color: colors.constant.white,
    },
    imageWrapper: {
        backgroundColor: colors.background.darkBlue,
        padding: 6,
        borderRadius: 6,
    },
    image: {
        width: 200,
        height: 200,
    },
    timeText: {
        fontSize: 10,
        color: colors.text.extraLight,
        fontFamily: 'WorkSans-Regular',
        marginTop: 8,
    },
    inputContainer: {
        marginTop: 'auto',
        flexDirection: "row",
        alignItems: "center",
        minHeight: 60,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: colors.isLight ? 0.5 : 1.4,
        borderTopColor: colors.border.divider,
        backgroundColor: colors.background.default,
    },
    input: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
        maxHeight: 100,
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: "#4F86C0",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 10,
    },
    sendText: {
        color: colors.constant.white,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    chatHeaderWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        paddingBottom: 8,
        borderBottomWidth: colors.isLight ? 0.5 : 1.4,
        borderBottomColor: colors.border.divider,
    },
    headeravatar: {
        width: 32,
        height: 32,
        borderRadius: 100,
    },
    infoContainer: {
        marginLeft: 16,
        flexShrink: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 8,
    },
    name: {
        fontSize: 16,
        fontFamily: 'WorkSans-SemiBold',
        color: colors.text.default,
    },
    role: {
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
        color: colors.text.extraLight,
        marginRight: 6,
        flexShrink: 1,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 30,
        backgroundColor: colors.background.green,
    },
    onlineText: {
        fontSize: 10,
        color: colors.text.green,
        fontFamily: 'WorkSans-Regular',
    },
    chatAction: {
        marginLeft: 'auto',
    },
    action: {
        padding: 3,
    },
    syncHistoryWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 10,
    },
    syncHistory: {
        color: colors.text.primary,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    emptyImage: {
        width: 120,
        height: 120,
        marginBottom: 20,
        opacity: 0.7,
    },
    emptyTitle: {
        fontSize: 16,
        color: colors.text.muted,
        fontFamily: 'WorkSans-Medium',
        textAlign: "center",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.text.muted,
        fontFamily: 'WorkSans-Medium',
        textAlign: "center",
    },
})