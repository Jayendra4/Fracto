import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleProp,
    TextStyle,
} from 'react-native';
import { useTheme } from '../../util/theme';
import { createstyles } from './Checkbox.style';
import Checked from "../../assets/icons/checked.svg";

interface Props {
    checked: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    labelStyle?: StyleProp<TextStyle>;
}

const Checkbox: React.FC<Props> = ({
    checked,
    onChange,
    label,
    labelStyle,
}) => {
    const { colors } = useTheme();
    const styles = createstyles(colors, checked);

    return (
        <Pressable
            style={styles.container}
            onPress={() => onChange(!checked)}
        >
            <View style={styles.box}>
                {checked && <Checked width={17} height={17} />}
            </View>

            {label && (
                <Text style={[styles.label, labelStyle]}>
                    {label}
                </Text>
            )}
        </Pressable>
    );
};

export default Checkbox;