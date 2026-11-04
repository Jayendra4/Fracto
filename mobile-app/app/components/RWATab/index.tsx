import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, useTheme } from "../../util/theme";
import { useCallback } from "react";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { usePressScale } from "../../services/hooks/usePressScale";

const assetsSteps = [
    { step: "Step 1/3", title: "Asset Basic Information", subtitle: "Enter your Asset Basic Information to complete your company RWA form. It only takes a few minutes..." },
    { step: "Step 2/3", title: "Ownership & Title Details", subtitle: "Enter your ownership & title details to complete your company KYB form. It only takes a few minutes..." },
    { step: "Step 3/3", title: "Financial & Valuation Details", subtitle: "Provide Financial & Valuation Details. It only takes a few minutes..." },
]

const brokerSteps = [
    ...assetsSteps,
    { step: "Step 4/4", title: "Asset Onboarding", subtitle: "Complete asset onboarding form" },
];

const RWATab = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const historyAnim = usePressScale();
    const addAnim = usePressScale();
    const brokerAnim = usePressScale();

    const isBroker = userDetails?.type === "Broker"
    const steps = isBroker ? brokerSteps : assetsSteps;

    const wayToMasterRWA = useCallback(() => {
        navigation.navigate(Routes.ONBOARDINGTAB.MASTERRWA);
    }, [navigation]);

    const wayToRWAHistory = useCallback(() => {
        navigation.navigate(Routes.DASHBOARD.REALWORLDHISTORY);
    }, [navigation]);


    const wayToBrokerReferredAssets = () => {
        navigation.navigate(Routes.DASHBOARD.BROKER_REFERRED_ASSETS, {
            type: "broker",
        });
    };

    return (
        <View style={styles.container}>

            <View style={styles.divider} />
            <View style={styles.card}>
                <Text style={styles.title}>Manage Your Assets</Text>

                <Text style={styles.subtitle}>
                    Review your onboarded assets or submit additional RWA forms below.
                </Text>

                <View style={styles.buttonRow}>
                    {!isBroker && (
                        <Pressable
                            style={styles.button}
                            onPress={wayToBrokerReferredAssets}
                            onPressIn={brokerAnim.onPressIn}
                            onPressOut={brokerAnim.onPressOut}
                        >
                            <Ionicons name="people-outline" size={18} color={colors.constant.white} />
                            <Animated.Text
                                style={[styles.buttonText, {
                                    transform: [{ scale: brokerAnim.scale }]
                                }]}
                            >
                                Broker Referred Assets
                            </Animated.Text>
                        </Pressable>
                    )}

                    <Pressable
                        style={styles.button}
                        onPress={wayToRWAHistory}
                        onPressIn={historyAnim.onPressIn}
                        onPressOut={historyAnim.onPressOut}
                    >
                        {!isBroker && (
                            <Ionicons name="time-outline" size={18} color={colors.constant.white} />
                        )}
                        <Animated.Text
                            style={[styles.buttonText, {
                                transform: [{ scale: historyAnim.scale }]
                            }]}
                        >
                            {isBroker ? "Onboarded" : "History"}
                        </Animated.Text>
                    </Pressable>

                    <Pressable
                        style={styles.button}
                        onPress={wayToMasterRWA}
                        onPressIn={addAnim.onPressIn}
                        onPressOut={addAnim.onPressOut}
                    >
                        <Ionicons name="add-circle-outline" size={18} color={colors.constant.white} />
                        <Animated.Text
                            style={[styles.buttonText, {
                                transform: [{ scale: addAnim.scale }]
                            }]}
                        >
                            Add Asset
                        </Animated.Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.stepsContainer}>
                <Text style={styles.title}>Steps of RWA Form</Text>
                <View style={styles.stepsWrapper}>
                    {steps?.map((item: any, index: number) => {
                        const stepNumber = index + 1;
                        return (
                            <View key={stepNumber} style={styles.stepItem}>
                                <View style={styles.stepRow}>
                                    <View style={styles.stepCircleWrapper} />

                                    <View style={styles.stepContent}>
                                        <Text style={styles.stepCount}>
                                            {item?.step}
                                        </Text>
                                        <Text style={styles.stepTitle}>
                                            {item?.title}
                                        </Text>
                                        <Text style={styles.stepLabel}>
                                            {item?.subtitle}
                                        </Text>
                                    </View>
                                </View>

                                {stepNumber !== steps?.length && (
                                    <View style={styles.stepLine} />
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

export default RWATab;

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            marginHorizontal: 16,
        },
        card: {
            borderRadius: 16,
            paddingVertical: 18,
        },
        title: {
            fontSize: 16,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.default,
        },
        subtitle: {
            marginTop: 6,
            fontSize: 12,
            fontFamily: 'WorkSans-Medium',
            color: colors.text.extraLight,
        },
        divider: {
            height: 1,
            backgroundColor: colors.isLight ? "#bbbbbbff" : "#363636",
            marginVertical: 4,
        },
        buttonRow: {
            flexDirection: "row",
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 14,
            gap: 16,
        },
        button: {
            flexDirection: "row",
            alignItems: "center",
            columnGap: 6,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 4,
            backgroundColor: "#2A5A8D",
            borderWidth: 1,
            borderColor: "#F5F5F54D",
        },
        buttonText: {
            color: colors.constant.white,
            fontSize: 14,
            fontFamily: 'WorkSans-Medium',
        },
        stepCard: {
            backgroundColor: colors.isLight ? colors.text.darkBlue : "#041221",
            borderRadius: 10,
            padding: 18,
            borderWidth: 1,
            marginTop: 26,
            position: 'relative',
        },
        stepRow: {
            flexDirection: "row",
            gap: 12
        },
        stepContent: {
            flex: 1
        },
        stepLabel: {
            fontSize: 10,
            color: colors.text.extraLight,
            fontFamily: 'WorkSans-Regular',
        },
        stepCount: {
            fontSize: 10,
            fontFamily: 'WorkSans-Regular',
            color: colors.text.default,
        },
        stepTitle: {
            fontSize: 12,
            fontFamily: 'WorkSans-SemiBold',
            color: colors.text.default,
        },
        stepLine: {
            position: "absolute",
            left: 3,
            top: 13,
            width: 1.5,
            height: 100,
            backgroundColor: colors.text.default,
        },
        stepsContainer: {
            paddingHorizontal: 16,
            paddingVertical: 20,
            borderRadius: 10,
            backgroundColor: colors.background.slightly,
            marginTop: 20,
        },
        stepsWrapper: {
            marginTop: 10,
            rowGap: 40,
        },
        stepItem: {
            position: "relative",
        },
        stepCircleWrapper: {
            width: 8,
            height: 8,
            borderRadius: 20,
            backgroundColor: colors.isLight ? colors.constant.black : "#D9D9D9",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 6,
            zIndex: 1,
            overflow: 'hidden',
            marginTop: 6,
        },
    });