import React from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
} from "react-native";
import { Colors, useTheme } from "../../util/theme";
import Feather from "react-native-vector-icons/Feather";

const DATA = [
    {
        id: "1",
        title: "3 Leads waiting for Investor KYC",
        description:
            "Complete KYC to move these leads forward and unlock commissions",
        cta: "Review Leads",
    },
    {
        id: "2",
        title: "2 Assets missing disclosures",
        description:
            "Submit required legal disclosures to make these assets marketable",
        cta: "Add Disclosures",
    },
    {
        id: "3",
        title: "₹1,25,000 commission on hold",
        description:
            "Investor documentation incomplete. Fix to release payment.",
        cta: "Fix Now",
    },
    {
        id: "4",
        title: "5 New property listings available",
        description:
            "New fractional assets added to your portfolio. Review and start selling.",
        cta: "View Properties",
    },
];

const NeedsAttention = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Feather name="info" size={20} color={colors.icon.primary} />
                <Text style={styles.header}>What Needs Attention Today</Text>
            </View>

            {DATA.map(item => (
                <View key={item.id} style={styles.card}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>

                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>
                            {item.cta} <Text style={styles.arrow}>→</Text>
                        </Text>
                    </Pressable>
                </View>
            ))}
        </View>
    );
};

const createStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.background.slightly,
            padding: 16,
            marginHorizontal: 16,
            borderWidth: 1.4,
            borderColor: "#F5F5F51A",
            borderRadius: 8,
            rowGap: 16,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 10,
        },
        header: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-Regular',
        },
        card: {
            backgroundColor: colors.background.default,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: "#F5F5F533",
        },
        title: {
            color: colors.text.default,
            fontSize: 16,
            fontFamily: 'WorkSans-SemiBold',
            marginBottom: 4,
        },
        description: {
            color: colors.text.extraLight,
            fontSize: 12,
            fontFamily: 'WorkSans-Regular',
            marginBottom: 14,
        },
        button: {
            alignSelf: "flex-start",
            backgroundColor: colors.isLight ? colors.background.darkBlue : "#F5F5F552",
            paddingHorizontal: 14,
            paddingVertical: 4,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#F5F5F566',
        },
        buttonText: {
            color: colors.text.default,
            fontSize: 14,
            fontFamily: 'WorkSans-Regular',
        },
        arrow: {
            fontSize: 14,
        },
    });

export default NeedsAttention;
