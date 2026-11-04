import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../util/theme";
import { ScrollView, Text, View } from "react-native";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { createStyles } from "./PropertyStatus.style";
import { ReactNode } from "react";
import Feather from "react-native-vector-icons/Feather";
import Building from "../../assets/icons/building.svg";
import BuildingLight from "../../assets/icons/building-light.svg";
import ProcessTimeline from "../../components/ProcessTimeline";
import Money from "../../assets/icons/money.svg";
import MoneyLight from "../../assets/icons/money-light.svg";
import { useRoute } from "@react-navigation/native";
import { formatAmountWithCommas } from "../../util/helper";
import moment from "moment";

interface Props {
    title?: string;
    icon?: React.ReactNode;
    children: ReactNode;
}

export const InfoCard = ({ title, icon, children }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.card}>
            {title && (
                <View style={[styles.titleRowWrapper, { marginBottom: 16 }]}>
                    {icon}
                    <Text style={styles.infotitle}>{title}</Text>
                </View>
            )}
            {children}
        </View>
    );
};

const PropertyStatus = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const route = useRoute<any>();
    const property = route.params?.data;

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
                        <Text style={styles.title}>Property Status</Text>
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
                            ₹ {formatAmountWithCommas(property?.commissionAmount)}
                        </Text>
                    </InfoCard>

                    <InfoCard>
                        <View style={styles.titleRowWrapper}>
                            <Feather name="calendar" size={16} color={colors.icon.primary} />
                            <Text style={styles.cardLabel}>Expected Release</Text>
                        </View>
                        <Text style={styles.cardValue}>
                            {moment(property?.createdAt).format('MMMM D, YYYY')}
                        </Text>
                    </InfoCard>

                    <InfoCard
                        icon={
                            colors.isLight ?
                                <BuildingLight width={24} height={24} /> :
                                <Building width={24} height={24} />
                        }
                        title="Property Information"
                    >
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Property Name</Text>
                            <Text style={styles.infoValue}>{property?.asset?.title}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>Delhi, India</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Asset Type</Text>
                            <Text style={styles.infoValue}>
                                {property?.referralUsesType}
                            </Text>
                        </View>
                    </InfoCard>

                    <InfoCard
                        icon={<Feather name="user" size={24} color={colors.icon.primary} />}
                        title="Investor Information"
                    >
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Investor Name</Text>
                            <Text style={styles.infoValue}>
                                {property?.investor?.name}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Investor ID</Text>
                            <Text style={styles.infoValue}>{property?.investor?.id}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>
                                Transaction Date
                            </Text>
                            <Text style={styles.infoValue}>
                                {moment(property?.createdAt).format('MMMM D, YYYY')}
                            </Text>
                        </View>
                    </InfoCard>

                    <ProcessTimeline activeStep={3} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

export default PropertyStatus;