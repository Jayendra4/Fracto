import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createstyles = (colors: Colors, checked: boolean) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    box: {
        width: 16,
        height: 16,
        borderRadius: 2,
        borderWidth: checked ? 0 : 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderColor: checked
            ? colors.border.green
            : colors.border.primary,
    },
    label: {
        color: colors.text.primary,
        fontSize: 14,
        fontFamily: "WorkSans-Regular",
        lineHeight: 20,
        verticalAlign: 'middle',
        marginLeft: 10,
        maxWidth: '96%',
    },
});