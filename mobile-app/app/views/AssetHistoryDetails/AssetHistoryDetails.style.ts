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
        rowGap: 13,
    },
    main: {
        marginHorizontal: 16,
        paddingVertical: 16,
    },
    card: {
        borderRadius: 16,
        paddingVertical: 18,
    },
    title: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.extraLight,
    },
    divider: {
        height: 1,
        backgroundColor: colors.isLight ? "#bbbbbbff" : "#363636",
        marginVertical: 4,
    },
    section: {
        backgroundColor: colors.isLight ? colors.background.darkBlue : "#041221",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 20,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        color: colors.text.primary,
        fontFamily: "WorkSans-Medium",
        marginBottom: 10,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: colors.text.primary,
    },
    subTitle: {
        fontSize: 14,
        color: colors.text.primary,
        marginVertical: 12,
        fontFamily: "WorkSans-SemiBold",
    },
    image: {
        width: "100%",
        height: 192,
        marginBottom: 20,
    },
    videoBox: {
        height: 192,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1b2d3b",
        marginBottom: 20,
        overflow: 'hidden',
    },
    docImage: {
        width: "100%",
        height: 192,
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.text.lightGrey,
        fontFamily: 'WorkSans-Medium',
    },
    infoValue: {
        fontSize: 14,
        color: colors.text.default,
        marginTop: 4,
        fontFamily: 'WorkSans-Medium',
    },
    videoPlayer: {
        width: "100%",
        height: 200,
    },
    playIcon: {
        position: "absolute",
        alignSelf: "center",
        top: "40%",
        color: "#fff",
        fontSize: 24,
    },
    imagePreviewContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    previewImage: {
        width: "95%",
        height: "80%",
        resizeMode: "contain",
    },
    videoPreviewContainer: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
    },
    previewVideo: {
        width: "100%",
        height: 300,
    },
    bottomContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 32,
        gap: 12,
    },

    approveBtn: {
        width: '48%',
        backgroundColor: colors.success.primary,
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.success.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },

    rejectBtn: {
        width: '48%',
        backgroundColor: colors.background.danger,
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.background.danger,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },

    btnText: {
        color: colors.constant.white,
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
    },
});