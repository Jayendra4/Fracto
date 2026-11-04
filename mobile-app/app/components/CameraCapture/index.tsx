import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { Colors, useTheme } from "../../util/theme";

interface CameraCaptureProps {
    value: string | null;
    error?: string;
    required?: boolean;
    label?: string;
    subText?: string;
    onRemove: () => void;
    onOpenCamera: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
    value,
    error,
    required,
    label = "Selfie Photo (Live Capture)",
    subText = "Please ensure your face is clearly visible and well-lit.",
    onRemove,
    onOpenCamera,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>

            {subText && <Text style={styles.subText}>{subText}</Text>}

            <View style={styles.captureBox}>
                <View style={styles.imageWrapper}>
                    {value ? (
                        <>
                            <Image
                                source={{ uri: value }}
                                style={styles.selfie}
                                resizeMode="cover"
                            />
                            <Pressable
                                onPress={onRemove}
                                style={styles.cross}
                            >
                                <Feather name="x" size={28} color={colors.icon.primary} />
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <EvilIcons
                                name="camera"
                                size={40}
                                color={colors.icon.primary}
                            />
                            <Pressable
                                style={styles.captureButton}
                                onPress={onOpenCamera}
                            >
                                <Text style={styles.captureText}>
                                    Click Here to Take photo
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>

                {!!error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        label: {
            fontSize: 16,
            fontFamily: "WorkSans-Medium",
            color: colors.text.default,
            marginBottom: 6,
        },
        required: {
            color: colors.text.danger,
        },
        subText: {
            color: colors.text.muted,
            fontSize: 12,
            fontFamily: "WorkSans-Regular",
            marginBottom: 12,
        },
        captureBox: {
            flex: 1,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: colors.border.default,
            borderRadius: 12,
            paddingVertical: 30,
            paddingHorizontal: 16,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 14,
        },
        imageWrapper: {
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
        },
        selfie: {
            width: 120,
            height: 120,
            borderRadius: 100,
        },
        cross: {
            position: "absolute",
            top: -6,
            right: -30,
            borderRadius: 12,
            padding: 2,
        },
        captureButton: {
            marginTop: 4,
            borderWidth: 1,
            borderColor: colors.border.default,
            height: 32,
            paddingHorizontal: 26,
            borderRadius: 6,
            justifyContent: "center",
            alignItems: "center",
        },
        captureText: {
            color: colors.text.default,
            fontSize: 12,
            fontFamily: "WorkSans-Regular",
        },
        errorText: {
            fontSize: 13,
            marginTop: 6,
            color: colors.danger.default,
        },
    });

export default CameraCapture;
