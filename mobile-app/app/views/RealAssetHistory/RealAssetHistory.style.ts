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
        rowGap: 13,
    },
    main: {
        marginHorizontal: 16,
        paddingVertical: 16,
    },
    card: {
        borderRadius: 16,
        paddingVertical: 18,
    },
    title: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.extraLight,
    },
    divider: {
        height: 1,
        backgroundColor: colors.isLight ? "#bbbbbbff" : "#363636",
        marginVertical: 4,
    },
    animatedTabs: {
        marginTop: 20,
        marginBottom: 26,
    },
    noHistoryText: {
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
        fontSize: 14,
        textAlign: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontFamily: "WorkSans-SemiBold",
    },
    detailsText: {
        color: "#4F86C0",
        fontSize: 14,
        fontFamily: "WorkSans-Medium",
    },
    draftContainer: {
        backgroundColor: "#FFB8161F",
        borderColor: "#FFB816",
    },
    draftText: {
        color: "#FFB816",
    },
    availableContainer: {
        backgroundColor: "#33BD561A",
        borderColor: "#33BD56",
    },
    availableText: {
        color: "#33BD56",
    },
    fundedContainer: {
        backgroundColor: "#FE65061F",
        borderColor: "#FE6506",
    },
    fundedText: {
        color: "#FE6506",
    },
    exitedContainer: {
        backgroundColor: "#F03F231F",
        borderColor: "#F03F23",
    },
    exitedText: {
        color: "#F03F23",
    },
    defaultContainer: {},
    defaultText: {},
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
});