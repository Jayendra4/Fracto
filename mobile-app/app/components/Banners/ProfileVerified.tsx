import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { Colors, useTheme } from "../../util/theme";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import CheckStar from "../../assets/icons/check-star.svg";
import moment from "moment";

const ProfileVerified = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const userDetails = useSelector((state: RootState) => state.auth.user);

    return (
        <LinearGradient
            colors={["#002A57", "#14406E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <View style={styles.topRow}>
                <Image
                    source={userDetails?.profileImage ?
                        { uri: userDetails?.profileImage } :
                        require("../../assets/images/avatar.png")
                    }
                    style={styles.avatar}
                    resizeMode="cover"
                />

                <View style={styles.userInfo}>
                    <Text
                        style={styles.name}
                        numberOfLines={1}
                    >
                        {`${userDetails?.firstname} ${userDetails?.lastname}`}
                    </Text>
                    <Text
                        style={styles.email}
                        numberOfLines={1}
                    >
                        {userDetails?.email}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bottomRow}>
                <View>
                    <Text style={styles.label}>Member Since</Text>
                    <Text style={styles.value}>
                        {moment(userDetails?.createdAt).format("MMMM YYYY")}
                    </Text>
                </View>
                <View>
                    <Text style={styles.label}>Status</Text>
                    <View style={[styles.verifiedBadge, {
                        borderColor: userDetails?.isVerified ?
                            colors.border.green :
                            colors.border.danger,
                        backgroundColor: userDetails?.isVerified ?
                            "#043711" : "#5001019c",
                    }]}>
                        <Text style={styles.verifiedText}>
                            {userDetails?.isVerified ? 'Verified' : 'Unverified'}
                        </Text>
                        <CheckStar width={14} height={14} />
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            height: 182,
            borderRadius: 10,
            padding: 16,
            justifyContent: "space-between",
            marginHorizontal: 16,
        },
        topRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        avatar: {
            width: 70,
            height: 70,
            borderRadius: 100,
            marginRight: 12,
        },
        userInfo: {
            flex: 1,
        },
        name: {
            color: colors.constant.white,
            fontSize: 20,
            fontFamily: 'WorkSans-Medium',
        },
        email: {
            color: colors.constant.white,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        divider: {
            height: 1,
            backgroundColor: "#656565",
        },
        bottomRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        label: {
            color: "#BABABA",
            fontSize: 12,
            fontFamily: 'WorkSans-Medium',
        },
        value: {
            color: colors.constant.white,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
            marginTop: 2,
        },
        verifiedBadge: {
            backgroundColor: "#043711",
            borderWidth: 1,
            borderColor: colors.border.green,
            borderRadius: 20,
            paddingVertical: 4,
            paddingHorizontal: 12,
            columnGap: 6,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 6,
            flexDirection: 'row',
        },
        verifiedText: {
            color: colors.constant.white,
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
        },
    });


export default ProfileVerified;
