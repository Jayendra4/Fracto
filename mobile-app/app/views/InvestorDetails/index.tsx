import { Image, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./InvestorDetails.style";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import InvestorActivityTimeline from "../../components/InvestorActivityTimeline";
import { useRoute } from "@react-navigation/native";
import { useGetBrokerLeadById } from "../../services/auth.service";
import { useMemo } from "react";

const InvestorDetails = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const routes = useRoute();
    const { leadId, investorId } = routes.params as { leadId: string, investorId: string };
    const { data } = useGetBrokerLeadById(leadId);

    const documents = data?.user?.kyc?.documents || [];

    const isKycCompleted = useMemo(() => {
        const requiredKeys = ['address_proof'];
        return requiredKeys.every(key =>
            documents.some((doc: any) => doc.key === key && doc.isVerified)
        );
    }, [documents]);

    const complianceData = [
        {
            id: '1',
            title: 'Investor KYC',
            subTitle: 'Government-issued ID and address proof verified',
            status: isKycCompleted ? 'Completed' : 'Pending',
        },
        {
            id: '2',
            title: 'Risk Disclosure Signed',
            subTitle: 'Investor has acknowledged investment risks',
            status: 'Pending',
        },
        {
            id: '3',
            title: 'Payment Readiness',
            subTitle: 'Payment method verified and ready',
            status: 'Pending',
        },
    ];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Pending':
                return {
                    background: styles.pendingBackground,
                    text: styles.pendingText,
                    dot: styles.pendingDot,
                    icon: <Feather
                        name="check-circle"
                        size={16}
                        color={styles.pendingText?.color}
                    />
                };
            case 'Completed':
                return {
                    background: styles.completedBackground,
                    text: styles.completedText,
                    dot: styles.completedDot,
                    icon: <MaterialIcons
                        name="manage-accounts"
                        size={20}
                        color={styles.completedText?.color}
                    />
                };
            default:
                return {};
        }
    };

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.infoWrapper}>
                        <View style={styles.profileBox}>
                            <Image
                                source={require("../../assets/images/avatar.png")}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        </View>
                        <View>
                            <Text style={styles.userName}>{data?.user?.name}</Text>
                            <Text style={styles.userId}>HOF ID: HOF-{data?.user?.id}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsWrapper}>
                        <Text style={styles.detailsTitle}>Basic Details</Text>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{data?.user?.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Mobile Number:</Text>
                            <Text style={styles.value}>{data?.user?.mobile}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Country:</Text>
                            <Text style={styles.value}>
                                {data?.user?.kyc?.address?.city}{" "}
                                {data?.user?.kyc?.address?.state}
                            </Text>
                        </View>
                        {/* <Pressable>
                            <Text style={styles.viewMore}>View More...</Text>
                        </Pressable> */}
                    </View>

                    <View style={[styles.divider, styles.horizontalSpace]} />

                    {/* <View style={styles.investmentWrapper}>
                        <View style={styles.headerRow}>
                            <Text style={styles.sectionTitle}>Invested Properties</Text>
                            <Text style={styles.seeAll}>See All</Text>
                        </View>

                        <View style={styles.cardWrapper}>
                            {investedData.map(item => (
                                <View key={item.id} style={styles.card}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <Text style={styles.cardSub}>Property ID: {item.propertyId}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.divider, styles.horizontalSpace]} /> */}

                    <View style={styles.complianceWrapper}>
                        <View style={styles.headerRow}>
                            <Text style={styles.sectionTitle}>Compliance Checklist</Text>
                            {/* <Text style={styles.seeAll}>See All</Text> */}
                        </View>

                        <View style={styles.complianceCard}>
                            {complianceData.map(item => {
                                const statusStyles = getStatusStyles(item.status);
                                return (
                                    <View key={item.id} style={styles.complianceItem}>
                                        <View
                                            style={[
                                                styles.statusIconWrapper,
                                                statusStyles.background
                                            ]}
                                        >
                                            {statusStyles.icon}
                                        </View>
                                        <View style={styles.itemLeft}>
                                            <Text style={styles.itemTitle}>{item.title}</Text>
                                            <Text style={styles.itemSub}>
                                                {item.subTitle}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                statusStyles.background
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.statusDot,
                                                    statusStyles.dot
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    statusStyles.text
                                                ]}
                                            >
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    </View>

                    <View style={[styles.divider, styles.horizontalSpace]} />

                    <InvestorActivityTimeline investorId={investorId} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default InvestorDetails;