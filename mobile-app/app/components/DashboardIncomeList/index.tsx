import { FlatList, Text, View } from "react-native";
import { useTheme } from "../../util/theme";
import { createStyles } from "./DashboardIncomeList.style";
import Ionicons from "react-native-vector-icons/Ionicons";
import { formatAmountWithCommas } from "../../util/helper";

const incomeListData = [
    {
        id: '1',
        propertyName: 'Residential Complex Aurora',
        location: 'Mr-10 Indore, MP, India',
        income: '₹ 12,500.45',
        growth: '+15%',
        isNegative: false,
    },
    {
        id: '2',
        propertyName: 'Green Valley Residency',
        location: 'Vijay Nagar, Indore, MP',
        income: '₹ 10,250.00',
        growth: '-8%',
        isNegative: true,
    },
    {
        id: '3',
        propertyName: 'Skyline Heights',
        location: 'Palasia, Indore, MP',
        income: '₹ 14,800.90',
        growth: '+12%',
        isNegative: false,
    },
    {
        id: '4',
        propertyName: 'Elite Towers',
        location: 'Bhawarkua, Indore, MP',
        income: '₹ 11,300.25',
        growth: '+6%',
        isNegative: false,
    },
];

const IncomeItem = ({ item }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={styles.incomeCard}>
            <View style={styles.incomeCardHeader}>
                <Text style={styles.propertyName} numberOfLines={1}>
                    {item.propertyName}
                </Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={8} color="#757575" />
                    <Text style={styles.locationText}>{item.location}</Text>
                </View>
            </View>

            <View style={styles.dividerSmall} />

            <View style={styles.incomeBottomRow}>
                <View style={{ flexShrink: 1 }}>
                    <Text style={styles.incomeLabel}>Income Collected</Text>
                    <Text style={styles.incomeAmount} numberOfLines={1}>
                        {item.income}
                    </Text>
                </View>

                <View
                    style={[
                        styles.growthBadge,
                        item.isNegative
                            ? styles.residentNegativeBadge
                            : styles.residentPositiveBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.growthText,
                            item.isNegative
                                ? styles.residentNegativeText
                                : styles.residentPositiveText,
                        ]}
                    >
                        {item.growth}
                    </Text>

                    <Ionicons
                        name={item.isNegative ? 'trending-down' : 'trending-up'}
                        size={24}
                        color={
                            item.isNegative
                                ? colors.icon.danger
                                : colors.icon.green
                        }
                    />
                </View>
            </View>
        </View>
    )
};

const DashboardIncomeList = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.incomeContainer}>
            <View style={styles.incomeHeader}>
                <Text style={styles.incomeMeta}>Total Property Invested: 06</Text>

                <View style={styles.incomeHeaderRow}>
                    <Text style={styles.incomeTitle}>Total Income Collected</Text>
                    <Text style={styles.incomeTotal} numberOfLines={1}>
                        ₹ {formatAmountWithCommas('238845.09')}
                    </Text>
                </View>

                <View style={[styles.growthBadge, styles.incomePositiveBadge]}>
                    <Text style={[styles.growthText, styles.incomeGrowthText]}>
                        +15%
                    </Text>
                    <Ionicons name="trending-up" size={24} color={colors.icon.green} />
                </View>
            </View>

            <View style={styles.divider} />

            <FlatList
                data={incomeListData}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <IncomeItem item={item} styles={styles} colors={colors} />
                )}
            />
        </View>
    )
};

export default DashboardIncomeList;