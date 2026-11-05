import { ActivityIndicator, Keyboard, Pressable, Text, View } from "react-native"
import { useTheme } from "../../util/theme";
import { createStyles } from "./AddMoneyToWallet.style";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import TextInputClassic from "../../components/TextInputClassic";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import { Formik } from "formik";
import { AddMoneySchema } from "../../util/formValidationSchema";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useGetBankAccountApi, useGetUpiIdApi } from "../../services/auth.service";
import { useCreateUpiIdApi, useInitiateDepositApi, useVerifyPaymentApi } from "../../services/hooks/useApi";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { refreshUser } from "../../store/authSlice";
import { PaymentMethodType } from "../../store/authSlice.types";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import AddBankAccountModal from "../../components/Modals/AddBankAccountModal";
import { formatAmountWithCommas } from "../../util/helper";

const defaultAmount = [
    { amount: "₹ 10,000", value: "10,000" },
    { amount: "₹ 50,000", value: "50,000" },
    { amount: "₹ 1,00,000", value: "1,00,000" },
]

const AddMoneyToWallet = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const routes = useRoute() as { params: { requiredAmount?: number; onAction?: () => void; } };
    const requiredAmount = routes?.params?.requiredAmount ?? null;
    const onAction = routes?.params?.onAction ?? null;
    const { data: upiData, refetch: refetchUpi } = useGetUpiIdApi();
    const { data: bankAccountData, refetch: refetchBankAccounts } = useGetBankAccountApi();
    const { mutateAsync, isPending, error: upiIdApiError } = useCreateUpiIdApi();
    const { mutateAsync: initiateDeposit } = useInitiateDepositApi();
    const { mutateAsync: verifyPayment } = useVerifyPaymentApi();
    const activeBankAccount = bankAccountData?.filter((bank: any) => bank?.isActive)?.[0];
    const activeUpiId = upiData?.filter((upi: any) => upi?.isActive)?.[0];
    const [showAddBank, setShowAddBank] = useState(false);
    const [haveRequiredAmount, setHaveRequiredAmount] = useState(!!requiredAmount);

    const [createRequestPending, setCreateRequestLoading] = useState(false);

    const initialValues = {
        amount: "",
        paymentMode: "" as PaymentMethodType,
        upiId: upiData?.[0]?.upiId as string ?? '',
    };

    useFocusEffect(
        useCallback(() => {
            refetchUpi();
            refetchBankAccounts();
        }, [refetchUpi, refetchBankAccounts])
    );

    const createUpiId = useCallback(async (upiId: string) => {
        const trimmedUpi = upiId.trim();

        try {
            await mutateAsync({ upiId: trimmedUpi });
            refetchUpi();
            dispatch(refreshUser());
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1:
                    err?.message ||
                    upiIdApiError?.message ||
                    "Invalid UPI ID",
            });
        }
    }, [mutateAsync, refetchUpi, dispatch, upiIdApiError]);

    const handleAddMoney = async (values: typeof initialValues) => {
        try {
            Keyboard.dismiss();
            setCreateRequestLoading(true);

            const initRes = await initiateDeposit({
                amount: Number(values.amount?.replace(/,/g, '')),
                methodType: values.paymentMode,
                bankAccountId: activeBankAccount?.id,
                upiAccountId: activeUpiId?.id,
            });

            const { requestId, orderId, amount, currency } = initRes?.data;

            const options = {
                key: "rzp_test_SE2xCevA4T6YbJ",
                amount: amount,
                currency: currency,
                name: "Fracto",
                description: "Wallet Deposit",
                order_id: orderId,
                prefill: {
                    name: userDetails?.firstname,
                    email: userDetails?.email,
                    contact: userDetails?.mobile,
                },
                theme: { color: "#4F86C0" },
            };

            const paymentData = await RazorpayCheckout.open(options);

            const verifyRes = await verifyPayment({
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
                purchase_payment_id: requestId,
            });

            if (verifyRes?.status) {
                navigation.replace(Routes.BANNER.SUCCESS, {
                    title: "Payment Successful",
                    subText: "Money will reflect shortly in your wallet.",
                    onForward: wayToFunds,
                });
            }
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: error?.message || "Payment Request Failed",
            });
        } finally {
            setCreateRequestLoading(false);
        }
    };

    const wayToFunds = useCallback(() => {
        if (onAction) return onAction();
        navigation.replace(Routes.TABS.HOME, {
            screen: Routes.TABS.FUNDS,
        });
    }, [navigation, onAction]);

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
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={AddMoneySchema}
                            onSubmit={(values) => handleAddMoney(values)}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                submitCount,
                                setFieldValue,
                                handleSubmit,
                                validateField,
                                setFieldTouched,
                            }) => {
                                const isDisabled =
                                    !values.amount || !values.paymentMode || (values.paymentMode === PaymentMethodType.BANK ?
                                        !activeBankAccount : !activeUpiId
                                    );

                                return (
                                    <View style={styles.moneyWrapper}>
                                        <View style={styles.header}>
                                            <Text style={styles.title}>Add Money to Wallet</Text>
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
                                                error={(touched.amount || submitCount > 0) ? errors.amount : undefined}
                                                keyboardType="numeric"
                                                labelStyle={styles.labelInput}
                                                style={styles.inputField}
                                                inputStyle={styles.inputText}
                                                required
                                                activateMini
                                            />

                                            {haveRequiredAmount && (
                                                <Text
                                                    style={styles.requiredAmountText}
                                                    onPress={() => {
                                                        setFieldValue("amount", formatAmountWithCommas(requiredAmount))
                                                        setHaveRequiredAmount(false);
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    Add ₹{formatAmountWithCommas(requiredAmount)} to wallet
                                                </Text>
                                            )}

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
                                                                    <Text style={styles.accountHolderName}>{activeBankAccount?.accountHolderName}</Text>
                                                                </View>
                                                            ) : (
                                                                <Text style={styles.accountHolderName}>
                                                                    Please activate your bank account
                                                                </Text>
                                                            )) : null}
                                                    </View>
                                                </Pressable>

                                                <Pressable
                                                    style={styles.radioRow}
                                                    onPress={() => setFieldValue("paymentMode", "UPI")}
                                                >
                                                    <View
                                                        style={[
                                                            styles.radio,
                                                            values.paymentMode === PaymentMethodType.UPI && styles.radioSelected,
                                                        ]}
                                                    >
                                                        {values.paymentMode === PaymentMethodType.UPI && (
                                                            <View style={styles.innerRadio} />
                                                        )}
                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <Text
                                                            style={[
                                                                styles.radioTitle,
                                                                values.paymentMode === PaymentMethodType.UPI && styles.radioTitleSelected,
                                                            ]}
                                                        >
                                                            UPI
                                                        </Text>

                                                        {values.paymentMode === PaymentMethodType.UPI ? (
                                                            upiData?.length === 0 ? (
                                                                <>
                                                                    <TextInputClassic
                                                                        placeholder="Enter UPI ID"
                                                                        value={values.upiId}
                                                                        onChangeText={(text) => setFieldValue("upiId", text.toLowerCase())}
                                                                        error={
                                                                            (touched.upiId || submitCount > 0)
                                                                                ? errors.upiId
                                                                                : undefined
                                                                        }
                                                                        labelStyle={styles.labelInput}
                                                                        style={[styles.inputField, { marginTop: 8 }]}
                                                                        inputStyle={styles.inputText}
                                                                        activateMini
                                                                    />

                                                                    <Pressable
                                                                        style={styles.verifyButton}
                                                                        onPress={async () => {
                                                                            setFieldTouched("upiId", true, true);
                                                                            await validateField("upiId");

                                                                            if (!errors.upiId && values.upiId) {
                                                                                createUpiId(values.upiId);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isPending ? (
                                                                            <ActivityIndicator color={colors.constant.white} />
                                                                        ) : (
                                                                            <Text style={styles.verifyText}>Verify</Text>
                                                                        )}
                                                                    </Pressable>
                                                                </>
                                                            ) : activeUpiId ? (
                                                                <View style={styles.upiWrapper}>
                                                                    <Text style={styles.upiId}>
                                                                        UPI - {activeUpiId?.upiId}
                                                                    </Text>
                                                                    <Text style={styles.verifiedUpi}>Verified UPI</Text>
                                                                </View>
                                                            ) : (
                                                                <Text style={styles.accountHolderName}>Please activate your UPI ID</Text>
                                                            )
                                                        ) : null}
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

export default AddMoneyToWallet;