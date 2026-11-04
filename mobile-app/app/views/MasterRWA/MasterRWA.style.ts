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
    kybInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        columnGap: 10,
    },
    kybInfoWrapper: {
        marginLeft: 26,
        marginRight: 16,
    },
    kybTitle: {
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        color: colors.constant.white,
        flexShrink: 1,
    },
    kybSubtitle: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
        color: "#F5F5F5B2",
        width: "80%",
    },
    supportButtonStyle: {
        height: 24,
        borderRadius: 4,
        paddingHorizontal: 4,
        columnGap: 3,
    },
    supportTextStyle: {
        fontSize: 10,
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