import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerTitle: {
        color: colors.text.default,
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
    },
    headerDesc: {
        color: colors.text.extraLight,
        fontSize: 10,
        fontFamily: 'WorkSans-Regular',
    },
    doLater: {
        backgroundColor: colors.background.darkBlue,
        borderWidth: 0.6,
        borderColor: colors.border.lightGrey,
        borderRadius: 2,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    doLaterText: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    percentageWrapper: {
        marginVertical: 24,
        width: '90%',
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
    stepsCount: {
        color: colors.text.green,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
    percentageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    percentComplete: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
        fontSize: 10,
        lineHeight: 20,
    },
    stepperContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: colors.border.darkBlue,
        justifyContent: "center",
        alignItems: "center",
    },
    stepCompleted: {
        borderColor: colors.border.green,
    },
    stepText: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 22,
    },
    stepTextCompleted: {
        color: colors.text.green,
    },
    stepLine: {
        flex: 1,
        height: 3,
        backgroundColor: colors.background.darkBlue,
    },
    lineCompleted: {
        backgroundColor: colors.border.green,
    },
});