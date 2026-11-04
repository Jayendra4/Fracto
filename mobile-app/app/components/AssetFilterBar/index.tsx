import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome6";
import { useTheme } from "../../util/theme";
import { createStyles } from "./AssetFilterBar.style";

const cities = ["Indore", "Bhopal", "Delhi", "Mumbai"];
const performanceOptions = ["High Performing", "Average", "Low Performing"];

type DropdownItem = string | { label: string; value: string };

interface DropdownProps {
    data: DropdownItem[];
    onSelect: (val: any) => void;
    onClose: () => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ data, onSelect, onClose }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <Modal transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.dropdown}>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => (typeof item === 'string' ? item : item.value)}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.dropdownItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.dropdownText}>
                                    {typeof item === 'string' ? item : item.label}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
            </Pressable>
        </Modal>
    );
};

const AssetFilterBar = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [showFilter, setShowFilter] = useState(false);
    const [city, setCity] = useState("Indore");
    const [performance, setPerformance] = useState("High Performing");

    const [cityOpen, setCityOpen] = useState(false);
    const [performanceOpen, setPerformanceOpen] = useState(false);

    return (
        <View style={styles.filterBar}>
            {showFilter && (
                <View style={styles.filterGroup}>
                    <Pressable
                        style={styles.dropdownTrigger}
                        onPress={() => setCityOpen(true)}
                    >
                        <Text style={styles.filterText}>{city}</Text>
                        <Feather name="chevron-down" size={16} color={colors.text.default} />
                    </Pressable>

                    <Pressable
                        style={styles.dropdownTrigger}
                        onPress={() => setPerformanceOpen(true)}
                    >
                        <Text style={styles.filterText}>{performance}</Text>
                        <Feather name="chevron-down" size={16} color={colors.text.default} />
                    </Pressable>
                </View>
            )}

            <Pressable
                style={styles.filterActionWrapper}
                onPress={() => setShowFilter(prev => !prev)}
            >
                <Text
                    style={[styles.filterAction, {
                        textDecorationLine: showFilter ? 'none' : 'underline',
                    }]}
                >
                    {showFilter ? "Clear Filter" : "Filter"}
                </Text>
                {showFilter ? (
                    <Feather name="x" size={16} color={colors.text.default} />
                ) : (
                    <FontAwesome name="sliders" size={14} color={colors.text.default} />
                )}
            </Pressable>

            {cityOpen && (
                <Dropdown
                    data={cities}
                    onSelect={setCity}
                    onClose={() => setCityOpen(false)}
                />
            )}

            {performanceOpen && (
                <Dropdown
                    data={performanceOptions}
                    onSelect={setPerformance}
                    onClose={() => setPerformanceOpen(false)}
                />
            )}
        </View>
    );
};

export default AssetFilterBar;