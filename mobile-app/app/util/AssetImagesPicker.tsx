import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { launchImageLibrary, Asset } from "react-native-image-picker";
import { Colors, useTheme } from "./theme";
import Feather from "react-native-vector-icons/Feather";
import { useState } from "react";
import HelpModal from "../components/Modals/HelpModal";
import Toast from "react-native-toast-message";

interface Props {
    images: Asset[];
    onChange: (data: Asset[]) => void;
    maxImagesAllowed?: number;
    error?: string;
    helpText?: string;
}

const AssetImagesPicker: React.FC<Props> = ({ images, onChange, maxImagesAllowed, error, helpText }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [helpVisible, setHelpVisible] = useState(false);

    const MAX_SIZE_BYTES = 300 * 1024 * 1024;

    const pickImage = async () => {
        const res = await launchImageLibrary({
            mediaType: "photo",
            ...(maxImagesAllowed && { selectionLimit: maxImagesAllowed - images?.length }),
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
                    text1: "Some images exceed 300MB limit",
                });
            }

            onChange([...images, ...validAssets]);
        }
    };

    const removeImage = (uri: string) => {
        const updated = images?.filter(img => img?.uri !== uri);
        onChange(updated);
    };

    return (
        <>
            <View style={{ flex: 1 }}>
                <View style={styles.labelWrapper}>
                    <Text style={styles.sectionTitle}>
                        Asset Images
                        <Text style={styles.required}> *</Text>
                    </Text>
                    {helpText && (
                        <Pressable
                            style={styles.help}
                            onPress={() => setHelpVisible(true)}
                            hitSlop={8}
                        >
                            <Feather
                                name="info"
                                size={18}
                                color={colors.text.extraLight}
                            />
                        </Pressable>
                    )}
                </View>

                <View style={styles.grid}>
                    <View>
                        <Pressable style={styles.uploadBox} onPress={pickImage}>
                            <Text style={styles.uploadText}>Choose a File</Text>
                            <Text style={styles.uploadHint}>JPEG, PNG, & PDF formats, up to 4MB</Text>
                        </Pressable>
                        {error && <Text style={styles.error}>{error}</Text>}
                    </View>

                    {images?.length !== 0 && (
                        <View style={styles.imagesWrapper}>
                            {images.map((img, i) => (
                                <View key={i} style={styles.imageContainer}>
                                    <Image source={{ uri: img.uri }} style={styles.preview} />

                                    <Pressable
                                        style={styles.removeButton}
                                        onPress={() => img.uri && removeImage(img.uri)}
                                    >
                                        <Feather name="x" size={16} color={colors.constant.white} />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <HelpModal
                visible={helpVisible}
                text={helpText}
                onClose={() => setHelpVisible(false)}
            />
        </>
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
    imagesWrapper: {
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
    error: {
        fontSize: 13,
        marginTop: 6,
        color: colors.danger.default,
        fontFamily: 'WorkSans-Medium',
    },
    imageContainer: {
        width: 100,
        height: 100,
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
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 6,
    },
    help: {
        marginTop: 3,
    },
});

export default AssetImagesPicker;