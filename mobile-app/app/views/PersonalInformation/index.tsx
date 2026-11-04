
import { ActivityIndicator, Animated, Image, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "../../util/theme";
import { createStyles } from "./PersonalInformation.style";
import GoBack from "../../components/GoBack";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import TextInputClassic from "../../components/TextInputClassic";
import { Formik } from "formik";
import { personalInformationSchema } from "../../util/formValidationSchema";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Feather from "react-native-vector-icons/Feather";
import { pickFromGallery } from "../../util/fileUploadHelper";
import { useUpdateMeApi, useUpdateProfile } from "../../services/hooks/useApi";
import { refreshUser } from "../../store/authSlice";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { usePressScale } from "../../services/hooks/usePressScale";
import ChangePassword from "../../components/Modals/ChangePassword";
import { useNavigation } from "@react-navigation/native";

type AccountTypeKey = 'CorporateInvestor';

const accountType: Record<AccountTypeKey, string> = {
    CorporateInvestor: 'Corporate Investor',
};

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

const PersonalInformation = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const { mutateAsync: updateProfileMutate } = useUpdateProfile();
    const { mutateAsync, isPending, error: updateApiError } = useUpdateMeApi();
    const editAnim = usePressScale();
    const cancelAnim = usePressScale();
    const cameraAnim = usePressScale();
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const readOnly = !isEditing;

    const initialValues = {
        firstname: userDetails?.firstname,
        lastname: userDetails?.lastname,
        email: userDetails?.email,
        mobile: userDetails?.mobile,
        occupation: userDetails?.meta?.occupation ?? undefined,
        monthlyIncome: userDetails?.meta?.monthlyIncome ?? undefined,
        pan: userDetails?.meta?.panNumber ?? undefined,
        status: userDetails?.status,
        accountType: userDetails?.type && userDetails.type in accountType
            ? accountType[userDetails.type as AccountTypeKey]
            : userDetails?.type,
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
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
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
        <>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={personalInformationSchema}
                onSubmit={() => { }}
            >
                {({
                    handleChange,
                    values,
                    errors,
                    touched,
                    submitCount,
                }) => (
                    <SafeAreaView style={styles.root}>
                        <View style={styles.container}>
                            <View style={styles.editWrapper}>
                                <View style={styles.editRow}>
                                    <GoBack withoutText />

                                    <View style={styles.editActions}>
                                        {isEditing && (
                                            <Pressable
                                                onPress={() => setIsEditing(false)}
                                                onPressIn={cancelAnim.onPressIn}
                                                onPressOut={cancelAnim.onPressOut}
                                                style={{ padding: 4 }}
                                            >
                                                <Animated.Text style={[styles.cancelText, { transform: [{ scale: cancelAnim.scale }] }]}>
                                                    Cancel
                                                </Animated.Text>
                                            </Pressable>
                                        )}

                                        <Pressable
                                            style={styles.editBtn}
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
                                                <ActivityIndicator size="small" color={colors.icon.primary} />
                                            ) : (
                                                isEditing ?
                                                    <Feather name="check" size={18} color={colors.icon.primary} /> :
                                                    <AntDesign name="edit" size={15} color={colors.icon.primary} />

                                            )}
                                            <Animated.Text style={[styles.editText, { transform: [{ scale: editAnim.scale }] }]}>
                                                {isEditing ? "Update" : "Edit Profile"}
                                            </Animated.Text>
                                        </Pressable>
                                    </View>
                                </View>

                                <Pressable
                                    style={styles.changePasswordBtn}
                                    onPress={() => setShowChangePassword(true)}
                                >
                                    <Text style={styles.editText}>Change Password</Text>
                                </Pressable>

                                <View style={styles.profileWrapper}>
                                    <View style={styles.profile}>
                                        <View style={[styles.profileImageWrapper, {
                                            borderWidth: isImageUploading ? 1 : 0,
                                        }]}>
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
                                </View>
                            </View>

                            <KeyboardAwareScrollView
                                contentContainerStyle={{ flexGrow: 1 }}
                                keyboardShouldPersistTaps="always"
                                keyboardDismissMode="none"
                                enableAutomaticScroll
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.input}>
                                    <TextInputClassic
                                        label="First Name"
                                        value={values.firstname}
                                        onChangeText={handleChange('firstname')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly={readOnly}
                                        error={(touched.firstname || submitCount > 0) ? errors.firstname : undefined}
                                    />

                                    <TextInputClassic
                                        label="Last Name"
                                        value={values.lastname}
                                        onChangeText={handleChange('lastname')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly={readOnly}
                                        error={(touched.lastname || submitCount > 0) ? errors.lastname : undefined}
                                    />

                                    <TextInputClassic
                                        label="Email"
                                        value={values.email}
                                        onChangeText={handleChange('email')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly
                                        error={(touched.email || submitCount > 0) ? errors.email : undefined}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        disabled={isEditing}
                                    />

                                    <TextInputClassic
                                        label="Mobile Number"
                                        value={values.mobile}
                                        onChangeText={handleChange('mobile')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly
                                        error={(touched.mobile || submitCount > 0) ? errors.mobile : undefined}
                                        keyboardType="number-pad"
                                        disabled={isEditing}
                                    />

                                    <TextInputClassic
                                        label="Occupation"
                                        value={values.occupation}
                                        onChangeText={handleChange('occupation')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly
                                        error={(touched.occupation || submitCount > 0) ? errors.occupation : undefined}
                                        disabled={isEditing}
                                    />

                                    <TextInputClassic
                                        label="Monthly Income"
                                        value={values.monthlyIncome}
                                        onChangeText={handleChange('monthlyIncome')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly
                                        error={(touched.monthlyIncome || submitCount > 0) ? errors.monthlyIncome : undefined}
                                        disabled={isEditing}
                                    />

                                    <TextInputClassic
                                        label="PAN Number"
                                        value={values.pan}
                                        onChangeText={handleChange('pan')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly
                                        error={(touched.pan || submitCount > 0) ? errors.pan : undefined}
                                        autoCapitalize="characters"
                                        maxLength={10}
                                        disabled={isEditing}
                                    />

                                    <TextInputClassic
                                        label="Status"
                                        value={values.status}
                                        onChangeText={handleChange('status')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly
                                        error={(touched.status || submitCount > 0) ? errors.status : undefined}
                                        disabled={isEditing}
                                    />

                                    <TextInputClassic
                                        label="Account Type"
                                        value={values.accountType}
                                        onChangeText={handleChange('accountType')}
                                        style={styles.inputField}
                                        labelStyle={styles.inputLabel}
                                        readOnly
                                        error={(touched.accountType || submitCount > 0) ? errors.accountType : undefined}
                                        disabled={isEditing}
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                        </View>
                    </SafeAreaView>
                )}
            </Formik>

            <ChangePassword
                visible={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                onAction={() => {
                    navigation.goBack();
                }}
            />
        </>
    );
};

export default PersonalInformation;