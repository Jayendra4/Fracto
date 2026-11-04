import React from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';
import { Colors, useTheme } from '../../util/theme';

interface HelpModalProps {
    visible: boolean;
    text?: string;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({
    visible,
    text,
    onClose,
}) => {
    const { colors } = useTheme();

    const styles = createStyles(colors);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.container}>
                    <Text style={styles.text}>
                        {text}
                    </Text>
                </View>
            </Pressable>
        </Modal>
    );
};

export default HelpModal;

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            width: '80%',
            padding: 16,
            borderRadius: 12,
            backgroundColor: colors.background.primary,
        },
        text: {
            color: colors.constant.white,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
            lineHeight: 20,
        },
    });