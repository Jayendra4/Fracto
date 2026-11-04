import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Colors, useTheme } from "../../util/theme";
import Background from "../../assets/images/get-started.png";

const GetStarted = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <ImageBackground
            source={Background}
            style={styles.wrapper}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.title}>
                    Marketplace for Real-World Assets
                </Text>

                <Text style={styles.desc}>
                    Buy, sell, and manage real-world assets securely and effortlessly.
                </Text>

                {/* <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Get Started</Text>
                    <Feather name="arrow-up-right" size={14} color={colors.constant.white} />
                </Pressable> */}
            </View>
            <Image
                source={require("../../assets/images/home.png")}
                style={styles.home}
                resizeMode="contain"
            />
        </ImageBackground>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        wrapper: {
            height: 122,
            marginHorizontal: 16,
            borderRadius: 10,
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: 'space-between',
            paddingLeft: 8,
        },
        container: {
            justifyContent: "center",
            flexShrink: 1,
        },
        title: {
            color: colors.constant.white,
            fontSize: 12,
            fontFamily: "WorkSans-Bold",
            marginBottom: 6,
        },
        desc: {
            color: colors.constant.white,
            fontSize: 10,
            fontFamily: "WorkSans-Regular",
        },
        button: {
            backgroundColor: colors.constant.darkblue,
            alignSelf: "flex-start",
            paddingHorizontal: 7,
            borderRadius: 4,
            minWidth: 95,
            height: 23,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        buttonText: {
            color: colors.constant.white,
            fontSize: 10,
            fontFamily: "WorkSans-Regular",
        },
        home: {
            width: 177,
            height: 125,
        },
    });

export default GetStarted;
