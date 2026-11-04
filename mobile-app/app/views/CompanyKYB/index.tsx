import { ActivityIndicator, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import OnboardingHeader from "../../tabs/Onboarding/OnboardingHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./CompanyKYB.style";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Step1, { Step1FormValues } from "./Step1";
import Step2, { Step2FormValues } from "./Step2";
import Step3, { Step3FormValues } from "./Step3";
import Step4, { Step4FormValues } from "./Step4";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import StepProgressCircle from "../../util/StepProgressCircle";
import { useCompanyBasicDetail } from "../../services/auth.service";
import { mapCompanyToSteps } from "../../util/companyMapper";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export const COMPANY_KYB_STEP_KEY = "COMPANY_KYB_STEP";
export const COMPANY_KYB_DATA_KEY = "COMPANY_KYB_DATA";
export const COMPANY_ID_KEY = "COMPANY_ID";

const CompanyKYB = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [step, setStep] = useState(1);
    const navigation = useNavigation<NavigationProp>();
    const scrollRef = useRef<KeyboardAwareScrollView>(null);

    const [companyId, setCompanyId] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: companyData } = useCompanyBasicDetail();

    const [kybData, setKybData] = useState<{
        step1: Step1FormValues;
        step2: Step2FormValues;
        step3: Step3FormValues;
        step4: Step4FormValues;
    }>({
        step1: {} as Step1FormValues,
        step2: {} as Step2FormValues,
        step3: {} as Step3FormValues,
        step4: {} as Step4FormValues,
    });

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    useEffect(() => {
        scrollRef.current?.scrollToPosition(0, 0, false);
    }, [step]);

    const lastStepForward = useCallback(() => {
        navigation.navigate(Routes.TABS.HOME, {
            screen: Routes.TABS.ONBOARDING,
            params: { activeParentStep: 2 },
        })
    }, [navigation]);

    useEffect(() => {
        if (!companyData || !user) return;

        const stepsData = mapCompanyToSteps(companyData);
        const companyIdFromMe = user?.companies?.[0]?.id;

        if (companyIdFromMe) {
            setCompanyId(String(companyIdFromMe));
        }

        setKybData(stepsData);
    }, [companyData, user]);

    useEffect(() => {
        const restoreStep = async () => {
            const storedStep = await AsyncStorage.getItem(COMPANY_KYB_STEP_KEY);

            setStep(storedStep ? Number(storedStep) : 1);
        };

        restoreStep();
    }, []);

    const renderStep = useCallback(() => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        initialValues={kybData.step1}
                        onNext={(data) => {
                            const { companyId: newCompanyId } = data;
                            setKybData(prev => ({
                                ...prev,
                                step1: data
                            }));
                            if (newCompanyId) {
                                setCompanyId(String(newCompanyId));
                            }
                            nextStep();
                        }}
                    />
                );
            case 2:
                if (!companyId) return <ActivityIndicator />;

                return (
                    <Step2
                        companyId={companyId}
                        initialValues={kybData.step2}
                        onBack={() => setStep(1)}
                        onNext={(data) => {
                            setKybData(prev => ({
                                ...prev,
                                step2: data
                            }));
                            nextStep();
                        }}
                    />
                );
            case 3:
                if (!companyId) return <ActivityIndicator />;
                return (
                    <Step3
                        companyId={companyId}
                        initialValues={kybData.step3}
                        onBack={() => setStep(2)}
                        onNext={(data) => {
                            setKybData(prev => ({
                                ...prev,
                                step3: data
                            }));
                            nextStep();
                        }}
                    />
                );
            case 4:
                if (!companyId) return <ActivityIndicator />;
                return (
                    <Step4
                        companyId={companyId}
                        initialValues={kybData.step4}
                        onBack={prevStep}
                        onNext={lastStepForward}
                    />
                );
            default: return null;
        }
    }, [step, companyId, kybData]);

    const renderStepTitle = useCallback(() => {
        switch (step) {
            case 1: return "Company Basic Details";
            case 2: return "Tax and Regulatory details";
            case 3: return "Business Profile";
            case 4: return "Document Upload";
        }
    }, [step]);

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
                        <View style={styles.kybInfoWrapper}>
                            <Text style={styles.kybTitle}>Company KYB</Text>
                            <Text style={styles.kybSubtitle}>
                                Provide your company details and complete KYB verification.
                            </Text>
                        </View>

                        <View style={styles.stepsWrapper}>
                            <View style={styles.stepContainer}>
                                <StepProgressCircle
                                    step={step}
                                    totalSteps={4}
                                />
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{renderStepTitle()}</Text>
                                    <Text style={styles.stepDescription}>
                                        Enter your company details to complete your company KYB form.
                                        It only takes a few minutes...
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.kybDivider} />
                        </View>
                    </View>
                    {renderStep()}
                </KeyboardAwareScrollView>
            </View>
        </SafeAreaView>
    );
};

export default CompanyKYB;