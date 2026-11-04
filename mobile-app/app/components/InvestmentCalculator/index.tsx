import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, useTheme } from '../../util/theme';
import CustomSlider from './CustomSlider';
import { BarChart } from 'react-native-gifted-charts';

const YEARS = [2026, 2027, 2028, 2029, 2030];
const CHART_HEIGHT = 170;

const PROPERTY_PRICE = 5_000_000;

const InvestmentCalculator = ({ onSummaryChange }: any) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [fraction, setFraction] = useState(20);
    const [growth, setGrowth] = useState(15);
    const [rentalYield, setRentalYield] = useState(6);

    const data = useMemo(() => {
        const invested = (PROPERTY_PRICE * fraction) / 100;

        return YEARS.map((_, index) => {
            const year = index + 1;

            const rental =
                invested * (rentalYield / 100) * year;

            const appreciation =
                invested * ((growth / 100) / 5) * year;

            return {
                principal: invested,
                rental,
                appreciation,
            };
        });
    }, [fraction, growth, rentalYield]);

    const calculatedSummary = useMemo(() => {
        if (!data?.length) return null;
        return data[data?.length - 1];
    }, [data]);

    useEffect(() => {
        if (onSummaryChange && calculatedSummary) {
            onSummaryChange(calculatedSummary);
        }
    }, [calculatedSummary, onSummaryChange]);

    const maxValue = Math.max(
        ...data.map(
            d => d.principal + d.rental + d.appreciation
        )
    );

    const screenWidth = Dimensions.get('window').width;
    const horizontalPadding = 32;
    const availableWidth = screenWidth - horizontalPadding;

    const totalBars = YEARS?.length;
    const barWidth = 32;

    const spacing =
        (availableWidth - totalBars * barWidth) / (totalBars + 1);

    return (
        <View style={styles.descriptionWrapper}>
            <View style={styles.header}>
                <Ionicons
                    name="arrow-forward-circle-outline"
                    size={18}
                    color={colors.icon.primary}
                />
                <Text style={styles.descriptionTitle}>
                    Investment Calculator
                </Text>
            </View>

            <View style={styles.sliderBlock}>
                <Text style={styles.sliderLabel}>
                    Fraction Owned
                </Text>
                <CustomSlider
                    value={fraction}
                    min={1}
                    max={100}
                    onChange={setFraction}
                    trackColor={colors.text.primary}
                    thumbColor={colors.isLight ? colors.background.blue : colors.constant.white}
                />
            </View>

            <View style={styles.sliderBlock}>
                <Text style={styles.sliderLabel}>
                    Property Value Growth (5 years)
                </Text>
                <CustomSlider
                    value={growth}
                    min={5}
                    max={40}
                    onChange={setGrowth}
                    trackColor={colors.text.primary}
                    thumbColor={colors.isLight ? colors.background.blue : colors.constant.white}
                />
            </View>

            <View style={styles.sliderBlock}>
                <Text style={styles.sliderLabel}>
                    Expected Annual Rental Yield
                </Text>
                <CustomSlider
                    value={rentalYield}
                    min={2}
                    max={12}
                    step={0.5}
                    onChange={setRentalYield}
                    thumbColor={colors.isLight ? colors.background.blue : colors.constant.white}
                    trackColor={colors.text.primary}
                />
            </View>

            <View style={styles.chartWrapper}>
                <BarChart
                    width={availableWidth}
                    stackData={data.map((item, index) => ({
                        stacks: [
                            { value: item.principal, color: '#EAEAEA' },
                            { value: item.rental, color: '#2F5BCC' },
                            { value: item.appreciation, color: '#FFB816' },
                        ],
                        label: YEARS[index].toString(),
                    }))}
                    height={CHART_HEIGHT}
                    barWidth={barWidth}
                    spacing={spacing}
                    initialSpacing={spacing}
                    endSpacing={spacing}
                    roundedTop
                    rulesColor="rgba(255,255,255,0.08)"
                    yAxisTextStyle={{
                        color: colors.text.default,
                        fontSize: 11,
                        fontFamily: 'WorkSans-Regular',
                    }}
                    xAxisLabelTextStyle={{
                        color: colors.text.default,
                        fontSize: 12,
                        fontFamily: 'WorkSans-Regular',
                    }}
                    noOfSections={4}
                    maxValue={maxValue}
                    yAxisColor="transparent"
                    xAxisColor="transparent"
                    isAnimated
                    animationDuration={600}
                    disablePress
                />
            </View>
        </View>
    );
};

const createStyles = (colors: Colors) => StyleSheet.create({
    descriptionWrapper: {
        marginHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        columnGap: 8,
    },
    descriptionTitle: {
        fontSize: 16,
        fontFamily: 'WorkSans-Medium',
        color: colors.text.default,
    },
    sliderBlock: {
        marginBottom: 10,
        marginLeft: 30,
    },
    sliderLabel: {
        color: colors.isLight ? colors.text.lightGrey : '#C4C4C4',
        fontSize: 10,
        fontFamily: 'WorkSans-Medium',
    },
    chartWrapper: {
        marginTop: 20,
        width: '100%',
    },
    chartInner: {
        alignSelf: 'flex-end',
    },
    chartRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    yAxis: {
        width: 45,
    },
})

export default InvestmentCalculator;
