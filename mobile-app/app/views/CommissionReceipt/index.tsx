import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../util/theme";
import { ScrollView, Text, View } from "react-native";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { createStyles } from "./CommissionReceipt.style";
import Feather from "react-native-vector-icons/Feather";
import Building from "../../assets/icons/building.svg";
import BuildingLight from "../../assets/icons/building-light.svg";
import InvestmentSelection from "../../assets/icons/investment-selection.svg";
import InvestmentSelectionLight from "../../assets/icons/investment-selection-light.svg";
import Money from "../../assets/icons/money.svg";
import MoneyLight from "../../assets/icons/money-light.svg";
import { InfoCard } from "../PropertyStatus";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { formatAmountWithCommas } from "../../util/helper";
import moment from "moment";

const CommissionReceipt = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const route = useRoute<any>();
    const receipt = route.params?.data;

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.titleWrapper}>
                        <Text style={styles.title}>Commission Receipt</Text>
                        <Text style={styles.subTitle}>
                            Receipt #RCP-2026-0142-HF
                        </Text>
                    </View>

                    <InfoCard>
                        <View style={styles.titleRowWrapper}>
                            <View style={styles.cardTitleIcon}>
                                {colors.isLight ? (
                                    <MoneyLight width={12} height={12} />
                                ) : (
                                    <Money width={12} height={12} />
                                )}
                            </View>
                            <Text style={styles.cardLabel}>Commission Amount</Text>
                        </View>
                        <Text style={styles.amount}>
                            ₹ {formatAmountWithCommas(receipt?.commissionAmount)}
                        </Text>
                    </InfoCard>

                    <InfoCard
                        icon={
                            colors.isLight ?
                                <BuildingLight width={24} height={24} /> :
                                <Building width={24} height={24} />
                        }
                        title="Property Details"
                    >
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Asset Name</Text>
                            <Text style={styles.infoValue}>{receipt?.asset?.title}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Asset ID</Text>
                            <Text style={styles.infoValue}>{receipt?.asset?.id}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Total Investment Value</Text>
                            <Text style={styles.infoValue}>
                                ₹ {formatAmountWithCommas(receipt?.baseAmount)}
                            </Text>
                        </View>
                    </InfoCard>

                    <InfoCard
                        icon={
                            colors.isLight ?
                                <InvestmentSelectionLight width={24} height={24} /> :
                                <InvestmentSelection width={24} height={24} />
                        }
                        title="Investor Details"
                    >
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Investor Name</Text>
                            <Text style={styles.infoValue}>
                                {receipt?.investor?.name}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Investor ID</Text>
                            <Text style={styles.infoValue}>{receipt?.investor?.id}</Text>
                        </View>
                    </InfoCard>

                    <InfoCard>
                        <View style={styles.titleRowWrapper}>
                            <View style={styles.cardTitleIcon}>
                                <Feather name="calendar" size={12} color={colors.text.extraLight} />
                            </View>
                            <Text style={styles.cardLabel}>Release Date</Text>
                        </View>
                        <Text style={styles.cardText}>
                            {moment(receipt?.createdAt).format('MMMM D, YYYY')}
                        </Text>
                    </InfoCard>

                    <InfoCard>
                        <View style={styles.titleRowWrapper}>
                            <View style={styles.cardTitleIcon}>
                                <Ionicons name="wallet-outline" size={12} color={colors.text.extraLight} />
                            </View>
                            <Text style={styles.cardLabel}>Wallet</Text>
                        </View>
                        <Text style={styles.cardText}>
                            Wallet
                        </Text>
                    </InfoCard>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

export default CommissionReceipt;