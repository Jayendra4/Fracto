import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import OnboardingHeader from "../../tabs/Onboarding/OnboardingHeader";
import { useTheme } from "../../util/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import StepProgressCircle from "../../util/StepProgressCircle";
import { createStyles } from "./MasterRWA.style";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubmitMasterRWAApi, useUploadFile } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import Support from "../../assets/icons/contact-support.svg";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import AssetOnboarding from "../../components/BrokerDashboardTabs/AssetOnboarding";

export const MASTER_RWA_STEP_KEY = "master_rwa_step";
export const MASTER_RWA_STORAGE_KEY = "MASTER_RWA_DATA";
export const MASTER_RWA_ASSET_ID_KEY = "master_rwa_asset_id";

const MasterRWA = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const navigation = useNavigation<NavigationProp>();
    const scrollRef = useRef<KeyboardAwareScrollView>(null);
    const assetIdRef = useRef<number | null>(null);

    const { mutateAsync: uploadFile } = useUploadFile();
    const { mutateAsync: submitFormToApi } = useSubmitMasterRWAApi();

    const userDetails = useSelector((state: RootState) => state.auth.user);
    const isBroker = userDetails?.type === "Broker";

    const TOTAL_STEPS = useMemo(() => (isBroker ? 4 : 3), [isBroker]);

    const [step, setStep] = useState(1);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [rwaData, setRwaData] = useState({
        step1: {
            assetType: "",
            subType: "",
            assetTitle: "",
            shortDescription: "",
            detailedDescription: "",
            building: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
            geoLocation: "",
            whyInvest: [],
            assetImages: [],
            assetVideos: [],
        },
        step2: {
            ownershipModel: "",
            currentOwnerName: "",
            encumbranceDetails: "",
            ownershipEntityType: "",
            titleStatus: "",
            reraNumber: "",
            khasraNumber: "",
            landArea: "",
            builtupArea: "",
            yearOfConstruction: "",
            assetAge: "",
            titleDeed: null,
            encumbranceCertificate: null,
            taxReceipt: null,
            mutationRecords: null,
            ownershipChainDocs: null,
            reraCertificate: null,
            selectedNocType: "",
            nocDocument: null,
            occupancyCertificate: null,
            completionCertificate: null,
            electricityBill: null,
        },
        step3: {
            marketValue: "",
            currency: "",
            valuationAgencyName: "",
            valuationReportDate: "",
            lastPurchasePrice: "",
            rentalIncomeMonthly: "",
            leaseTenureRemainingMonth: "",
            threeYearRevenue: "",
            operationalExpensesAnnual: "",
            netOperationalIncome: "",
            expectedYieldPercentage: "",
            expectedAppreciationPercentage: "",
            registeredValuationReport: null,
            rentalAgreement: null,
            rentLedger: null,
            projectedCashFlowStatement: null,
            financialType: "",
            financialDocument: null,
        },
    });

    const nextStep = useCallback(() => {
        setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }, [TOTAL_STEPS]);

    const prevStep = useCallback(() => {
        setStep(prev => Math.max(prev - 1, 1));
    }, []);

    const updateStepData = useCallback((stepKey: keyof typeof rwaData, data: any) => {
        setRwaData(prev => ({ ...prev, [stepKey]: data }));
    }, []);

    const withLoading = useCallback(async (fn: () => Promise<void>) => {
        setIsUploading(true);
        try {
            await fn();
        } finally {
            setIsUploading(false);
        }
    }, []);

    const getFileKeys = (data: any) =>
        Object.keys(data).filter(key => {
            const value = data[key];
            return value && typeof value === "object" && value.uri;
        });

    useEffect(() => {
        const init = async () => {
            try {
                const [storedData, storedStep, storedAssetId] = await Promise.all([
                    AsyncStorage.getItem(MASTER_RWA_STORAGE_KEY),
                    AsyncStorage.getItem(MASTER_RWA_STEP_KEY),
                    AsyncStorage.getItem(MASTER_RWA_ASSET_ID_KEY),
                ]);

                if (storedData) setRwaData(JSON.parse(storedData));
                if (storedStep) setStep(Number(storedStep));
                if (storedAssetId) assetIdRef.current = Number(storedAssetId);
            } catch (e) {
                console.error(e);
            } finally {
                setIsHydrated(true);
            }
        };

        init();
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const t = setTimeout(() => {
            AsyncStorage.multiSet([
                [MASTER_RWA_STORAGE_KEY, JSON.stringify(rwaData)],
                [MASTER_RWA_STEP_KEY, String(step)],
            ]);
        }, 500);

        return () => clearTimeout(t);
    }, [rwaData, step, isHydrated]);

    useEffect(() => {
        scrollRef.current?.scrollToPosition(0, 0, false);
    }, [step]);

    const getErrorMessage = (err: any) => {
        return (
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong. Please try again."
        );
    };

    const createApiPayload = useCallback((all: typeof rwaData) => {
        const { step1, step2, step3 } = all;

        const basicInfo = {
            assetType: step1.assetType?.replace(/\s+/g, ""),
            assetTitle: step1.assetTitle,
            currentOwnerName: step2.currentOwnerName,
            ownershipModel: step2.ownershipModel?.replace(/\s+/g, ""),
        };

        const meta: any[] = [];

        const whyInvested = step1.whyInvest?.map((item: any) => ({
            icon: item?.icon?.id,
            title: item?.title,
            description: item?.description,
        }));

        const pushMeta = (key: string, value: any) => {
            if (value && typeof value !== "object") {
                meta.push({
                    metaKey: key,
                    metaValue: String(value),
                    metaType: typeof value === "number" ? "NUMBER" : "STRING",
                });
            }
        };

        Object.entries(step1).forEach(([k, v]) => {
            if (["geoLocation", "city", "state", "country", "pincode", "shortDescription", "detailedDescription"].includes(k)) {
                pushMeta(k, v);
            }
        });

        Object.entries(step2).forEach(([k, v]) => pushMeta(k, v));
        Object.entries(step3).forEach(([k, v]) => pushMeta(k, v));

        const documents: any[] = [];

        const collectDocs = (data: any, map: Record<string, string>) => {
            Object.entries(map).forEach(([k, type]) => {
                const file = data[k];
                if (file?.url) {
                    documents.push({
                        documentType: type,
                        documentName: file.name || k,
                        documentUrl: file.meta.filename,
                        remarks: "",
                    });
                }
            });
        };

        collectDocs(step2, {
            titleDeed: "REGISTERED_TITLE_DEED",
            encumbranceCertificate: "EC",
            taxReceipt: "PROPERTY_TAX_RECEIPTS",
            mutationRecords: "MUTATION_RECORDS",
            ownershipChainDocs: "OWNERSHIP_CHAIN_DOCUMENTS",
            reraCertificate: "RERA_CERTIFICATE",
            nocDocument: "NOC_DOCUMENT",
            occupancyCertificate: "OCCUPANCY_CERTIFICATE",
            completionCertificate: "COMPLETION_CERTIFICATE",
            electricityBill: "ELECTRICITY_BILL",
        });

        collectDocs(step3, {
            registeredValuationReport: "REGISTERED_VALUATION_REPORT",
            rentalAgreement: "RENTAL_AGREEMENT",
            rentLedger: "RENT_LEDGER",
            projectedCashFlowStatement: "PROJECTED_CASHFLOW",
            financialDocument: "FINANCIAL_DOCUMENT",
        });

        step1.assetImages.forEach((f: any) =>
            f?.url && documents.push({
                documentType: "ASSET_IMAGE",
                documentName: f.name || "image",
                documentUrl: f.meta.filename,
                remarks: "",
            })
        );

        step1.assetVideos.forEach((f: any) =>
            f?.url && documents.push({
                documentType: "ASSET_VIDEO",
                documentName: f.name || "video",
                documentUrl: f.meta.filename,
                remarks: "",
            })
        );

        return {
            basicInfo,
            meta,
            documents,
            whyInvested,
        };
    }, []);

    const handleStep1Next = async (data: any) => {
        await withLoading(async () => {
            try {
                const uploadSafe = async (file: any, folder: string) => {
                    try {
                        if (file.url) return file;
                        const res = await uploadFile({ file, folder, checkFile: true });
                        return { ...res.data, uri: file?.uri };
                    } catch (err) {
                        Toast.show({
                            type: "error",
                            text1: getErrorMessage(err),
                        });
                        return null;
                    }
                };

                const uploadedImages = await Promise.all(
                    data.assetImages.map((img: any) =>
                        uploadSafe(img, "asset-images")
                    )
                );

                const uploadedVideos = await Promise.all(
                    data.assetVideos.map((vid: any) =>
                        uploadSafe(vid, "asset-videos")
                    )
                );

                updateStepData("step1", {
                    ...data,
                    assetImages: uploadedImages,
                    assetVideos: uploadedVideos,
                });

                if (uploadedImages.every((i: any) => i.url) && uploadedVideos.every((v: any) => v.url)) {
                    Toast.show({ type: "success", text1: "Step 1 completed!" });
                    nextStep();
                } else {
                    Toast.show({ type: "error", text1: "Some files failed to upload." });
                }
            } catch (error) {
                Toast.show({
                    type: "error",
                    text1: getErrorMessage(error),
                });
            }
        });
    };

    const handleStep2Next = async (data: any) => {
        await withLoading(async () => {
            try {
                const fileKeys = getFileKeys(data);
                const uploaded: any = { ...data };

                for (const key of fileKeys) {
                    const file = data[key];
                    if (file.url) continue;

                    const res = await uploadFile({ file, folder: "step2-documents" });
                    uploaded[key] = { ...res.data, uri: file.uri, name: file.name };
                }

                updateStepData("step2", uploaded);

                if (!fileKeys.every(k => uploaded[k].url)) {
                    Toast.show({ type: "error", text1: "Some documents failed." });
                    return;
                }

                Toast.show({ type: "success", text1: "Step 2 completed!" });
                nextStep();
            } catch (err) {
                Toast.show({
                    type: "error",
                    text1: getErrorMessage(err),
                });
            }
        });
    };

    const handleStep3Submit = async (data: any, isFinal: boolean) => {
        await withLoading(async () => {
            try {
                const fileKeys = getFileKeys(data);
                const uploaded: any = { ...data };

                for (const key of fileKeys) {
                    const file = data[key];
                    if (file.url) continue;

                    const res = await uploadFile({ file, folder: "step3-documents" });
                    uploaded[key] = { ...res.data, uri: file.uri, name: file.name };
                }

                updateStepData("step3", uploaded);

                if (!fileKeys.every(k => uploaded[k].url)) return;

                const payload = createApiPayload({ ...rwaData, step3: uploaded });
                const res = await submitFormToApi(payload);

                assetIdRef.current = res?.data?.id;
                await AsyncStorage.setItem(MASTER_RWA_ASSET_ID_KEY, String(res?.data?.id));

                Toast.show({
                    type: 'success',
                    text1: isFinal
                        ? 'Master RWA completed!'
                        : 'Step 3 completed!',
                });
                nextStep();

                if (isFinal) {
                    await AsyncStorage.multiRemove([
                        MASTER_RWA_STEP_KEY,
                        MASTER_RWA_STORAGE_KEY,
                        MASTER_RWA_ASSET_ID_KEY,
                    ]);

                    navigation.navigate(Routes.TABS.HOME, {
                        screen: Routes.TABS.DASHBOARD,
                    });
                }
            } catch (err) {
                Toast.show({
                    type: "error",
                    text1: getErrorMessage(err),
                });
            }
        });
    };

    const renderStep = useCallback(() => {
        switch (step) {
            case 1:
                return <Step1 data={rwaData.step1} isLoading={isUploading} onNext={handleStep1Next} />;
            case 2:
                return <Step2 data={rwaData.step2} isLoading={isUploading} onBack={prevStep} onNext={handleStep2Next} />;
            case 3:
                return (
                    <Step3
                        data={rwaData.step3}
                        isLoading={isUploading}
                        onBack={prevStep}
                        onSubmit={async (d) => {
                            if (isBroker) {
                                await handleStep3Submit(d, false);
                            } else {
                                await handleStep3Submit(d, true);
                            }
                        }}
                    />
                );
            case 4:
                return (
                    <AssetOnboarding
                        assetId={assetIdRef.current!}
                        onBack={prevStep}
                        onAction={() => {
                            Toast.show({ type: "success", text1: "Asset owner invitation sent successfully" });
                            navigation.goBack();
                        }}
                    />
                );
            default:
                return null;
        }
    }, [step, rwaData, isUploading, isBroker]);

    const renderStepTitle = useMemo(() => {
        switch (step) {
            case 1: return "Asset Basic Information";
            case 2: return "Ownership & Title Details";
            case 3: return "Financial & Valuation Details";
            case 4: return "Asset Onboarding";
            default: return "";
        }
    }, [step]);

    const wayToVendorList = useCallback(() => {
        navigation.navigate(Routes.ONBOARDINGTAB.VENDORLIST);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <OnboardingHeader
                    title="Master RWA Steps"
                    desc="Complete your Master RWA. It will only take few minutes..."
                />
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
                            <View style={styles.kybInfoRow}>
                                <Text style={styles.kybTitle} numberOfLines={1}>
                                    Master RWA Form
                                </Text>
                                <ButtonPrimary
                                    title={ButtonTextTypes.Need_Support}
                                    width={ButtonWidthTypes.Half}
                                    align={ButtonAlignTypes.Center}
                                    icon={<Support width={16} height={16} />}
                                    style={{ width: "auto" }}
                                    buttonStyle={styles.supportButtonStyle}
                                    textStyle={styles.supportTextStyle}
                                    onPress={wayToVendorList}
                                />
                            </View>
                            <Text style={styles.kybSubtitle}>
                                Enter your details to complete your master rwa form. It only takes a few minutes...
                            </Text>
                        </View>

                        <View style={styles.stepsWrapper}>
                            <View style={styles.stepContainer}>
                                <StepProgressCircle
                                    step={step}
                                    totalSteps={TOTAL_STEPS}
                                />
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{renderStepTitle}</Text>
                                    <Text style={styles.stepDescription}>
                                        Complete the three steps to submit your Master RWA details accurately and securely.
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

export default MasterRWA;