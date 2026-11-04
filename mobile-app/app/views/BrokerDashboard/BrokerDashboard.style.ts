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
            rowGap: 16,
            backgroundColor: colors.background.slightly,
            paddingVertical: 24,
        },
        topHeader: {
            marginHorizontal: 16,
            backgroundColor: '#1C2C3C',
            borderRadius: 20,
            height: 36,
            overflow: 'hidden',
        },
        tabsContainer: {
            alignItems: 'center',
            columnGap: 18,
        },
        tabPill: {
            paddingHorizontal: 16,
            height: 36,
            justifyContent: 'center',
            borderRadius: 38,
        },
        activeTabPill: {
            backgroundColor: colors.text.primary,
        },
        tabText: {
            color: colors.constant.white,
            fontSize: 14,
            fontFamily: 'Inter-Medium',
        },
        tabContentWrapper: {
            flex: 1,
            position: "relative",
        },
        viewportSlot: {
            flex: 1,
        },
    });
