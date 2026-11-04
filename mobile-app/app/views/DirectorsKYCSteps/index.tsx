import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import OnboardingHeader from "../../tabs/Onboarding/OnboardingHeader";
import { useTheme } from "../../util/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import StepProgressCircle from "../../util/StepProgressCircle";
import { createStyles } from "./DirectorsKYCSteps.style";
import Step1, { DirectorStep1FormValues } from "./Step1";
import Step2, { DirectorStep2FormValues } from "./Step2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCompanyBasicDetail } from "../../services/auth.service";
import { mapDirectorToSteps } from "../../util/mapDirectorToSteps";
import { useDispatch } from "react-redux";
import { refreshUser } from "../../store/authSlice";
import { AppDispatch } from "../../store";

export const DIRECTOR_KYC_STEP_KEY = 'directors_kyc_step';
export const DIRECTOR_ID_KEY = 'director_id';

const DirectorsKYCSteps = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [step, setStep] = useState(1);
    const navigation = useNavigation<NavigationProp>();
    const scrollRef = useRef<KeyboardAwareScrollView>(null);
    const dispatch = useDispatch<AppDispatch>();

    const [kycData, setKycData] = useState<{
        step1: DirectorStep1FormValues;
        step2: DirectorStep2FormValues;
    }>({
        step1: {} as DirectorStep1FormValues,
        step2: {} as DirectorStep2FormValues,
    });

    const { data: directorData } = useCompanyBasicDetail()
    const director = directorData?.directors?.[0];

    const nextStep = () => setStep(prev => Math.min(prev + 1, 2));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    useEffect(() => {
        const loadStep = async () => {
            try {
                const storedStep = await AsyncStorage.getItem(DIRECTOR_KYC_STEP_KEY);
                if (storedStep) {
                    setStep(Number(storedStep));
                }
            } catch (e) {
                console.warn('Failed to load KYB step', e);
            }
        };

        loadStep();
    }, []);

    useEffect(() => {
        const saveStep = async () => {
            try {
                await AsyncStorage.setItem(DIRECTOR_KYC_STEP_KEY, step.toString());
            } catch (e) {
                console.warn('Failed to save KYB step', e);
            }
        };

        saveStep();
    }, [step]);


    useEffect(() => {
        scrollRef.current?.scrollToPosition(0, 0, false);
    }, [step]);

    const lastStepForward = useCallback(() => {
        dispatch(refreshUser());
        navigation.navigate(Routes.BANNER.SUCCESS, {
            title: "Success",
            mainText: "Congratulation!! You’re verified",
            subText: "No further action is required at the moment",
            onForward: () => navigation.navigate(Routes.TABS.HOME, {
                screen: Routes.TABS.ONBOARDING
            })
        });
    }, [navigation]);

    useEffect(() => {
        const initialize = async () => {
            const [storedStep] = await Promise.all([
                AsyncStorage.getItem(DIRECTOR_KYC_STEP_KEY),
            ]);
            if (storedStep) setStep(Number(storedStep));
        };
        initialize();
    }, []);

    const stepsData = useMemo(() =>
        director ? mapDirectorToSteps(director) : null,
        [director]);

    useEffect(() => {
        if (stepsData) {
            setKycData({
                step1: stepsData.step1,
                step2: stepsData.step2
            });
        }
    }, [stepsData]);

    const renderStep = useCallback(() => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        initialValues={kycData.step1}
                        directorId={director?.id}
                        onNext={(data) => {
                            setKycData(prev => ({
                                ...prev,
                                step1: data
                            }));
                            nextStep();
                        }}
                    />
                );
            case 2:
                return (
                    <Step2
                        directorId={director?.id}
                        companyId={directorData?.id}
                        initialValues={kycData.step2}
                        onBack={prevStep}
                        onNext={(data) => {
                            setKycData(prev => ({
                                ...prev,
                                step2: data
                            }));
                            lastStepForward();
                        }}
                    />
                );
            default: return null;
        }
    }, [step, kycData, director]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <OnboardingHeader />
                <View style={styles.divider} />

                <KeyboardAwareScrollView
                    ref={scrollRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                    enableAutomaticScroll
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.kybCard}>
                        <View style={styles.stepsWrapper}>
                            <View style={styles.stepContainer}>
                                <StepProgressCircle
                                    step={step}
                                    totalSteps={2}
                                    textStyle={{ color: colors.constant.white }}
                                />
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>Directors KYC</Text>
                                    <Text style={styles.stepDescription}>
                                        Enter your details to complete your KYC form. It only takes a few minutes...
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {renderStep()}
                </KeyboardAwareScrollView>
            </View>
        </SafeAreaView>
    );
};

export default DirectorsKYCSteps;