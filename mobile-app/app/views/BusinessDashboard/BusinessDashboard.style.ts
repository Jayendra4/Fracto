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
            paddingVertical: 10,
        },
        topHeader: {
            flexDirection: "row",
            alignItems: "center",
            columnGap: 30,
            marginBottom: 8,
            marginHorizontal: 16,
        },
        overviewPill: {
            backgroundColor: colors.constant.primary,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 24,
        },
        overviewText: {
            color: colors.constant.white,
            fontSize: 14,
            fontFamily: "Inter-Medium",
        },
        activeTabTitle: {
            color: colors.constant.white,
        },
        masterPill: {
            paddingHorizontal: 14,
            paddingVertical: 6,
        },
        headerTitle: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: "Inter-Medium",
        },
        summaryRow: {
            gap: 12,
            marginHorizontal: 16,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        summaryCard: {
            flex: 1,
            backgroundColor: colors.background.slightly,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#454545',
            justifyContent: 'space-evenly',
            height: 86,
        },
        summaryTitle: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-Medium',
        },
        summaryValue: {
            color: colors.text.default,
            fontSize: 20,
            fontFamily: 'WorkSans-Medium',
        },
        constantWhite: {
            color: colors.constant.white,
        },
        summarySub: {
            color: "#F5F5F5B2",
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
        },
        lightGray: {
            color: colors.isLight ? colors.text.lightGrey : "#F5F5F5B2",
        },
        card: {
            backgroundColor: colors.background.slightly,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1.4,
            borderColor: '#F5F5F51A',
            marginHorizontal: 16,
        },
        cardTitle: {
            color: colors.text.default,
            fontSize: 20,
            fontFamily: 'WorkSans-Regular',
        },
        cardSubtitle: {
            color: colors.isLight ? colors.text.lightGrey : "#F5F5F5B2",
            fontSize: 16,
            fontFamily: 'WorkSans-Regular',
            marginBottom: 12,
        },
        timelineRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 14,
        },
        timelineDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: "#6F8594",
            marginTop: 4,
        },
        timelineDotActive: {
            backgroundColor: colors.text.green,
            borderColor: colors.text.green,
        },
        timelineText: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        timelineDate: {
            color: "#F5F5F5B2",
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
        },
        assetNameText: {
            color: colors.isLight ? colors.text.lightGrey : '#F5F5F599',
            fontFamily: 'WorkSans-Regular',
            fontSize: 14,
        },
        dropdownWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        assetName: {
            color: colors.text.default,
            fontSize: 18,
            fontFamily: 'WorkSans-SemiBold',
        },
        dropdownButton: {
            marginLeft: 6,
            padding: 3,
        },
        projectionWrapper: {
            marginVertical: 10,
        },
        assetStatus: {
            color: colors.text.green,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        liquidatedRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 6,
        },
        liquidatedText: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-Medium',
        },
        amount: {
            color: "#B5B5B5",
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        progressBar: {
            height: 10,
            backgroundColor: "#3D3D3D",
            borderRadius: 26,
            marginVertical: 10,
        },
        progressFill: {
            width: "50%",
            height: "100%",
            backgroundColor: colors.text.green,
            borderRadius: 10,
        },
        statsRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
        },
        statBox: {
            backgroundColor: "#20354A",
            borderWidth: 1,
            borderColor: '#F5F5F533',
            borderRadius: 12,
            width: "30%",
            height: 118,
            alignItems: "center",
            justifyContent: 'center',
            paddingHorizontal: 6,
            paddingVertical: 10,
            rowGap: 6,
        },
        statValue: {
            color: colors.constant.white,
            fontSize: 16,
            fontFamily: 'WorkSans-Medium',
            textAlign: 'center',
        },
        statLabel: {
            color: "#F5F5F5B2",
            fontSize: 14,
            textAlign: "center",
            fontFamily: 'WorkSans-Regular',
        },
        divider: {
            height: 1,
            backgroundColor: colors.border.divider,
        },
        dropdownOverviewWrapper: {
            paddingHorizontal: 16,
            flex: 1,
            alignSelf: 'flex-start',
        },
        dropdownOverviewButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0F1D2C',
            borderRadius: 4,
            paddingVertical: 6,
            paddingHorizontal: 16,
            columnGap: 10,
            borderWidth: 1,
            borderColor: colors.text.primary,
        },
        dropdownText: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
        },
        dropdownArrow: {
            color: '#9CA3AF',
            fontSize: 18,
        },
        dropdownMenu: {
            marginTop: 8,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.text.primary,
            overflow: 'hidden',
        },
        dropdownItem: {
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.text.primary,
        },
    });
