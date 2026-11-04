
import { ActivityIndicator, Animated, Image, ImageBackground, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "../../util/theme";
import { createStyles } from "./BrokerProfileInformation.style";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import TextInputClassic from "../../components/TextInputClassic";
import { Formik } from "formik";
import { brokerProfileSchema } from "../../util/formValidationSchema";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Feather from "react-native-vector-icons/Feather";
import CertifiedBadge from "../../assets/icons/certified-badge-success.svg";
import { KycStatusType } from "../../components/Navigation/TabBar/TabBar.types";
import { useCallback, useState } from "react";
import { useUpdateMeApi, useUpdateProfile } from "../../services/hooks/useApi";
import Toast from "react-native-toast-message";
import { refreshUser } from "../../store/authSlice";
import { usePressScale } from "../../services/hooks/usePressScale";
import { pickFromGallery } from "../../util/fileUploadHelper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { copyToClipboard } from "../../util/helper";

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

const BrokerProfileInformation = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const dispatch = useDispatch<AppDispatch>();
    const { mutateAsync, isPending, error: updateApiError } = useUpdateMeApi();
    const [isEditing, setIsEditing] = useState(false);
    const editAnim = usePressScale();
    const cancelAnim = usePressScale();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const isKycPending = userDetails?.kycStatus !== KycStatusType.Approved;
    const readOnly = !isEditing;
    const [isImageUploading, setIsImageUploading] = useState(false);
    const { mutateAsync: updateProfileMutate } = useUpdateProfile();
    const cameraAnim = usePressScale();

    const initialValues = {
        firstname: userDetails?.firstname,
        lastname: userDetails?.lastname,
        phone: userDetails?.mobile,
        email: userDetails?.email,
        address: `${userDetails?.currentAddress?.addressLine1?.trim()}, ${userDetails?.currentAddress?.city?.trim()}, ${userDetails?.currentAddress?.state?.trim()}`,
        licenseNumber: userDetails?.licenseNumber ?? undefined,
        licenseExpiry: userDetails?.licenseExpiry ?? undefined,
    };

    const handlePickImage = async () => {
        try {
            setIsImageUploading(true);

            const uploadedFile = await pickFromGallery();
            if (!uploadedFile?.meta?.filename) return;

            await updateProfileMutate({
                profileImage: uploadedFile.meta.filename,
            });

            await dispatch(refreshUser());
        } catch (error) {
            console.log('Image upload failed', error);
        } finally {
            setIsImageUploading(false);
        }
    };

    const updateUserDetails = useCallback(async (values: typeof initialValues) => {
        try {
            await mutateAsync({
                firstname: values.firstname?.trim(),
                lastname: values.lastname?.trim(),
                email: values.email?.trim(),
            });
            dispatch(refreshUser());
            setIsEditing(false);
            Toast.show({
                type: 'success',
                text1: 'Profile Updated Successfully',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: error?.message || updateApiError?.message || 'Update Failed',
            })
        }
    }, [mutateAsync, updateApiError, dispatch]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <ImageBackground
                    source={require("../../assets/images/broker-profile.png")}
                    style={styles.imageBackground}
                    resizeMode="cover"
                >
                    <PropertyHeader enableBack disableInfo />

                    {userDetails?.referralCode && (
                        <View style={styles.referralWrapper}>
                            <Text style={styles.referTitle}>Your Referral Code</Text>
                            <View style={styles.codeRow}>
                                <Pressable
                                    style={styles.copy}
                                    onPress={() => copyToClipboard(String(userDetails?.referralCode))}
                                >
                                    <Ionicons name="copy-outline" size={12} color={colors.icon.primary} />
                                </Pressable>
                                <Text style={styles.referCode}>{userDetails?.referralCode}</Text>
                            </View>
                        </View>
                    )}
                </ImageBackground>
                <View style={styles.brokerInformation}>
                    <View style={styles.profileWrapper}>
                        <View style={styles.profile}>
                            <View style={styles.profileImageWrapper}>
                                {isImageUploading ? (
                                    <ActivityIndicator color={colors.icon.primary} />
                                ) : (
                                    <Image
                                        source={userDetails?.profileImage ?
                                            { uri: userDetails?.profileImage } :
                                            require("../../assets/images/avatar.png")
                                        }
                                        style={styles.profileImage}
                                        resizeMode="cover"
                                    />
                                )}
                            </View>

                            <Pressable
                                onPress={handlePickImage}
                                onPressIn={cameraAnim.onPressIn}
                                onPressOut={cameraAnim.onPressOut}
                                disabled={isImageUploading}
                                style={styles.camera}
                            >
                                <AnimatedFeather
                                    name="camera"
                                    size={24}
                                    color={colors.icon.primary}
                                    style={[
                                        { transform: [{ scale: cameraAnim.scale }] }
                                    ]}
                                />
                            </Pressable>
                        </View>
                        <Text style={styles.username}>
                            {`${userDetails?.firstname} ${userDetails?.lastname}`}
                        </Text>
                        <Text style={styles.brokerProfile}>
                            Broker Profile
                        </Text>
                    </View>
                    <View style={styles.certifiedWrapper}>
                        <CertifiedBadge />
                        <Text style={styles.certifiedText}>
                            Certified Real Estate Broker (CREB)
                        </Text>
                    </View>
                </View>

                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                    enableAutomaticScroll
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.performanceWrapper}>
                        <Text style={styles.overviewText}>Performance Overview</Text>
                        <View style={styles.overviewRow}>
                            <View style={styles.overviewBox}>
                                <Text style={styles.overviewTitle}>Total Leads</Text>
                                <Text style={styles.overviewValue}>127</Text>
                            </View>
                            <View style={styles.overviewBox}>
                                <Text style={styles.overviewTitle}>Conversions</Text>
                                <Text style={styles.overviewValue}>43</Text>
                            </View>
                            <View style={styles.overviewBox}>
                                <Text style={styles.overviewTitle}>Conversion Rates</Text>
                                <Text style={styles.overviewValue}>33.9%</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.divider, styles.spaceHorizontal]} />
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={brokerProfileSchema}
                        onSubmit={() => { }}
                    >
                        {({
                            handleChange,
                            values,
                            errors,
                            touched,
                            submitCount,
                        }) => (
                            <View style={styles.inputsMainWrapper}>
                                <View style={styles.inputsWrapper}>
                                    <View style={styles.basicInfoHeader}>
                                        <Text style={styles.basicTitle}>Basic Information</Text>
                                        <View style={styles.editActions}>
                                            {isEditing && (
                                                <Pressable
                                                    onPress={() => setIsEditing(false)}
                                                    onPressIn={cancelAnim.onPressIn}
                                                    onPressOut={cancelAnim.onPressOut}
                                                    style={{ padding: 4 }}
                                                >
                                                    <Animated.Text style={[styles.cancelText,
                                                    { transform: [{ scale: cancelAnim.scale }] }
                                                    ]}>
                                                        Cancel
                                                    </Animated.Text>
                                                </Pressable>
                                            )}
                                            <Pressable
                                                style={styles.editWrapper}
                                                disabled={isPending}
                                                onPress={async () => {
                                                    if (isEditing) {
                                                        await updateUserDetails(values);
                                                        return;
                                                    }
                                                    setIsEditing(!isEditing);
                                                }}
                                                onPressIn={editAnim.onPressIn}
                                                onPressOut={editAnim.onPressOut}
                                            >
                                                {isPending ? (
                                                    <ActivityIndicator size="small" color={"#73B7FF"} />
                                                ) : (
                                                    isEditing ?
                                                        <Feather name="check" size={18} color={"#73B7FF"} /> :
                                                        <Feather name="edit" size={18} color={"#73B7FF"} />
                                                )}
                                                <Animated.Text style={[styles.editText,
                                                { transform: [{ scale: editAnim.scale }] }
                                                ]}>
                                                    {isEditing ? "Update" : "Edit Profile"}
                                                </Animated.Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.input}>
                                        <TextInputClassic
                                            label="First Name"
                                            value={values.firstname}
                                            onChangeText={handleChange('firstname')}
                                            readOnly={readOnly}
                                            error={(touched.firstname || submitCount > 0) ? errors.firstname : undefined}
                                        />

                                        <TextInputClassic
                                            label="Last Name"
                                            value={values.lastname}
                                            onChangeText={handleChange('lastname')}
                                            readOnly={readOnly}
                                            error={(touched.lastname || submitCount > 0) ? errors.lastname : undefined}
                                        />

                                        <TextInputClassic
                                            label="Phone"
                                            value={values.phone}
                                            onChangeText={handleChange('phone')}
                                            readOnly
                                            error={(touched.phone || submitCount > 0) ? errors.phone : undefined}
                                            keyboardType="number-pad"
                                            disabled={isEditing}
                                        />

                                        <TextInputClassic
                                            label="Email"
                                            value={values.email}
                                            onChangeText={handleChange('email')}
                                            readOnly
                                            error={(touched.email || submitCount > 0) ? errors.email : undefined}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            disabled={isEditing}
                                        />

                                        <TextInputClassic
                                            label="Address"
                                            value={values.address}
                                            onChangeText={handleChange('address')}
                                            readOnly
                                            multiline
                                            error={(touched.address || submitCount > 0) ? errors.address : undefined}
                                            disabled={isEditing}
                                            style={{ height: "auto", minHeight: 48 }}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputsWrapper}>
                                    <View style={styles.basicInfoHeader}>
                                        <Text style={styles.basicTitle}>
                                            License & Verification
                                        </Text>
                                    </View>
                                    <View style={styles.divider} />

                                    <View style={styles.input}>
                                        {userDetails?.hasLicense ? (
                                            <>
                                                <TextInputClassic
                                                    label="License Number"
                                                    value={values.licenseNumber}
                                                    onChangeText={handleChange('licenseNumber')}
                                                    readOnly
                                                    error={(touched.licenseNumber || submitCount > 0) ? errors.licenseNumber : undefined}
                                                    disabled={isEditing}
                                                />

                                                <TextInputClassic
                                                    label="License Expiry"
                                                    value={values.licenseExpiry}
                                                    onChangeText={handleChange('licenseExpiry')}
                                                    readOnly
                                                    error={(touched.licenseExpiry || submitCount > 0) ? errors.licenseExpiry : undefined}
                                                    disabled={isEditing}
                                                />
                                            </>
                                        ) : (
                                            <Text style={styles.emptyLicense}>
                                                The user has not added their license details yet.
                                            </Text>
                                        )}

                                        <View>
                                            <Text style={styles.label}>KYC Status</Text>
                                            <View style={[
                                                styles.verfiyWrapper,
                                                isKycPending && styles.pendingWrapper,
                                            ]}>
                                                <Feather name="check-circle" size={20} color={isKycPending ? styles.pendingIcon.color : styles.checkIcon.color} />
                                                <Text style={[
                                                    styles.verifyText,
                                                    isKycPending && styles.pendingText,
                                                ]}>
                                                    {isKycPending ? "Pending" : "Verified"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                    </Formik>
                </KeyboardAwareScrollView>
            </View>
        </SafeAreaView>
    );
};

export default BrokerProfileInformation;