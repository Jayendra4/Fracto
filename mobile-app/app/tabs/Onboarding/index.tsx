import { View } from "react-native"
import { useTheme } from "../../util/theme";
import { createStyles } from "./Onboarding.style";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import StepsContainer from "./StepsContainer";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import OnboardingHeader from "./OnboardingHeader";
import { useCallback, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

export const ONBOARDING_STEP_KEY = 'onboarding_parent_step';

const Onboarding = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const routes = useRoute() as { params: { activeParentStep?: number } };
    const activeParentStep = routes?.params?.activeParentStep ?? null;
    const [parentStep, setParentStep] = useState(1);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        const initStep = async () => {
            try {
                if (user?.kybStatus === "Submitted") {
                    setParentStep(2);
                    await AsyncStorage.setItem(ONBOARDING_STEP_KEY, "2");
                    return;
                }

                if (typeof activeParentStep === "number") {
                    setParentStep(activeParentStep);
                    await AsyncStorage.setItem(
                        ONBOARDING_STEP_KEY,
                        activeParentStep.toString()
                    );
                    return;
                }

                const storedStep = await AsyncStorage.getItem(ONBOARDING_STEP_KEY);
                if (storedStep) {
                    setParentStep(Number(storedStep));
                }
            } catch (e) {
                console.warn("Failed to init onboarding step", e);
            }
        };

        initStep();
    }, [activeParentStep, user?.kybStatus]);

    useEffect(() => {
        AsyncStorage.setItem(
            ONBOARDING_STEP_KEY,
            parentStep.toString()
        ).catch(e =>
            console.warn('Failed to save onboarding step', e)
        );
    }, [parentStep]);

    const getCurrentRoute = useCallback((): keyof typeof Routes.ONBOARDINGTAB | undefined => {
        switch (parentStep) {
            case 1:
                return Routes.ONBOARDINGTAB.COMPANYKYB;
            case 2:
                return Routes.ONBOARDINGTAB.DIRECTORSKYCSTEPS;
            default:
                return undefined;
        }
    }, [parentStep]);

    const wayToParentStep = useCallback(() => {
        const route = getCurrentRoute();
        if (route) {
            navigation.navigate(route);
        }
    }, [navigation, getCurrentRoute]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                <OnboardingHeader />
                <View style={styles.divider} />
                <StepsContainer activeStep={parentStep} />
                <ButtonPrimary
                    title={ButtonTextTypes.Complete_Now}
                    width={ButtonWidthTypes.Full}
                    align={ButtonAlignTypes.Center}
                    style={styles.completeButton}
                    onPress={wayToParentStep}
                />
            </View>
        </SafeAreaView>
    );
};

export default Onboarding;