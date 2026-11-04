import { Pressable, Text, View } from "react-native"
import { useTheme } from "../../util/theme";
import { createStyles } from "./SettingDrawer.style";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomSwitch from "../../util/CustomSwitch";

interface props {
    icon: any;
    title: string;
    action: () => void;
    isSwitch?: boolean;
}

const SettingDrawer = ({
    icon: Icon,
    title,
    action,
    isSwitch = false,
}: props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <Pressable
            onPress={action}
            style={({ pressed }) => [
                styles.wrapper,
                pressed && styles.keyPressed,
            ]}
        >
            <View style={styles.row}>
                <Icon width={16} height={16} />
                <Text
                    style={styles.title}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>
            </View>
            {isSwitch ? (
                <CustomSwitch
                    value={false}
                    onValueChange={action}
                    style={styles.switch}
                    thumbColor={styles.switch.borderColor}
                />
            ) : (
                <Ionicons name="chevron-forward" color={
                    colors.isLight ? colors.text.lightGrey : colors.constant.white
                } size={20} />
            )}
        </Pressable>
    );
};

export default SettingDrawer;