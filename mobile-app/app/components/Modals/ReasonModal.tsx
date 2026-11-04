import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Image,
    Pressable,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colors, useTheme } from "../../util/theme";
import TextInputClassic from "../TextInputClassic";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import { Formik } from "formik";
import { reasonModalSchema } from "../../util/formValidationSchema";
import { useGetPropertyDetailIcons } from "../../services/auth.service";
import { useFocusEffect } from "@react-navigation/native";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: any;
    usedIcons: string[];
}

const fields = ["icon", "title", "description"];

const ReasonModal = ({ visible, onClose, onSave, initialData, usedIcons = [] }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { data: icons } = useGetPropertyDetailIcons();

    const [icon, setIcon] = useState<any>({});

    const availableIcons = useMemo(() => {
        if (!icons) return [];

        return icons.filter((iconItem: any) => {
            const isUsed = usedIcons?.includes(iconItem?.id);

            if (initialData?.icon?.id === iconItem?.id) return true;

            return !isUsed;
        });
    }, [icons, usedIcons, initialData]);

    useFocusEffect(
        useCallback(() => {
            if (initialData?.icon) {
                setIcon(initialData.icon);
            } else if (availableIcons?.length > 0) {
                setIcon(availableIcons[0]);
            }
        }, [initialData, availableIcons])
    )

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={[styles.container, { backgroundColor: colors.background.slightly }]}>

                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {initialData ? "Edit Reason" : "Add Reason"}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={18} color={colors.icon.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <Formik
                        initialValues={{
                            title: initialData?.title || "",
                            description: initialData?.description || "",
                        }}
                        validationSchema={reasonModalSchema}
                        enableReinitialize
                        onSubmit={(values, { resetForm }) => {
                            if (!icon?.id) return;
                            onSave({
                                id: new Date().getTime().toString(),
                                icon,
                                title: values.title.trim(),
                                description: values.description.trim(),
                            });

                            resetForm();
                            setIcon(icons[0]);
                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                        }) => (
                            <FlatList
                                data={fields}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={[styles.inputs, styles.scrollContent]}
                                renderItem={({ item }) => {
                                    switch (item) {
                                        case "icon":
                                            return (
                                                <View>
                                                    <Text style={styles.label}>Select Icon</Text>
                                                    <FlatList
                                                        data={availableIcons}
                                                        horizontal
                                                        showsHorizontalScrollIndicator={false}
                                                        keyExtractor={(item) => item?.id?.toString()}
                                                        contentContainerStyle={{ gap: 10 }}
                                                        renderItem={({ item: iconItem }) => (
                                                            <Pressable
                                                                style={[
                                                                    styles.iconItem,
                                                                    icon?.id === iconItem?.id && styles.iconSelected,
                                                                ]}
                                                                onPress={() => setIcon(iconItem)}
                                                            >
                                                                <Image
                                                                    source={{ uri: iconItem?.url }}
                                                                    style={styles.icon}
                                                                    resizeMode="cover"
                                                                />
                                                            </Pressable>
                                                        )}
                                                    />
                                                </View>
                                            );

                                        case "title":
                                            return (
                                                <TextInputClassic
                                                    label="Title"
                                                    placeholder="Enter title"
                                                    value={values.title}
                                                    onChangeText={handleChange("title")}
                                                    onBlur={handleBlur("title")}
                                                    error={
                                                        typeof errors.title === "string" &&
                                                            touched.title ? errors.title
                                                            : undefined
                                                    }
                                                    labelStyle={styles.labelInput}
                                                    style={styles.inputField}
                                                    inputStyle={styles.inputText}
                                                    required
                                                    activateMini
                                                />
                                            );

                                        case "description":
                                            return (
                                                <TextInputClassic
                                                    label="Description"
                                                    placeholder="Enter description"
                                                    value={values.description}
                                                    onChangeText={handleChange("description")}
                                                    onBlur={handleBlur("description")}
                                                    error={
                                                        typeof errors.description === "string" &&
                                                            touched.description ? errors.description
                                                            : undefined
                                                    }
                                                    labelStyle={styles.labelInput}
                                                    style={[styles.inputField, { height: 90, alignItems: 'flex-start' }]}
                                                    inputStyle={styles.inputText}
                                                    required
                                                    activateMini
                                                    multiline
                                                />
                                            );

                                        default:
                                            return null;
                                    }
                                }}
                                ListFooterComponent={
                                    <ButtonPrimary
                                        title={
                                            initialData ? ButtonTextTypes.Edit : ButtonTextTypes.Add
                                        }
                                        width={ButtonWidthTypes.Half}
                                        align={ButtonAlignTypes.Right}
                                        buttonStyle={styles.buttonStyle}
                                        textStyle={styles.textStyles}
                                        onPress={handleSubmit}
                                    />
                                }
                            />
                        )}
                    </Formik>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ReasonModal;

const createStyles = (colors: Colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        borderRadius: 8,
        padding: 16,
    },
    heading: {
        fontSize: 18,
        marginBottom: 12,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
    },
    label: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 8,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
    },
    icon: { width: 28, height: 28 },
    iconItem: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: colors.isLight ? colors.background.surface : '#2c2c2e',
    },
    iconSelected: {
        borderWidth: 1,
        borderColor: colors.border.prime,
    },
    labelInput: {
        fontFamily: 'WorkSans-Medium',
        fontSize: 14,
        color: colors.text.default,
        marginBottom: 6,
    },
    inputs: {
        rowGap: 20,
    },
    scrollContent: {
        paddingBottom: 10,
    },
    inputField: {
        borderWidth: 1,
        height: 40,
        borderRadius: 4,
    },
    inputText: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
        color: colors.text.default
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 15,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    divider: {
        width: '100%',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#343F4B',
        marginVertical: 14,
    },
    buttonStyle: {
        borderRadius: 8,
        height: 34,
    },
    textStyles: {
        fontSize: 14,
    },
});