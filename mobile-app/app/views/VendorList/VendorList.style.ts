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
        marginVertical: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        columnGap: 8,
        marginBottom: 30,
    },
    allowShrink: {
        flexShrink: 1,
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
    buttonStyle: {
        height: 30,
        borderRadius: 4,
    },
    textStyle: {
        fontSize: 12
    },
    noHistoryText: {
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
        fontSize: 14,
        textAlign: 'center',
    },
    name: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
        textAlign: "center",
    },
    startFirst: {
        alignItems: 'flex-start',
    },
});