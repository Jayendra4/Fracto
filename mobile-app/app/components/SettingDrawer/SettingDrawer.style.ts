import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: colors.isLight ? colors.constant.white : '#05182C',
        borderWidth: 1,
        borderColor: colors.isLight ? "#C2DFFF" : "#1B3B5C",
        height: 54,
        marginHorizontal: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 14,
        flexShrink: 1,
    },
    title: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
        flexShrink: 1,
    },
    keyPressed: {
        paddingHorizontal: 18,
    },
    switch: {
        borderColor: colors.isLight ? colors.border.lightGrey : colors.constant.white,
    },
})