import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./VendorList.style";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import { ButtonAlignTypes, ButtonTextTypes, ButtonWidthTypes } from "../../components/buttons/Button.types";
import Table from "../../components/Table";
import { useVendorListApi } from "../../services/auth.service";
import { useEffect, useMemo, useState } from "react";
import AddVendorSuggestion from "../../components/Modals/AddVendorSuggestion";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../constant/Routes";
import { openWebsite } from "../../util/helper";
import { set } from "lodash";

const VendorList = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [vendorList, setVendorList] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const LIMIT = 10;
    const { data, refetch: refetchVendorList } = useVendorListApi(page, LIMIT);
    const navigation = useNavigation<NavigationProp>();
    const [showSuggestion, setShowSuggestion] = useState(false);


    const handleLoadMore = () => {
        if (loadingMore) return;

        if (data?.data?.length === LIMIT) {
            setLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (data?.data) {
            setVendorList(prev =>
                page === 1 ? data.data : [...prev, ...data.data]
            );
            setLoadingMore(false);
        }
    }, [data]);

    useEffect(() => {
        setPage(1);
        setVendorList([]);
    }, []);

    const columns = [
        {
            key: "name", title: "Name", width: 250,
            render: (_: string, row: any) => {
                return (
                    <View style={styles.startFirst}>
                        <Text style={styles.name} numberOfLines={1}>
                            {row?.name}
                        </Text>
                        <Text
                            style={[styles.name, { color: colors.text.link }]}
                            numberOfLines={1}
                            onPress={() => openWebsite(row?.website)}
                        >
                            {row?.website}
                        </Text>
                    </View>
                );
            },
        },
        { key: "category", title: "Category", width: 150 },
        { key: "description", title: "Description", width: 250 },
        {
            key: "contact", title: "Contact", width: 250,
            render: (_: string, row: any) => {
                return (
                    <View style={styles.startFirst}>
                        <Text style={styles.name} numberOfLines={1}>
                            {row?.contact}
                        </Text>
                        <Text
                            style={styles.name}
                            numberOfLines={1}
                        >
                            {row?.mobile || 'N/A'}
                        </Text>
                    </View>
                );
            },
        },
    ];

    const tableData = useMemo(() => {
        if (!data?.data) return [];

        return data.data.map((item: any) => ({
            id: item?.id,
            name: item?.name,
            category: item?.category,
            description: item?.description || "-",
            contact: item?.email,
            website: item?.website,
            mobile: item?.mobile,
        }));
    }, [data?.data]);

    return (
        <>
            <SafeAreaView style={styles.root}>
                <View style={styles.container}>
                    <PropertyHeader enableBack />

                    <View style={styles.main}>
                        <View style={styles.divider} />

                        <View style={styles.card}>
                            <View style={styles.allowShrink}>
                                <Text style={styles.title}>Vendor List</Text>

                                <Text style={styles.subtitle}>
                                    Find help and legal services for your asset onboardings
                                </Text>
                            </View>

                            <ButtonPrimary
                                title={ButtonTextTypes.Add_New_Suggestion}
                                width={ButtonWidthTypes.Half}
                                align={ButtonAlignTypes.Left}
                                style={{ width: "auto" }}
                                buttonStyle={styles.buttonStyle}
                                textStyle={styles.textStyle}
                                onPress={() => setShowSuggestion(true)}
                            />
                        </View>

                        {tableData?.length > 0 ? (
                            <Table columns={columns} data={tableData} onEndReached={handleLoadMore} loadingMore={loadingMore} />
                        ) : (
                            <Text style={styles.noHistoryText}>
                                Vendor list not found.
                            </Text>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            <AddVendorSuggestion
                visible={showSuggestion}
                onClose={() => setShowSuggestion(false)}
                onAction={() => {
                    refetchVendorList();
                    navigation.goBack();
                }}
            />
        </>
    );
};

export default VendorList;