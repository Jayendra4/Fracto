import React, { useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colors, useTheme } from "../../util/theme";

const propertyTypes = ["Industrial", "Commercial", "Retail", "Residential"];

interface Props {
    visible: boolean;
    onClose: () => void;
    newlyAdded: boolean;
    propertyType: string | null;
    setNewlyAdded: (value: boolean) => void;
    setPropertyType: (value: string) => void;
}

const ListingFilter = ({
    visible,
    onClose,
    newlyAdded,
    propertyType,
    setNewlyAdded,
    setPropertyType,
}: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [expanded, setExpanded] = useState(false);

    const animation = useRef(new Animated.Value(0)).current;

    const toggleExpand = () => {
        Animated.timing(animation, {
            toValue: expanded ? 0 : 1,
            duration: 250,
            useNativeDriver: false,
        }).start();

        setExpanded(!expanded);
    };

    const heightInterpolation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, propertyTypes.length * 40],
    });

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.popup}>
                    <Pressable
                        style={styles.item}
                        onPress={() => {
                            setNewlyAdded(!newlyAdded);
                            onClose();
                        }}
                    >
                        {
                            newlyAdded ?
                                <Feather name="minus" size={16} color={colors.icon.primary} /> :
                                <Feather name="plus" size={16} color={colors.icon.primary} />
                        }
                        <Text style={styles.text}>Newly added</Text>
                    </Pressable>

                    <Pressable
                        style={styles.header}
                        onPress={toggleExpand}
                    >
                        <Text style={styles.headerText}>Property type</Text>
                        <Feather
                            name={expanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={colors.icon.primary}
                        />
                    </Pressable>

                    <Animated.View style={{ overflow: "hidden", height: heightInterpolation }}>
                        {propertyTypes.map((item) => {
                            const active = propertyType === item;

                            return (
                                <Pressable
                                    key={item}
                                    style={styles.item}
                                    onPress={() => {
                                        setPropertyType(active ? "" : item)
                                        onClose();
                                    }}
                                >
                                    {
                                        active ?
                                            <Feather name="minus" size={16} color={colors.icon.primary} /> :
                                            <Feather name="plus" size={16} color={colors.icon.primary} />
                                    }
                                    <Text style={styles.text}>{item}</Text>
                                </Pressable>
                            );
                        })}
                    </Animated.View>

                    <View style={styles.divider} />

                    <Pressable
                        style={styles.clearBtn}
                        onPress={() => {
                            setNewlyAdded(false);
                            setPropertyType("");
                            onClose();
                        }}
                    >
                        <Text style={styles.clearText}>Clear filter</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default ListingFilter;

const createStyles = (colors: Colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    popup: {
        width: "75%",
        backgroundColor: colors.background.default,
        borderRadius: 8,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerText: {
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    text: {
        fontSize: 14,
        color: colors.text.default,
        fontFamily: 'WorkSans-Medium',
    },
    divider: {
        height: 0.5,
        backgroundColor: colors.text.extraLight,
        marginVertical: 6,
    },
    clearBtn: {
        alignItems: "center",
        paddingVertical: 10,
    },
    clearText: {
        color: colors.isLight ? colors.text.darkYellow : colors.text.yellow,
        fontFamily: 'WorkSans-Medium',
        fontSize: 14,
    },
});