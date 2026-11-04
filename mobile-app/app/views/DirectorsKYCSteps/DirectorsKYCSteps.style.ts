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
    divider: {
        height: 1,
        backgroundColor: "#F5F5F533",
        marginHorizontal: 16,
    },
    kybCard: {
        backgroundColor: colors.background.primaryLight,
        paddingVertical: 16,
        marginBottom: 16,
    },
    stepsWrapper: {
        paddingHorizontal: 16,
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    stepContent: {
        flex: 1,
        marginLeft: 16,
    },
    stepTitle: {
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        color: colors.constant.white,
    },
    stepDescription: {
        marginTop: 2,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        color: "#F5F5F5B2",
    },
})