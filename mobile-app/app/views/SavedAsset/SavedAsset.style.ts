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
        scrollWrapper: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 16,
        },
        headerText: {
            color: colors.text.default,
            fontFamily: 'WorkSans-SemiBold',
            fontSize: 18,
        },
        emptyWrapper: {
            marginVertical: 20,
            alignItems: 'center',
            marginHorizontal: 16,
            rowGap: 8,
        },
        emptyText: {
            fontSize: 16,
            color: colors.text.extraLight,
            fontFamily: 'WorkSans-Regular',
        },
        savedCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.darkBlue,
            borderRadius: 8,
            columnGap: 12,
            paddingHorizontal: 10,
            paddingVertical: 8,
        },

        savedImage: {
            height: 175,
            width: 150,
            borderRadius: 4,
        },

        savedContent: {
            flex: 1,
            rowGap: 6,
        },

        savedTitle: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },

        savedLocationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 2,
        },

        savedLocation: {
            color: colors.text.lightGrey,
            fontSize: 10,
            fontFamily: 'WorkSans-Medium',
        },

        savedDivider: {
            height: 1,
            backgroundColor: colors.border.lightGrey,
            marginVertical: 3,
        },

        savedInfoWrapper: {
            rowGap: 4,
        },

        savedInfoRow: {
            flexDirection: "row",
            columnGap: 6,
        },

        savedLabel: {
            color: colors.text.lightGrey,
            fontSize: 13,
            fontFamily: 'WorkSans-Regular',
            flexShrink: 1,
        },

        savedValue: {
            color: colors.text.default,
            fontSize: 13,
            fontFamily: 'WorkSans-Regular',
        },

        savedButton: {
            marginTop: 6,
            borderRadius: 4,
            height: 28,
        },

        savedButtonText: {
            fontSize: 12,
        },
        saveImage: {
            height: 175,
            width: 150,
            borderRadius: 4,
            overflow: "hidden",
        },
    });
