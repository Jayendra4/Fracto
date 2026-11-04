import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Colors, useTheme } from "../../util/theme";

const AddBankAccount = ({ action }: { action: () => void }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.wrapper}>
            <View style={styles.content}>
                <Text style={styles.title}>Add Your Bank Account</Text>
                <Text style={styles.subtitle}>
                    To start your investment journey we need to add bank account, please add your bank account.
                </Text>
            </View>

            <Pressable style={styles.button} onPress={action}>
                <Text style={styles.buttonText}>+ Add Now</Text>
            </Pressable>
        </View>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        wrapper: {
            backgroundColor: "#F5F5F51A",
            borderWidth: 0.8,
            borderColor: colors.border.primary,
            minHeight: 77,
            paddingVertical: 8,
            marginHorizontal: 16,
            paddingHorizontal: 16,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        content: {
            flex: 1,
            paddingRight: 12,
        },
        title: {
            fontSize: 20,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.default,
        },
        subtitle: {
            fontSize: 10,
            color: colors.text.extraLight,
            fontFamily: 'WorkSans-Regular',
        },
        button: {
            borderRadius: 3,
            width: 85,
            height: 29,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.constant.white,
            borderWidth: colors.isLight ? 1 : 0,
            borderColor: colors.border.default,
        },
        buttonText: {
            fontSize: 11,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.darkBlue,
        },
    });

export default AddBankAccount;
