import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import LinearGradient from "react-native-linear-gradient";

const screenWidth = Dimensions.get("window").width;

const PortfolioGraph = () => {
    const data = [
        { value: 0, label: "Apr" },
        { value: 50, label: "May" },
        { value: 120, label: "Jun" },
        { value: 620, label: "Jul" },
        { value: 300, label: "Aug" },
        { value: 100, label: "Sept" },
        { value: 300, label: "Oct" },
        { value: 700, label: "Nov" },
        { value: 900, label: "Dec" },
    ];

    return (
        <LinearGradient
            colors={["#0E2A3A", "#1E4C6E"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientContainer}
        >
            <LineChart
                areaChart
                curved
                adjustToWidth
                data={data}
                width={screenWidth - 60}
                height={160}
                initialSpacing={10}
                endSpacing={10}
                spacing={(screenWidth - 70) / data?.length}
                thickness={1}
                hideDataPoints={true}
                dataPointsColor="#000"
                dataPointsRadius={4}
                color="#24CA4E"
                startFillColor="#11EE48"
                endFillColor="#11EE48"
                startOpacity={0.5}
                endOpacity={0.08}
                yAxisColor="transparent"
                xAxisColor="transparent"
                noOfSections={5}
                maxValue={1000}
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                rulesType="dashed"
                rulesColor="rgba(255,255,255,0.15)"
                pointerConfig={{
                    pointerStripHeight: 220,
                    pointerStripColor: "#33BD56",
                    pointerStripWidth: 2,
                    pointerColor: "#33BD56",
                    radius: 3,
                    pointerLabelWidth: 140,
                    pointerLabelHeight: -60,
                    shiftPointerLabelX: 0,
                    shiftPointerLabelY: 0,
                    activatePointersOnLongPress: false,
                    autoAdjustPointerLabelPosition: true,
                    pointerLabelComponent: (items: any) => {
                        const item = items[0];
                        const index = item.index;

                        const previousValue =
                            index > 0 ? data[index - 1].value : item.value;

                        const percentage =
                            previousValue === 0
                                ? 0
                                : (((item.value - previousValue) / previousValue) * 100).toFixed(1);

                        const isPositive = Number(percentage) >= 0;

                        return (
                            <View style={styles.pointerWrapper}>
                                <Text style={styles.pointerDateText}>
                                    {item.label}, 3:34 pm
                                </Text>

                                <Text style={styles.pointerValueText}>
                                    ₹{item.value.toLocaleString("en-IN")}{" "}
                                    <Text
                                        style={[
                                            styles.pointerPercentageText,
                                            isPositive
                                                ? styles.positiveText
                                                : styles.negativeText,
                                        ]}
                                    >
                                        {isPositive ? "+" : ""}
                                        {percentage}%
                                    </Text>
                                </Text>
                            </View>
                        );
                    },
                }}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        borderRadius: 4,
        paddingVertical: 24,
        paddingLeft: 10,
        paddingRight: 20,
        marginHorizontal: 16,
    },
    axisText: {
        color: "#F5F5F599",
        fontSize: 12,
        fontFamily: "WorkSans-Regular",
    },
    pointerWrapper: {
        backgroundColor: "#FFF",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 4,
        minWidth: 110,
    },
    pointerDateText: {
        fontSize: 10,
        color: "#757575",
        marginBottom: 2,
        fontFamily: 'WorkSans-Regular',
    },
    pointerValueText: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 13,
        color: "#070708",
    },
    pointerPercentageText: {
        fontSize: 12,
        fontFamily: 'WorkSans-Medium',
    },
    positiveText: {
        color: "#33BD56",
    },
    negativeText: {
        color: "#F03F23",
    },
});

export default PortfolioGraph;
