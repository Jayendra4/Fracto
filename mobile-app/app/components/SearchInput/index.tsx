import React, { Activity } from "react";
import {
    View,
    TextInput,
    Pressable,
} from "react-native";
import { useTheme } from "../../util/theme";
import { createStyles } from "./SearchInput.style";
import Feather from "react-native-vector-icons/Feather";

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

const SearchInput: React.FC<Props> = ({
    value,
    onChangeText,
    placeholder,
}) => {
    const { colors, themeAppearance } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <Feather name="search" size={24} color={colors.icon.primary} />

            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.isLight ? colors.text.extraLight : colors.text.lightGrey}
                value={value}
                onChangeText={onChangeText}
                keyboardAppearance={themeAppearance}
            />

            <Activity mode={value ? "visible" : "hidden"}>
                <Pressable style={styles.empty} onPress={() => onChangeText("")}>
                    <Feather name="x" size={16} color={colors.icon.primary} />
                </Pressable>
            </Activity>
        </View>
    );
};

export default SearchInput;
