import {
    BackHandler,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colors, useTheme } from "../../util/theme";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../buttons/Button.types";
import { formatAmountWithCommas } from "../../util/helper";
import { useEffect, useState } from "react";

interface Props {
    visible: boolean;
    onClose: () => void;
    data: { walletAmount: string, commission: string },
    onSubmit: (amount: string) => void;
    isLoading: boolean;
}

const WithdrawRequest = ({ visible, onClose, data, onSubmit, isLoading }: Props) => {
    const { colors, themeAppearance } = useTheme();
    const styles = createStyles(colors);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    useEffect(() => {
        if (visible) {
            const backAction = () => {
                onClose();
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );

            return () => backHandler.remove();
        }
    }, [visible, onClose]);

    useEffect(() => {
        if (!visible) {
            setWithdrawAmount('');
        }
    }, [visible]);

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
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Withdraw Request</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={colors.icon.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.balanceCard}>
                        <View style={styles.balanceBlock}>
                            <Text style={styles.balanceLabel}>Commissions</Text>
                            <Text style={[styles.balanceValue, styles.green]}>
                                ₹{formatAmountWithCommas(data?.commission)}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.balanceBlock}>
                            <Text style={styles.balanceLabel}>Wallet</Text>
                            <Text style={[styles.balanceValue, styles.blue]}>
                                ₹{formatAmountWithCommas(data?.walletAmount)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Withdraw Amount</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            value="₹"
                            editable={false}
                            style={styles.startInput}
                        />
                        <TextInput
                            value={withdrawAmount}
                            placeholder="00.00"
                            onChangeText={setWithdrawAmount}
                            placeholderTextColor={colors.constant.black}
                            keyboardType="numeric"
                            style={styles.input}
                            keyboardAppearance={themeAppearance}
                        />
                    </View>

                    <Text style={styles.note}>
                        * This will move funds from your commission account to your Wallet
                    </Text>

                    <ButtonPrimary
                        title={ButtonTextTypes.Submit_Request}
                        width={ButtonWidthTypes.Full}
                        align={ButtonAlignTypes.Center}
                        buttonStyle={styles.button}
                        textStyle={styles.buttonText}
                        loading={isLoading}
                        disabled={withdrawAmount > data?.commission || !Number(withdrawAmount)}
                        onPress={() => onSubmit(withdrawAmount)}
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            width: "80%",
            borderRadius: 10,
            padding: 20,
            backgroundColor: colors.background.darkBlue,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
        },
        title: {
            fontSize: 16,
            fontFamily: "WorkSans-SemiBold",
            color: colors.text.default,
        },
        balanceCard: {
            flexDirection: "row",
            backgroundColor: "#F2F2F2",
            borderWidth: 1,
            borderColor: "#75757533",
            borderRadius: 5,
            paddingVertical: 10,
            marginBottom: 18,
        },
        balanceBlock: {
            flex: 1,
            alignItems: "center",
        },
        balanceLabel: {
            fontSize: 12,
            color: "#000000B2",
            fontFamily: "WorkSans-Medium",
            marginBottom: 6,
        },
        balanceValue: {
            fontSize: 16,
            fontFamily: "WorkSans-SemiBold",
        },
        divider: {
            width: 1,
            backgroundColor: "#75757533",
        },
        green: {
            color: colors.text.green,
        },
        blue: {
            color: colors.text.primary,
        },
        inputLabel: {
            fontSize: 12,
            color: colors.text.default,
            fontFamily: "WorkSans-Medium",
            marginBottom: 6,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: "#F2F2F2",
            borderRadius: 5,
            paddingHorizontal: 16,
            height: 42,
            marginBottom: 6,
            borderWidth: 1,
            borderColor: "#75757533",
        },
        startInput: {
            fontSize: 16,
            color: colors.constant.black,
            fontFamily: 'WorkSans-SemiBold',
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: colors.constant.black,
            fontFamily: 'WorkSans-SemiBold',
            textAlignVertical: 'center',
        },
        note: {
            fontSize: 10,
            color: colors.text.extraLight,
            fontFamily: "WorkSans-Medium",
            marginBottom: 20,
            paddingRight: 16,
        },
        button: {
            borderRadius: 0,
        },
        buttonText: {
            fontSize: 14,
        },
    });

export default WithdrawRequest;