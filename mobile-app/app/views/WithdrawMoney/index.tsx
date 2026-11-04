import { Pressable, Text, View } from "react-native"
import { useTheme } from "../../util/theme";
import { createStyles } from "./WithdrawMoney.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import { WithdrawMoneySchema } from "../../util/formValidationSchema";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PropertyHeader from "../../components/Property/PropertyHeader";
import TextInputClassic from "../../components/TextInputClassic";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import { useGetBankAccountApi, useUserWalletApi } from "../../services/auth.service";
import { useCallback, useState } from "react";
import { PaymentMethodType } from "../../store/authSlice.types";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { usePayoutRequestApi } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import AddBankAccountModal from "../../components/Modals/AddBankAccountModal";
import { formatAmountWithCommas } from "../../util/helper";

const defaultAmount = [
    { amount: "₹ 10,000", value: "10,000" },
    { amount: "₹ 50,000", value: "50,000" },
    { amount: "₹ 100,000", value: "1,00,000" },
]

const WithdrawMoney = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const { data: bankAccountData, refetch: refetchBankAccounts } = useGetBankAccountApi();
    const { mutateAsync: createPaymentRequest, isPending: createRequestPending, error: createRequestError } = usePayoutRequestApi();
    const { data: wallet, refetch: refetchWallet } = useUserWalletApi();
    const activeBankAccount = bankAccountData?.filter((bank: any) => bank?.isActive)?.[0];
    const [showAddBank, setShowAddBank] = useState(false);
    const walletBalance = Number(wallet?.amount || 0);
    const lockedAmount = 5000;
    const withdrawAmount = walletBalance - lockedAmount;

    const initialValues = {
        amount: "",
        paymentMode: "" as PaymentMethodType,
    };

    useFocusEffect(
        useCallback(() => {
            refetchBankAccounts();
            refetchWallet();
        }, [refetchBankAccounts, refetchWallet])
    );

    const handleWithdraw = useCallback(async (values: typeof initialValues) => {
        try {
            await createPaymentRequest({
                amount: Number(values.amount?.replace(/,/g, '')),
                methodType: values.paymentMode,
                fundAccountId: activeBankAccount?.fundAccountId,
                bankAccountId: activeBankAccount?.id,
            });

            navigation.navigate(Routes.BANNER.SUCCESS, {
                title: "Request Submitted",
                subText: "Your withdraw request has been submitted successfully.",
                onForward: wayToFunds,
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1:
                    err?.message ||
                    createRequestError?.message ||
                    "Invalid Request",
            });
        }
    }, [
        createPaymentRequest,
        createRequestError,
        activeBankAccount,
        navigation,
    ]);

    const wayToFunds = useCallback(() => {
        navigation.replace(Routes.TABS.HOME, {
            screen: Routes.TABS.FUNDS,
        });
    }, [navigation]);

    return (
        <>
            <SafeAreaView style={styles.root}>
                <View style={styles.container}>
                    <PropertyHeader enableBack />
                    <KeyboardAwareScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="none"
                        enableAutomaticScroll
                        showsVerticalScrollIndicator={false}
                    >
                        <Formik
                            initialValues={initialValues}
                            validationSchema={WithdrawMoneySchema}
                            onSubmit={(values) => handleWithdraw(values)}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                submitCount,
                                setFieldValue,
                                handleSubmit,
                            }) => {
                                const isInsufficient = Number(values.amount?.replace(/,/g, '')) > withdrawAmount;
                                const isDisabled =
                                    !values.amount ||
                                    !values.paymentMode ||
                                    !activeBankAccount ||
                                    isInsufficient

                                return (
                                    <View style={styles.moneyWrapper}>
                                        <View style={styles.header}>
                                            <Text style={styles.title}>Withdraw Money from Wallet</Text>
                                            <Text style={styles.subtitle}>
                                                We need to add your bank account to start your investment journey!
                                            </Text>
                                        </View>

                                        <View style={styles.divider} />

                                        <View style={styles.inputs}>
                                            <TextInputClassic
                                                label="Amount"
                                                placeholder="Enter The Amount"
                                                value={values.amount}
                                                onChangeText={(text) => {
                                                    const cleaned = text?.replace(/,/g, '')?.replace(/[^\d]/g, '');

                                                    if (!cleaned) {
                                                        setFieldValue("amount", "");
                                                        return;
                                                    }

                                                    const formatted = formatAmountWithCommas(cleaned);
                                                    setFieldValue("amount", formatted);
                                                }}
                                                keyboardType="numeric"
                                                error={(touched.amount || submitCount > 0) ? errors.amount : undefined}
                                                labelStyle={styles.labelInput}
                                                style={styles.inputField}
                                                inputStyle={styles.inputText}
                                                required
                                                activateMini
                                            />

                                            <View style={styles.balanceWrapper}>
                                                <Text style={styles.balance}>
                                                    Wallet balance: ₹{formatAmountWithCommas(walletBalance)}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.withdrawAmount,
                                                        isInsufficient && styles.danger,
                                                    ]}
                                                >
                                                    ₹{formatAmountWithCommas(lockedAmount)} is locked. You can withdraw up to ₹{formatAmountWithCommas(withdrawAmount)}
                                                </Text>
                                            </View>

                                            <View style={styles.defaultAmountRow}>
                                                {defaultAmount.map((data) => (
                                                    <Pressable
                                                        key={data.value}
                                                        onPress={() => setFieldValue("amount", data.value)}
                                                        style={[
                                                            styles.amount,
                                                            values.amount === data.value
                                                                ? styles.selectedAmount
                                                                : styles.deselectedAmount,
                                                        ]}
                                                    >
                                                        <Text style={styles.amountText}>+ {data.amount}</Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                        </View>

                                        <View style={styles.section}>
                                            <View style={styles.paymentMode}>
                                                <Pressable
                                                    style={styles.radioRow}
                                                    onPress={() => setFieldValue("paymentMode", "BANK")}
                                                >
                                                    <View
                                                        style={[
                                                            styles.radio,
                                                            values.paymentMode === PaymentMethodType.BANK && styles.radioSelected,
                                                        ]}
                                                    >
                                                        {values.paymentMode === PaymentMethodType.BANK && (
                                                            <View style={styles.innerRadio} />
                                                        )}
                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <Text
                                                            style={[
                                                                styles.radioTitle,
                                                                values.paymentMode === PaymentMethodType.BANK && styles.radioTitleSelected,
                                                            ]}
                                                        >
                                                            Bank Account
                                                        </Text>
                                                        {activeBankAccount && (
                                                            <Text style={styles.radioSubtitle}>
                                                                Money will be credited to this bank account.
                                                            </Text>
                                                        )}

                                                        {values.paymentMode === PaymentMethodType.BANK ? (
                                                            bankAccountData?.length === 0 ? (
                                                                <Text
                                                                    style={styles.addAccountText}
                                                                    onPress={() => setShowAddBank(true)}
                                                                >
                                                                    Add Bank Account
                                                                </Text>
                                                            ) : activeBankAccount ? (
                                                                <View style={styles.bankWrapper}>
                                                                    <View style={styles.nameRow}>
                                                                        <Text
                                                                            style={[styles.bankName, styles.allowShrink]}
                                                                            numberOfLines={1}
                                                                        >
                                                                            {activeBankAccount?.bankName}
                                                                        </Text>
                                                                        <Text style={styles.bankName}>
                                                                            {" "}- ****{activeBankAccount?.accountNumber.slice(-4)}
                                                                        </Text>
                                                                    </View>
                                                                    <Text style={styles.bankHolderName}>{activeBankAccount?.accountHolderName}</Text>
                                                                </View>
                                                            ) : (
                                                                <Text style={styles.bankHolderName}>
                                                                    Please activate your bank account
                                                                </Text>
                                                            )) : null}
                                                    </View>
                                                </Pressable>
                                            </View>

                                            {(touched.paymentMode || submitCount > 0) && errors.paymentMode && (
                                                <Text style={styles.errorText}>{errors.paymentMode}</Text>
                                            )}
                                        </View>

                                        <ButtonPrimary
                                            title={ButtonTextTypes.Proceed_to_Payment}
                                            width={ButtonWidthTypes.Full}
                                            align={ButtonAlignTypes.Left}
                                            buttonStyle={styles.buttonStyles}
                                            textStyle={styles.textStyles}
                                            disabled={isDisabled}
                                            loading={createRequestPending}
                                            onPress={handleSubmit}
                                        />
                                    </View>
                                );
                            }}
                        </Formik>
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>

            <AddBankAccountModal
                visible={showAddBank}
                onClose={() => setShowAddBank(false)}
                onAction={() => {
                    refetchBankAccounts();
                    navigation.goBack();
                }}
            />
        </>
    );
};

export default WithdrawMoney;