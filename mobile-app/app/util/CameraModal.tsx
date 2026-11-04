import React, { useRef } from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { Camera, CameraDevice } from "react-native-vision-camera";
import { Colors, useTheme } from "./theme";

interface CameraModalProps {
    visible: boolean;
    device: CameraDevice | undefined;
    hasPermission: boolean;
    onCapture: (uri: string) => void;
    onClose: () => void;
}

const CameraModal = ({
    visible,
    device,
    hasPermission,
    onCapture,
    onClose,
}: CameraModalProps) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const cameraRef = useRef<Camera>(null);

    const takePhoto = async () => {
        try {
            if (!cameraRef.current) return;

            const photo = await cameraRef.current.takePhoto({
                flash: "off",
            });

            onCapture(`file://${photo.path}`);
        } catch (e) {
            console.warn("Camera capture failed", e);
        }
    };

    return (
        <Modal visible={visible} animationType="slide">
            {!device || !hasPermission ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.icon.primary} />
                    <Text style={styles.permissionText}>
                        Camera permission required
                    </Text>
                </View>
            ) : (
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={visible}
                    photo
                />
            )}

            <View style={styles.controls}>
                <Pressable onPress={takePhoto} style={styles.captureOuter}>
                    <View style={styles.captureInner} />
                </Pressable>

                <Pressable onPress={onClose} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
            </View>
        </Modal>
    );
};

export default CameraModal;

const createStyles = (colors: Colors) => StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.default,
    },
    permissionText: {
        color: colors.text.default,
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
    },
    controls: {
        position: "absolute",
        bottom: 40,
        width: "100%",
        alignItems: "center",
    },
    captureOuter: {
        width: 56,
        height: 56,
        borderRadius: 100,
        backgroundColor: colors.constant.white,
        justifyContent: "center",
        alignItems: "center",
    },
    captureInner: {
        width: 50,
        height: 50,
        borderRadius: 100,
        backgroundColor: colors.constant.black,
    },
    cancelBtn: {
        marginTop: 10,
    },
    cancelText: {
        color: colors.constant.white,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        lineHeight: 20,
    },
});
