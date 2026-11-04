import { View } from "react-native"
import { useTheme } from "../../util/theme";
import { createStyles } from "./Funds.style";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import AccountBalance from "../../components/AccountBalance";

const Funds = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                <AccountBalance />
            </View>
        </SafeAreaView>
    );
};

export default Funds;