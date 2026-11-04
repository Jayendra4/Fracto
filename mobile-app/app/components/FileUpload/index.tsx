import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Modal,
    TouchableOpacity,
    Image,
} from "react-native";
import { Colors, useTheme } from "../../util/theme";
import { pickDocumentFile } from "../../util/fileUploadHelper";
import Octicons from "react-native-vector-icons/Octicons"
import FileImage from '../../assets/icons/file-image.svg';
import FileImageLight from '../../assets/icons/file-image-light.svg';

interface FileUploadProps {
    label?: string;
    subLabel?: string;
    required?: boolean;
    value?: any;
    error?: string;
    onSelect: (file: any) => void;
    disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
    subLabel,
    required,
    value,
    error,
    onSelect,
    disabled,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [previewVisible, setPreviewVisible] = useState(false);
    const isImage = value?.type?.startsWith("image/");

    return (
        <>
            <View style={{ flex: 1 }}>
                {label && (
                    <Text style={styles.label}>
                        {label}
                        {required && <Text style={styles.required}> *</Text>}
                    </Text>
                )}

                {subLabel && (
                    <Text style={styles.subLabel}>
                        Make sure the receipt clearly shows the transaction ID, amount, and date.
                    </Text>
                )}

                <View style={[styles.uploadBox, disabled && { opacity: 0.6 }]}>
                    {value ? (
                        <View style={styles.filePreview}>
                            <View style={styles.fileChip}>
                                {colors.isLight ? (
                                    <FileImageLight width={18} height={18} />
                                ) : (
                                    <FileImage width={18} height={18} />
                                )}
                                <Pressable
                                    style={{ flex: 1 }}
                                    onPress={() => isImage && setPreviewVisible(true)}
                                >
                                    <Text style={styles.fileName} numberOfLines={1}>
                                        {value.name}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => onSelect(null)}
                                >
                                    <Octicons name="x-circle" size={18} color={colors.icon.primary} />
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.uploadInner}>
                            <Text style={styles.uploadTitle}>
                                Choose A File
                            </Text>

                            <Text style={styles.uploadSubTitle}>
                                JPEG, PNG, & PDF formats, up to 4MB
                            </Text>

                            <Pressable
                                style={styles.browseButton}
                                onPress={() => pickDocumentFile(onSelect)}
                                disabled={!!disabled}
                            >
                                <Text style={styles.browseText}>Browse Files</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {!!error && <Text style={styles.error}>{error}</Text>}
            </View>

            <Modal visible={previewVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setPreviewVisible(false)}
                >
                    <View style={styles.modalContent}>
                        {isImage ? (
                            <Image
                                source={{ uri: value.uri }}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={{ color: colors.text.default }}>
                                Preview not available
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        label: {
            fontSize: 16,
            fontFamily: "WorkSans-Medium",
            color: colors.text.default,
            marginBottom: 6,
        },
        subLabel: {
            fontSize: 12,
            fontFamily: "WorkSans-Medium",
            color: colors.text.muted,
            marginBottom: 10,
        },
        required: {
            color: colors.danger.default,
        },
        uploadBox: {
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#475462',
            borderRadius: 12,
            paddingVertical: 30,
            paddingHorizontal: 16,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 130,
        },
        uploadInner: {
            alignItems: 'center',
            rowGap: 8,
        },
        uploadTitle: {
            color: colors.text.muted,
            fontSize: 16,
            textAlign: 'center',
            fontFamily: 'WorkSans-Medium',
            lineHeight: 26,
        },
        uploadSubTitle: {
            color: '#2F3C4A',
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        browseButton: {
            marginTop: 10,
            borderWidth: 1,
            borderColor: colors.border.default,
            width: 155,
            height: 35,
            borderRadius: 6,
            justifyContent: 'center',
            alignItems: 'center',
        },
        browseText: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-Regular',
        },
        errorText: {
            fontSize: 13,
            marginTop: 6,
            color: colors.danger.default,
        },
        filePreview: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        fileChip: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.isLight ? colors.constant.white : '#061728',
            borderRadius: 6,
            borderWidth: colors.isLight ? 0.8 : 1.6,
            borderColor: '#667B91',
            paddingHorizontal: 16,
            paddingVertical: 10,
            width: '100%',
            maxWidth: 290,
        },
        fileName: {
            flex: 1,
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
            marginHorizontal: 8,
        },
        error: {
            fontSize: 13,
            marginTop: 6,
            color: colors.danger.default,
            fontFamily: 'WorkSans-Medium',
        },
        modalContainer: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
        },
        modalContent: {
            width: "90%",
            height: "70%",
            backgroundColor: colors.constant.black,
            borderRadius: 12,
            padding: 10,
        },
        previewImage: {
            width: "100%",
            height: "100%",
        },
    });

export default FileUpload;
