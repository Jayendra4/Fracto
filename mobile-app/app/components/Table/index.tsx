import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { createStyles } from "./Table.style";
import { useTheme } from "../../util/theme";
import { FlatList } from "react-native-gesture-handler";

interface Column {
    key: string;
    title: string;
    width?: number;
    render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    alignItems?: "flex-start" | "center" | "flex-end";
    onEndReached?: () => void;
    loadingMore?: boolean;
}

const Table = ({ columns, data, alignItems = "flex-start", onEndReached, loadingMore }: TableProps) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const renderHeader = () => (
        <View style={styles.headerRow}>
            {columns.map((column) => (
                <View
                    key={column.key}
                    style={[
                        styles.cellContainer,
                        { alignItems },
                        column?.width ? { width: column.width } : undefined
                    ]}
                >
                    <Text style={styles.headerCell}>{column.title}</Text>
                </View>
            ))}
        </View>
    );

    const renderRow = (row: any, rowIndex: number) => {
        const isLast = rowIndex === data.length - 1;

        return (
            <View
                style={[
                    styles.row,
                    { borderBottomWidth: isLast ? 0 : 1 },
                ]}
            >
                {columns.map((column) => (
                    <View
                        key={column.key}
                        style={[
                            styles.cellContainer,
                            { alignItems },
                            column?.width ? { width: column.width } : undefined
                        ]}
                    >
                        {column.render ? (
                            column.render(row[column.key], row)
                        ) : (
                            <Text numberOfLines={1} style={styles.cell}>
                                {row[column.key]}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {renderHeader()}

                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={({ item, index }) => renderRow(item, index)}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={
                            loadingMore ? <ActivityIndicator size="small" /> : null
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default Table;