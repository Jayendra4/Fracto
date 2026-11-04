import { StyleSheet } from "react-native";
import { Colors } from "../../util/theme";

export const createStyles = (colors: Colors) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background.main,
    },
    container: {
        flex: 1,
        paddingTop: 10,
        rowGap: 16,
    },
    wrapper: {
        rowGap: 10,
        marginHorizontal: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
        fontSize: 20,
        lineHeight: 28,
    },
    cardsWrapper: {
        marginHorizontal: 16,
        rowGap: 14,
        marginTop: 20,
    },
    card: {
        borderWidth: colors.isLight ? 0.6 : 1,
        borderColor: '#2E2E2E',
        height: 46,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    cardTitle: {
        color: colors.text.default,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        flexShrink: 1,
        marginRight: 8,
    },
    previewSide: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
    },
    prePreview: {
        width: 34,
        height: 20,
    },
    divider: {
        height: 29,
        borderWidth: colors.isLight ? 0.6 : 1,
        borderColor: colors.border.lightGrey
    },
    previewText: {
        color: colors.text.primary,
        fontSize: 12,
        fontFamily: 'WorkSans-Regular',
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        marginTop: 20,
        fontSize: 20,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
    },
    emptySubtitle: {
        marginTop: 6,
        fontSize: 13,
        color: colors.text.lightGrey,
        textAlign: 'center',
        fontFamily: 'WorkSans-Medium',
    },
    pdfText: {
        fontSize: 8,
        color: colors.text.default,
        fontFamily: 'WorkSans-Regular',
    },
});