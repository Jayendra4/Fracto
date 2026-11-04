import { useTheme } from "../../util/theme";
import { createStyles } from "./Kyc.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import ProgressStepper from "./ProgressStepper";
import KycStep1 from "./KycStep1";
import KycStep2 from "./KycStep2";
import KycStep3 from "./KycStep3";
import KycStep4 from "./KycStep4";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const KYC_STORAGE_KEY = "KYC_DATA";
export const KYC_STEP_KEY = "KYC_STEPS";

const Kyc = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const [step, setStep] = useState(1);
    const [isHydrated, setIsHydrated] = useState(false);

    const [kycData, setKycData] = useState({
        step1: {
            pan: '',
            dateOfBirth: '',
            licenseNumber: '',
            licenseExpiry: '',
            panFile: null as any,
        },
        step2: {
            occupation: '',
            occupationIndustry: '',
            monthlyIncome: '',
        },
        step3: {
            address: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            country: '',
            addressId: '',
            addressProof: null as any,
        },
        step4: {
            selfie: null as string | null,
            secondaryFile: null as any,
            secondaryId: "",
        },
    });

    useEffect(() => {
        const initialize = async () => {
            try {
                const [storedData, storedStep] = await Promise.all([
                    AsyncStorage.getItem(KYC_STORAGE_KEY),
                    AsyncStorage.getItem(KYC_STEP_KEY),
                ]);

                if (storedData) {
                    setKycData(JSON.parse(storedData));
                }

                if (storedStep) {
                    setStep(Number(storedStep));
                }
                setIsHydrated(true);
            } catch (err) {
                console.error("Failed to initialize KYC", err);
                setIsHydrated(true);
            }
        };

        initialize();
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const timeout = setTimeout(() => {
            AsyncStorage.multiSet([
                [KYC_STORAGE_KEY, JSON.stringify(kycData)],
                [KYC_STEP_KEY, step.toString()],
            ]);
        }, 300);

        return () => clearTimeout(timeout);
    }, [kycData, step, isHydrated]);

    const updateStepData = (stepKey: keyof typeof kycData, data: any) => {
        setKycData(prev => ({
            ...prev,
            [stepKey]: data,
        }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const renderStep = useCallback(() => {
        switch (step) {
            case 1:
                return (
                    <KycStep1
                        data={kycData.step1}
                        onNext={(data) => {
                            updateStepData('step1', data);
                            nextStep();
                        }}
                    />
                );
            case 2:
                return (
                    <KycStep2
                        data={kycData.step2}
                        onBack={prevStep}
                        onNext={(data) => {
                            updateStepData('step2', data);
                            nextStep();
                        }}
                    />
                );
            case 3:
                return (
                    <KycStep3
                        data={kycData.step3}
                        onBack={prevStep}
                        onNext={(data) => {
                            updateStepData('step3', data);
                            nextStep();
                        }}
                    />
                );
            case 4:
                return (
                    <KycStep4
                        data={kycData.step4}
                        allData={kycData}
                        onBack={prevStep}
                    />
                );
        }
    }, [step, kycData, updateStepData, nextStep, prevStep]);

    const doItLater = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.PROPERTY,
        });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexShrink: 1 }}>
                    <Text
                        style={styles.headerTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        User KYC Verification
                    </Text>
                    <Text
                        style={styles.headerDesc}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        Complete your KYC. It will only take few minutes...
                    </Text>
                </View>
                <Pressable
                    style={styles.doLater}
                    onPress={doItLater}
                >
                    <Text style={styles.doLaterText}>Skip</Text>
                </Pressable>
            </View>

            <View style={styles.percentageWrapper}>
                <View style={styles.percentageRow}>
                    <Text style={styles.stepsCount}>
                        Step {step} of 4
                    </Text>
                    <Text style={styles.percentComplete}>{((step - 1) / 4) * 100}% Completed</Text>
                </View>
                <ProgressStepper step={step} />
            </View>
            {renderStep()}
        </SafeAreaView>
    );
};

export default Kyc;