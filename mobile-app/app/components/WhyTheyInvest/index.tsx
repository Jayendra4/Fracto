import React, { useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { useTheme } from '../../util/theme'
import { createStyles } from './WhyTheyInvest.style';
import Feather from "react-native-vector-icons/Feather";
import HelpModal from '../Modals/HelpModal';
import ReasonModal from '../Modals/ReasonModal';

interface Props {
    value: any[];
    onChange: (val: any[]) => void;
    error?: string;
}

const WhyTheyInvest: React.FC<Props> = ({ value, onChange, error }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [helpVisible, setHelpVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const valueLength = value?.length || 0;
    const usedIcons = value?.map((item) => item.icon?.id) || [];

    const handleSave = (data: any) => {
        if (editingIndex !== null) {
            const updated = [...value];
            updated[editingIndex] = data;
            onChange(updated);
        } else {
            onChange([...value, data]);
        }

        setModalVisible(false);
        setEditingIndex(null);
    };

    const handleRemove = (id: string) => {
        onChange(value?.filter((item) => item.id !== id));
    };

    return (
        <>
            <View style={{ flex: 1 }}>
                <View style={styles.labelWrapper}>
                    <Text style={styles.sectionTitle}>
                        Why they invested on this property
                        <Text style={styles.required}> *</Text>
                    </Text>
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
                </View>

                <View style={styles.container}>
                    <Text style={styles.counter}>
                        {valueLength} of 4 added
                    </Text>

                    <View style={styles.cardsWrapper}>
                        {value?.map((item: any, index: number) => (
                            <Pressable
                                key={index}
                                style={styles.card}
                                onPress={() => {
                                    setEditingIndex(index);
                                    setModalVisible(true);
                                }}
                            >
                                <Image
                                    source={{ uri: item?.icon?.url }}
                                    style={styles.icon}
                                    resizeMode="cover"
                                />
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDesc} numberOfLines={2}>
                                    {item.description}
                                </Text>

                                <Pressable
                                    style={styles.removeButton}
                                    onPress={() => handleRemove(item.id)}
                                >
                                    <Feather name="x" size={14} color={colors.constant.white} />
                                </Pressable>
                            </Pressable>
                        ))}
                    </View>
                    {valueLength < 4 && (
                        <Pressable
                            style={styles.addCard}
                            onPress={() => {
                                setEditingIndex(null);
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.addReason}>Add Reason</Text>
                        </Pressable>
                    )}
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
            </View>

            <HelpModal
                visible={helpVisible}
                text={"Why they invested on this property"}
                onClose={() => setHelpVisible(false)}
            />

            <ReasonModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingIndex(null);
                }}
                onSave={handleSave}
                initialData={
                    editingIndex !== null ? value[editingIndex] : null
                }
                usedIcons={usedIcons}
            />
        </>
    )
}

export default WhyTheyInvest
