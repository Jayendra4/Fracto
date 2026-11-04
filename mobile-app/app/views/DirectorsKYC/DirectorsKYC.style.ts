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
    directorWrapper: {
        flex: 1,
        backgroundColor: colors.background.slightly,
        paddingVertical: 16,
        borderTopStartRadius: 12,
        borderTopEndRadius: 12,
        rowGap: 16,
    },
    addDirectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    addInfoWrapper: {
        flexShrink: 1,
    },
    title: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        fontSize: 20,
    },
    subTitle: {
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
        fontSize: 10,
    },
    addButtonStyle: {
        height: 41,
        width: 150,
        alignSelf: 'flex-end',
        borderRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: colors.background.slightly,
        borderRadius: 8,
        paddingVertical: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
        flexGrow: 1,
        textAlign: 'center',
        marginLeft: 28,
    },
    closeIcon: {
        padding: 4,
    },
    modalDivider: {
        height: 1,
        backgroundColor: "#3D3D3D",
    },
    inputs: {
        rowGap: 20,
        marginTop: 20,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    listWrapper: {
        rowGap: 16,
        paddingHorizontal: 16,
        marginTop: 16,
    },
    directorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    directorNumber: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    directorName: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
});