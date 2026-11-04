import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
} from "react-native";
import { launchImageLibrary, Asset } from "react-native-image-picker";
import { Colors, useTheme } from "./theme";
import Feather from "react-native-vector-icons/Feather";
import Toast from "react-native-toast-message";

interface Props {
    videos: Asset[];
    onChange: (data: Asset[]) => void;
    maxVideosAllowed?: number;
    error?: string;
}

const AssetVideosPicker: React.FC<Props> = ({ videos, onChange, maxVideosAllowed, error }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const MAX_SIZE_BYTES = 300 * 1024 * 1024;

    const pickVideo = async () => {
        const res = await launchImageLibrary({
            mediaType: "video",
            ...(maxVideosAllowed && { selectionLimit: maxVideosAllowed - videos?.length }),
        });

        if (!res.didCancel && res?.assets) {
            const validAssets = res?.assets?.filter((asset) => {
                if (!asset.fileSize) return true;
                return asset.fileSize <= MAX_SIZE_BYTES;
            });

            const invalidAssets = res?.assets?.filter(
                (asset) => asset.fileSize && asset.fileSize > MAX_SIZE_BYTES
            );

            if (invalidAssets.length > 0) {
                Toast.show({
                    type: "error",
                    text1: "Some videos exceed 300MB limit",
                });
            }

            onChange([...videos, ...validAssets]);
        }
    };

    const removeVideo = (uri: string) => {
        const updated = videos?.filter(vid => vid?.uri !== uri);
        onChange(updated);
    };

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
                Asset Videos
                <Text style={styles.required}> *</Text>
            </Text>

            <View style={styles.grid}>
                <View>
                    <Pressable style={styles.uploadBox} onPress={pickVideo}>
                        <Text style={styles.uploadText}>Choose a File</Text>
                        <Text style={styles.uploadHint}>Video MP4 format</Text>
                    </Pressable>
                    {error && <Text style={styles.error}>{error}</Text>}
                </View>

                {videos?.length !== 0 && (
                    <View style={styles.videosWrapper}>
                        {videos.map((vid, i) => (
                            <View key={i} style={styles.preview}>
                                <Image source={{ uri: vid?.uri }} style={styles.preview} />

                                <Pressable
                                    style={styles.removeButton}
                                    onPress={() => vid?.uri && removeVideo(vid?.uri)}
                                >
                                    <Feather name="x" size={16} color={colors.constant.white} />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    sectionTitle: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
        marginBottom: 10,
        color: colors.text.default,
    },
    required: {
        color: colors.danger.default,
    },
    grid: {
        gap: 20,
    },
    uploadBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
        borderRadius: 12,
        paddingVertical: 30,
        paddingHorizontal: 16,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 113,
    },
    uploadText: {
        color: colors.text.muted,
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'WorkSans-Medium',
        lineHeight: 26,
    },
    uploadHint: {
        color: '#2F3C4A',
        fontSize: 14,
        fontFamily: 'WorkSans-Regular',
    },
    videosWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        columnGap: 16,
        rowGap: 20,
    },
    preview: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: "#2A2A2A",
    },
    playIcon: {
        color: colors.icon.primary,
        fontSize: 22,
    },
    error: {
        fontSize: 13,
        marginTop: 6,
        color: colors.danger.default,
        fontFamily: 'WorkSans-Medium',
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 40,
        backgroundColor: colors.background.danger,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});

export default AssetVideosPicker;