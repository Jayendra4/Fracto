import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import OnboardingHeader from "../../tabs/Onboarding/OnboardingHeader";
import { useTheme } from "../../util/theme";
import { useCallback, useState } from "react";
import { createStyles } from "./DirectorsKYC.style";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import TextInputClassic from "../../components/TextInputClassic";
import Feather from "react-native-vector-icons/Feather"
import { Formik } from "formik";
import { AddDirectorSchema } from "../../util/formValidationSchema";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";

const DirectorsKYC = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const [isModalVisible, setModalVisible] = useState(false);

    const completeKycNow = useCallback(() => {
        navigation.navigate(Routes.ONBOARDINGTAB.DIRECTORSKYCSTEPS);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <OnboardingHeader />
                <View style={styles.divider} />

                <View style={styles.directorWrapper}>
                    <View style={styles.addDirectorRow}>
                        <View style={styles.addInfoWrapper}>
                            <Text style={styles.title}>Directors KYC</Text>
                            <Text style={styles.subTitle}>
                                Directors KYC have four steps kind of somthing lorem text.
                            </Text>
                        </View>
                        <ButtonPrimary
                            title={ButtonTextTypes.Add_Director}
                            width={ButtonWidthTypes.Medium}
                            align={ButtonAlignTypes.Center}
                            buttonStyle={styles.addButtonStyle}
                            textStyle={{ fontSize: 16 }}
                            onPress={() => setModalVisible(true)}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.listWrapper}>
                        <View style={styles.directorRow}>
                            <View style={styles.addInfoWrapper}>
                                <Text style={styles.directorNumber}>Director-1:</Text>
                                <Text style={styles.directorName}>Ram</Text>
                            </View>
                            <ButtonPrimary
                                title={ButtonTextTypes.Complete_KYC_Now}
                                width={ButtonWidthTypes.Medium}
                                align={ButtonAlignTypes.Center}
                                buttonStyle={[styles.addButtonStyle, { width: 'auto' }]}
                                textStyle={{ fontSize: 14 }}
                                onPress={completeKycNow}
                            />
                        </View>
                    </View>
                </View>
            </View>

            <Modal
                transparent
                animationType="fade"
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Director</Text>
                            <Pressable
                                style={styles.closeIcon}
                                onPress={() => setModalVisible(false)}
                            >
                                <Feather name="x" size={20} color={colors.icon.primary} />
                            </Pressable>
                        </View>
                        <View style={styles.modalDivider} />

                        <Formik
                            initialValues={{
                                firstName: "",
                                lastName: "",
                            }}
                            validationSchema={AddDirectorSchema}
                            onSubmit={() => setModalVisible(false)}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                handleBlur,
                                handleChange,
                                handleSubmit,
                            }) => (
                                <>
                                    <View style={styles.inputs}>
                                        <TextInputClassic
                                            label="First Name"
                                            placeholder="Enter Director’s First Name"
                                            value={values.firstName}
                                            onChangeText={handleChange("firstName")}
                                            onBlur={handleBlur('firstName')}
                                            error={errors.firstName && touched.firstName ? errors.firstName : undefined}
                                            required
                                        />

                                        <TextInputClassic
                                            label="Last Name"
                                            placeholder="Enter Director’s Last Name"
                                            value={values.lastName}
                                            onChangeText={handleChange("lastName")}
                                            onBlur={handleBlur('lastName')}
                                            error={errors.lastName && touched.lastName ? errors.lastName : undefined}
                                            required
                                        />
                                    </View>

                                    <ButtonPrimary
                                        title={ButtonTextTypes.Add_Director}
                                        width={ButtonWidthTypes.Full}
                                        align={ButtonAlignTypes.Center}
                                        style={{ paddingHorizontal: 20 }}
                                        onPress={handleSubmit}
                                    />
                                </>
                            )}
                        </Formik>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default DirectorsKYC;