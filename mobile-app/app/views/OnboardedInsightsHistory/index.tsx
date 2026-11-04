import { View, Text } from "react-native";
import { useTheme } from "../../util/theme";
import { createStyles } from "./OnboardedInsightsHistory.style";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import Table from "../../components/Table";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAssetByIdApi, useAssetHistoryByIdApi } from "../../services/auth.service";
import { useCallback, useMemo } from "react";
import { capitalizeWords, formatAmountWithCommas } from "../../util/helper";
import Routes, { NavigationProp } from "../../constant/Routes";

const columns = [
    { key: "sno", title: "S.No.", width: 80 },
    { key: "date", title: "Date", width: 120 },
    { key: "name", title: "Investor Name", width: 200 },
    { key: "type", title: "Type", width: 150 },
    { key: "fractions", title: "Fractions", width: 90 },
    { key: "price", title: "Price / Unit", width: 150 },
    { key: "total", title: "Total Amount", width: 150 },
];

const OnboardedInsightsHistory = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const routes = useRoute();
    const { propertyId } = routes?.params as { propertyId: number };
    const { data } = useAssetByIdApi(propertyId);
    const { data: history } = useAssetHistoryByIdApi(propertyId);

    const metaMap = useMemo(() => {
        const map: Record<string, any> = {};
        data?.meta?.forEach((m: any) => {
            map[m.metaKey] = m.metaValue;
        });
        return map;
    }, [data?.meta]);

    const city = capitalizeWords(metaMap.city);

    const wayToDetails = useCallback(() => {
        navigation.navigate(Routes.PROPERTY.DETAILS, {
            propertyId,
        })
    }, [navigation, propertyId]);

    const tableData = useMemo(() => {
        if (!history?.data) return [];

        return history.data.map((item: any, index: number) => ({
            sno: String(index + 1).padStart(2, "0"),
            date: new Date(item?.date).toLocaleDateString("en-GB"),
            name: item?.investorName,
            type: capitalizeWords(item?.type),
            fractions: item?.fractions,
            price: formatAmountWithCommas(item?.pricePerUnit),
            total: formatAmountWithCommas(item?.totalAmount),
        }));
    }, [history?.data]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader enableBack />

                <View style={styles.main}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.title}>{data?.assetTitle}</Text>
                        <Text style={styles.subtitle}>{city} | {data?.assetType}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Fraction Summary</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Total Fractions</Text>
                            <Text style={styles.value}>
                                {formatAmountWithCommas(data?.totalFractions)}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Text style={styles.label}>Fraction Sold</Text>
                            <Text style={[styles.value, styles.green]}>{data?.soldFractions}</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Text style={styles.label}>Remaining</Text>
                            <Text style={[styles.value, styles.blue]}>
                                {formatAmountWithCommas(data?.remainingFractions)}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View>
                            <Text style={styles.label}>Total Amount Sold</Text>
                            <Text style={styles.amount}>
                                ₹ {formatAmountWithCommas(data?.totalSoldAmount)}
                            </Text>
                        </View>

                        <ButtonPrimary
                            title={ButtonTextTypes.View_Property_Details}
                            width={ButtonWidthTypes.Full}
                            align={ButtonAlignTypes.Center}
                            buttonStyle={styles.button}
                            textStyle={styles.buttonText}
                            onPress={wayToDetails}
                        />
                    </View>

                    <View style={styles.historyWrapper}>
                        <Text style={styles.sectionTitle}>Fraction Purchase History</Text>

                        {tableData?.length > 0 ? (
                            <Table columns={columns} data={tableData} alignItems="center" />
                        ) : (
                            <Text style={styles.noHistoryText}>No purchase history available for this asset.</Text>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default OnboardedInsightsHistory;