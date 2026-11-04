import { View, Text, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useTheme } from "../../util/theme";
import { createStyles } from "./BankCard.style";
import CheckStarSuccess from "../../assets/icons/check-star-success.svg";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CustomSwitch from "../../util/CustomSwitch";
import { useBankAccountActiveApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import { BankAccount } from "../../views/BankDetails";
import ConfirmationModal from "../Modals/AskConfirmation";

interface Props {
    bankDetails: BankAccount;
    reFetchBankAccountList: () => void;
}

const BankCard = ({ bankDetails, reFetchBankAccountList }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { mutateAsync, isPending, error } = useBankAccountActiveApi();
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [showAccountNumber, setShowAccountNumber] = useState(false);

    const toggleBankStatus = useCallback(async (value?: boolean, isDelete?: boolean) => {
        try {
            await mutateAsync({
                bankId: bankDetails?.id,
                payload: isDelete
                    ? { isDeleted: true }
                    : { isActive: value },
            })
            reFetchBankAccountList();
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || error?.message || "Failed to change status",
            });
        }
    }, [mutateAsync, bankDetails?.id, error, reFetchBankAccountList]);

    return (
        <>
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text
                        style={styles.bankName}
                        numberOfLines={1}
                    >
                        {bankDetails?.bankName}
                    </Text>

                    <View style={styles.verifiedRow}>
                        <Text style={styles.verified}>Verified</Text>
                        <CheckStarSuccess width={16} height={16} />
                    </View>
                </View>

                <Text style={styles.detail}>{bankDetails?.accountHolderName}</Text>
                <View style={styles.accountWrapper}>
                    <Text style={styles.detail}>
                        Account No:{" "}
                        {showAccountNumber
                            ? bankDetails?.accountNumber
                            : `****${bankDetails?.accountNumber?.slice(-4)}`}
                    </Text>

                    <Pressable
                        onPress={() => setShowAccountNumber(prev => !prev)}
                        style={styles.spaceLeft}
                    >
                        <MaterialIcons
                            name={showAccountNumber ? "visibility-off" : "visibility"}
                            size={18}
                            color={colors.text.default}
                            style={{ opacity: 0.8 }}
                        />
                    </Pressable>
                </View>
                <Text style={styles.detail}>IFSC: {bankDetails?.ifscCode}</Text>

                <View style={styles.bottomRow}>
                    <View style={styles.switchRow}>
                        <CustomSwitch
                            value={bankDetails?.isActive}
                            onValueChange={toggleBankStatus}
                            disabled={isPending}
                            activeThumbColor={colors.background.default}
                        />
                        <Text style={styles.statusText}>
                            {bankDetails?.isActive ? "Active" : "Inactive"}
                        </Text>
                    </View>

                    <Pressable style={styles.removeBtn} onPress={() => setShowRemoveConfirmation(true)}>
                        <MaterialIcons name="delete-outline" size={24} color={colors.text.danger} />
                        <Text style={styles.removeText}>Remove Account</Text>
                    </Pressable>
                </View>
            </View>

            <ConfirmationModal
                visible={showRemoveConfirmation}
                onClose={() => setShowRemoveConfirmation(false)}
                onConfirm={() => toggleBankStatus(undefined, true)}
                title={"Remove Account"}
                description={"Are you sure you want to remove this account?"}
                confirmText={"Remove"}
                cancelText={"Cancel"}
                loading={isPending}
                confirmColor={colors.text.danger}
                cancelColor={colors.text.default}
                backgroundColor={colors.background.default}
                textColor={colors.text.default}
                borderColor={colors.border.lightGrey}
            />
        </>
    );
};

export default BankCard;