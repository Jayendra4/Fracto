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
            rowGap: 16,
        },
        scrollContainer: {
            flexGrow: 1,
            rowGap: 24,
            paddingVertical: 24,
        },
        detailWrapper: {
            backgroundColor: colors.background.darkBlue,
            borderTopStartRadius: 16,
            borderTopEndRadius: 16,
            marginHorizontal: 16,
            paddingHorizontal: 10,
            paddingVertical: 10,
            rowGap: 12,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 10,
        },
        spaceEqualRow: {
            justifyContent: 'space-between',
            columnGap: 4,
            flexWrap: 'wrap',
            rowGap: 8,
        },
        detailTitle: {
            color: colors.text.default,
            fontSize: 18,
            fontFamily: 'WorkSans-Medium',
        },
        subDetail: {
            color: colors.text.default,
            fontSize: 12,
            fontFamily: 'WorkSans-Medium',
        },
        whiteDetail: {
            color: colors.constant.white,
        },
        code: {
            color: colors.text.primary,
        },
        date: {
            color: colors.text.extraLight,
        },
        dot: {
            width: 4,
            height: 4,
            borderRadius: 10,
            backgroundColor: colors.background.green,
        },
        statusWrapper: {
            backgroundColor: '#33BD5666',
            borderRadius: 32,
            paddingHorizontal: 8,
            paddingVertical: 2,
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 4,
        },
        infoWrapper: {
            rowGap: 16,
            marginHorizontal: 16,
            paddingHorizontal: 10,
        },
        infoTitle: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-SemiBold',
        },
        allFields: {
            rowGap: 12,
        },
        fieldsWrapper: {
            borderRadius: 3,
            borderWidth: 1,
            borderColor: colors.border.divider,
            paddingHorizontal: 16,
            paddingVertical: 10,
            rowGap: 7,
        },
        label: {
            color: colors.text.extraLight,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        value: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        referralWrapper: {
            padding: 16,
            borderRadius: 3,
            borderWidth: 1,
            borderColor: colors.border.divider,
            marginHorizontal: 26,
        },
        header: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-SemiBold',
        },
        activityWrapper: {
            rowGap: 12,
            marginTop: 14,
        },
        statusTextRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            columnGap: 6,
        },
        investorTextRow: {
            columnGap: 12,
        },
        statusText: {
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.default,
        },
        allowShrink: {
            flexShrink: 1,
        },
        topSpace: {
            marginTop: 8,
        },
        green: {
            backgroundColor: colors.background.green,
        },
        blue: {
            backgroundColor: colors.background.blue,
        },
        orange: {
            backgroundColor: '#E56B00',
        },
        orangeLight: {
            backgroundColor: '#803c00ff',
        },
        timestamp: {
            fontSize: 12,
            color: colors.text.extraLight,
            fontFamily: 'WorkSans-Regular',
        },
    });

