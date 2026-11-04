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
        dropdown: {
            marginTop: 10,
            alignSelf: "flex-end",
            zIndex: 9999,
            paddingRight: 0,
        },
        assetWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        assetButtonStyles: {
            height: 40,
            paddingHorizontal: 24,
            opacity: 1,
        },
        assetTextStyles: {
            fontSize: 16,
        },
        bookmarkWrapper: {
            height: 46,
            width: 46,
            borderRadius: 100,
            backgroundColor: colors.background.darkBlue,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyWrapper: {
            marginVertical: 20,
            alignItems: 'center',
            marginHorizontal: 16,
            rowGap: 8,
        },
        onboardedEmptyWrapper: {
            marginVertical: 20,
            alignItems: 'center',
            height: 236,
            borderRadius: 4,
            backgroundColor: "#132436",
            justifyContent: 'center',
            overflow: 'hidden',
        },
        onboardedEmptyText: {
            fontSize: 18,
            color: colors.constant.white,
            fontFamily: 'WorkSans-Medium',
            marginTop: 8,
        },
        emptyText: {
            fontSize: 18,
            color: colors.text.extraLight,
            fontFamily: 'WorkSans-Regular',
        },
        emptyImg: {
            position: "absolute",
            bottom: -16,
            right: -60,
        },
        onboardedEmptySubText: {
            fontSize: 14,
            color: "#F5F5F599",
            fontFamily: 'WorkSans-Regular',
            textAlign: 'center',
            width: "70%",
        },
        subText: {
            fontSize: 18,
            color: colors.text.default,
            fontFamily: 'WorkSans-Medium',
            textAlign: 'center',
        },
        exploreTextStyle: {
            color: colors.constant.black,
            fontSize: 18,
        },
        tabsWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 18,
            marginBottom: 12,
        },
        tabButton: {
            backgroundColor: colors.background.default,
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
        },
        selectedTab: {
            backgroundColor: colors.background.inverse,
        },
        tabText: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        selectedTabText: {
            color: colors.text.inverse,
        },
    });
