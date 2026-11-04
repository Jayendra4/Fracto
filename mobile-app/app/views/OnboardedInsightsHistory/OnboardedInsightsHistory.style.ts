import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) =>
    StyleSheet.create({
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
            backgroundColor: colors.isLight ? colors.background.darkBlue : "#0F1D2C",
            marginHorizontal: 16,
            paddingVertical: 16,
            borderRadius: 8,
        },
        titleWrapper: {
            marginHorizontal: 16,
            marginBottom: 4,
        },
        title: {
            color: colors.text.default,
            fontSize: 18,
            fontFamily: 'WorkSans-Medium',
        },
        subtitle: {
            color: colors.text.lightGrey,
            fontSize: 10,
            fontFamily: 'WorkSans-Medium',
        },
        card: {
            backgroundColor: colors.background.darkBlue,
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
            marginHorizontal: 10,
            marginTop: 10,
        },
        sectionTitle: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
            marginBottom: 10,
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 4,
        },
        label: {
            color: colors.text.extraLight,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        value: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-SemiBold',
        },
        green: {
            color: colors.text.green,
        },
        blue: {
            color: colors.text.link,
        },
        divider: {
            height: 1,
            backgroundColor: colors.isLight ? "#bbbbbbff" : "#F5F5F51A",
            marginVertical: 8,
        },
        amount: {
            color: colors.text.default,
            fontSize: 20,
            fontFamily: 'WorkSans-SemiBold',
            marginTop: 6,
        },
        button: {
            marginTop: 16,
            borderRadius: 10,
            height: 38,
        },
        buttonText: {
            fontSize: 14,
        },
        historyWrapper: {
            marginHorizontal: 10,
        },
        tableWrapper: {
            backgroundColor: "#0D243A",
            borderRadius: 10,
            paddingVertical: 10,
        },
        tableHeader: {
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#1D3A56",
        },
        headerCell: {
            color: "#8FA7C6",
            width: 130,
            fontSize: 13,
        },
        tableRow: {
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#1D3A56",
        },
        cell: {
            color: colors.text.default,
            width: 130,
            fontSize: 14,
        },
        noHistoryText: {
            color: colors.text.lightGrey,
            fontFamily: 'WorkSans-Medium',
            fontSize: 14,
        },
    });