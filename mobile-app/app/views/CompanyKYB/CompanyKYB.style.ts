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
        borderRadius: 20,
        paddingTop: 16,
    },
    kybInfoWrapper: {
        marginHorizontal: 26,
    },
    kybTitle: {
        fontSize: 24,
        fontFamily: 'WorkSans-Medium',
        color: colors.constant.white,
    },
    kybSubtitle: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 10,
        color: "#F5F5F5B2",
    },
    stepsWrapper: {
        marginTop: 20,
        backgroundColor: colors.background.default,
        paddingTop: 24,
        paddingHorizontal: 16,
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
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
        color: colors.text.default,
    },
    stepDescription: {
        marginTop: 2,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.lightGrey,
    },
    kybDivider: {
        height: 1,
        backgroundColor: "#3A3A3A",
        marginVertical: 20,
    },
})