import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import ButtonSecondary from "../buttons/ButtonSecondary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { Colors, useTheme } from "../../util/theme";
import { Asset } from "react-native-image-picker";
import UploadIcon from "../../assets/icons/upload.svg";
import UploadLightIcon from "../../assets/icons/upload-light.svg";
import { pickDocumentFile } from "../../util/fileUploadHelper";
import { useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import HelpModal from "../Modals/HelpModal";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useNavigation } from "@react-navigation/native";

interface DocumentRowProps {
    label?: string;
    required?: boolean;
    value: any;
    onUpload: (data?: Asset[]) => void;
    onView: () => void;
    error?: string;
    disabled?: boolean;
    helpText?: string;
}

export const renderLabel = (text: string) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const regex = /\((.*?)\)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <Text
                    key={index}
                    style={styles.lightLabel}
                >
                    ({part})
                </Text>
            );
        }

        return (
            <Text key={index}>
                {part}
            </Text>
        );
    });
};

const DocumentRow: React.FC<DocumentRowProps> = ({
    label,
    required,
    value,
    onUpload,
    error,
    disabled,
    helpText,
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { navigate } = useNavigation<NavigationProp>();
    const [modalVisible, setModalVisible] = useState(false);
    const [helpVisible, setHelpVisible] = useState(false);

    const handleView = () => {
        if (value?.uri) {
            setModalVisible(true);
        }
    };

    return (
        <>
            <View style={styles.documentRow}>
                {label && (
                    <View style={styles.labelWrapper}>
                        <Text style={styles.documentLabel}>
                            {renderLabel(label)}
                            {required && <Text style={styles.required}> *</Text>}{"  "}
                            <Feather
                                name="headphones"
                                size={18}
                                color={colors.text.extraLight}
                                onPress={() => navigate(Routes.ONBOARDINGTAB.VENDORLIST)}
                            />
                            {helpText && (
                                <Text onPress={() => setHelpVisible(true)}>
                                    {"  "}
                                    <Feather
                                        name="info"
                                        size={18}
                                        color={colors.text.extraLight}
                                    />
                                </Text>
                            )}
                        </Text>
                    </View>
                )}

                <View>
                    <View style={styles.documentActions}>
                        {value?.uri ? (
                            <View style={styles.previewWrapper}>
                                <Text
                                    style={styles.previewName}
                                    numberOfLines={1}
                                >
                                    {value?.name}
                                </Text>
                                <Pressable
                                    style={styles.removeButton}
                                    onPress={() => onUpload(undefined)}
                                >
                                    <Feather name="x" size={16} color={colors.constant.white} />
                                </Pressable>
                            </View>
                        ) : (
                            <ButtonSecondary
                                title={ButtonTextTypes.Upload}
                                width={ButtonWidthTypes.Medium}
                                align={ButtonAlignTypes.Center}
                                onPress={() => pickDocumentFile(onUpload)}
                                disabled={!!disabled}
                                icon={colors.isLight ? UploadLightIcon : UploadIcon}
                                buttonStyle={styles.uploadButton}
                                textStyle={styles.buttonText}
                            />
                        )}

                        <ButtonPrimary
                            title={ButtonTextTypes.View}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Center}
                            onPress={handleView}
                            disabled={!value?.uri}
                            buttonStyle={{ borderRadius: 6, height: 42 }}
                            style={styles.viewButton}
                            textStyle={styles.buttonText}
                        />
                    </View>
                    {error && <Text style={styles.error}>{error}</Text>}
                </View>

                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={28} color={colors.icon.danger} />
                            </Pressable>
                            {value?.uri && (
                                <Image
                                    source={{ uri: value?.uri }}
                                    style={styles.previewImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </View>
                </Modal>
            </View>

            <HelpModal
                visible={helpVisible}
                text={helpText}
                onClose={() => setHelpVisible(false)}
            />
        </>
    )
};

const createStyles = (colors: Colors) => StyleSheet.create({
    documentRow: {
        rowGap: 10,
    },
    documentLabel: {
        fontSize: 16,
        color: colors.text.default,
        fontFamily: "WorkSans-Medium",
        lineHeight: 22,
    },
    lightLabel: {
        fontFamily: 'WorkSans-Regular',
        color: colors.text.lightGrey,
    },
    required: {
        color: colors.danger.default,
    },
    documentActions: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    uploadButton: {
        borderRadius: 6,
        borderColor: "#3D3D3D",
        width: '49%',
        height: 42,
    },
    viewButton: {
        width: '49%',
    },
    buttonText: {
        fontSize: 16,
    },
    previewWrapper: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#3D3D3D",
        width: '49%',
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    previewName: {
        color: colors.text.default,
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
    },
    error: {
        fontSize: 13,
        color: colors.danger.default,
        marginTop: 6,
        fontFamily: 'WorkSans-Medium',
    },
    modalOverlay: {
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
        flex: 1,
        borderRadius: 8,
        width: "100%",
    },
    closeButton: {
        alignSelf: "flex-end",
        padding: 6,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 18,
        height: 18,
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
})

export default DocumentRow;