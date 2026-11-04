import { StyleSheet, View } from "react-native";
import SkeletonClassic from "../../util/SkeletonClassic";

const DetailsSkeletonLoader = () => {
    return (
        <View style={styles.container}>
            <SkeletonClassic
                height={190}
                width="auto"
                borderRadius={4}
            />
            <SkeletonClassic
                height={70}
                width="70%"
                borderRadius={4}
                style={{ marginTop: 40 }}
            />
            <SkeletonClassic
                height={20}
                width="60%"
                borderRadius={4}
                style={{ marginTop: 20 }}
            />
            <SkeletonClassic
                height={40}
                width="80%"
                borderRadius={4}
                style={{ marginTop: 10 }}
            />
            <SkeletonClassic
                height={183}
                width="auto"
                borderRadius={8}
                style={{ marginTop: 20 }}
            />
            <SkeletonClassic
                height={200}
                width="auto"
                borderRadius={8}
                style={{ marginTop: 40 }}
            />
            <SkeletonClassic
                height={200}
                width="auto"
                borderRadius={8}
                style={{ marginTop: 40 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
    },
})

export default DetailsSkeletonLoader;