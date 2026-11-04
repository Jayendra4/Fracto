import { View, Text, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useTheme } from "../../util/theme";
import { createStyles } from "./UpiCard.style";
import CheckStarSuccess from "../../assets/icons/check-star-success.svg";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CustomSwitch from "../../util/CustomSwitch";
import { useUpiIdActiveApi } from "../../services/hooks/useApi";
import { UpiAccount } from "../../views/BankDetails";
import Toast from "react-native-toast-message";
import ConfirmationModal from "../Modals/AskConfirmation";

interface Props {
    upiDetails: UpiAccount;
    reFetchUpiIdList: () => void;
}

const UpiCard = ({
    upiDetails,
    reFetchUpiIdList
}: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { mutateAsync, isPending, error } = useUpiIdActiveApi();
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

    const toggleUpiIdStatus = useCallback(async (value?: boolean, isDelete?: boolean) => {
        try {
            await mutateAsync({
                upiAccountId: upiDetails?.id,
                payload: isDelete
                    ? { isDeleted: true }
                    : { isActive: value },
            })
            reFetchUpiIdList();
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: err?.message || error?.message || "Failed to change status",
            });
        }
    }, [mutateAsync, upiDetails?.id, error, reFetchUpiIdList]);

    return (
        <>
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text
                        style={styles.detail}
                        numberOfLines={1}
                    >
                        {upiDetails?.upiId}
                    </Text>

                    <View style={styles.verifiedRow}>
                        <Text style={styles.verified}>Verified</Text>
                        <CheckStarSuccess width={16} height={16} />
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.switchRow}>
                        <CustomSwitch
                            value={upiDetails?.isActive}
                            onValueChange={toggleUpiIdStatus}
                            disabled={isPending}
                            activeThumbColor={colors.background.default}
                        />
                        <Text style={styles.statusText}>
                            {upiDetails?.isActive ? "Active" : "Inactive"}
                        </Text>
                    </View>

                    <Pressable style={styles.removeBtn} onPress={() => setShowRemoveConfirmation(true)}>
                        <MaterialIcons name="delete-outline" size={24} color={colors.text.danger} />
                        <Text style={styles.removeText}>Remove UPI ID</Text>
                    </Pressable>
                </View>
            </View>

            <ConfirmationModal
                visible={showRemoveConfirmation}
                onClose={() => setShowRemoveConfirmation(false)}
                onConfirm={() => toggleUpiIdStatus(undefined, true)}
                title={"Remove UPI ID"}
                description={"Are you sure you want to remove this upiId?"}
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

export default UpiCard;