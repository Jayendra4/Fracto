import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from "react-native";

interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;

    title?: string;
    description?: string;

    confirmText?: string;
    cancelText?: string;

    loading?: boolean;

    confirmColor?: string;
    cancelColor?: string;

    backgroundColor: string;
    textColor: string;
    borderColor: string;
}

const ConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    confirmColor = "#FF3B30",
    cancelColor = "#000",
    backgroundColor,
    textColor,
    borderColor,
}: ConfirmationModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor,
                            borderColor,
                        },
                    ]}
                >
                    <Text style={[styles.title, { color: textColor }]}>
                        {title}
                    </Text>

                    {!!description && (
                        <Text style={[styles.description, { color: textColor }]}>
                            {description}
                        </Text>
                    )}

                    <View style={styles.buttonRow}>
                        <Pressable onPress={onClose} disabled={loading}>
                            <Text style={[styles.cancelText, { color: cancelColor }]}>
                                {cancelText}
                            </Text>
                        </Pressable>

                        <Pressable onPress={onConfirm} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color={confirmColor} />
                            ) : (
                                <Text style={[styles.confirmText, { color: confirmColor }]}>
                                    {confirmText}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        width: "80%",
        padding: 20,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
    },
    title: {
        fontSize: 20,
        fontFamily: "WorkSans-Medium",
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        fontFamily: "WorkSans-Regular",
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 24,
    },
    cancelText: {
        fontSize: 14,
        fontFamily: "WorkSans-Medium",
    },
    confirmText: {
        fontSize: 16,
        fontFamily: "WorkSans-Medium",
    },
});