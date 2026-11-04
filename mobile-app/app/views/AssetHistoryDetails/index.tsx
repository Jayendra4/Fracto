import { Text, View, ScrollView, Image, Pressable, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./AssetHistoryDetails.style";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAssetByIdApi, useUpdateAssetStatus } from "../../services/auth.service";
import { useState } from "react";
import Toast from "react-native-toast-message";
import Video from "react-native-video";

const AssetHistoryDetails = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation();
    const routes = useRoute();
    const { propertyId, fromBrokerReferred, tab } = routes?.params as {
        propertyId: number;
        fromBrokerReferred?: boolean;
        tab?: string;
    };
    const { data } = useAssetByIdApi(propertyId);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewVideo, setPreviewVideo] = useState<string | null>(null);
    const { mutate, error } = useUpdateAssetStatus();

    const asset = data;

    const mapMeta = (meta: any[]) => {
        const obj: Record<string, any> = {};
        meta?.forEach((item) => {
            obj[item.metaKey] = item.metaValue;
        });
        return obj;
    };


    const handleStatusUpdate = (status: string) => {
        if (!asset?.id) return;

        const formattedStatus =
            status.charAt(0).toUpperCase() + status.slice(1);

        mutate(
            { id: asset.id, status: formattedStatus },
            {
                onSuccess: () => {
                    Toast.show({
                        type: "success",
                        text1: "Status updated successfully",
                    });

                    setTimeout(() => {
                        navigation.goBack();
                    }, 500);
                },

                onError: (err: any) => {
                    const message =
                        err?.message ||
                        error?.message ||
                        "Something went wrong";

                    Toast.show({
                        type: "error",
                        text1: message,
                    });
                },
            }
        );
    };

    const config = (() => {
        switch (tab) {
            case "pending":
                return {
                    show: true,
                    approveText: "Approve",
                    rejectText: "Reject",
                };

            case "approved":
                return {
                    show: true,
                    approveText: "Approved",
                    rejectText: "",
                };

            case "rejected":
                return {
                    show: false,
                    approveText: "Rejected",
                    rejectText: "",
                };

            default:
                return {
                    show: false,
                    approveText: "",
                    rejectText: "",
                };
        }
    })();

    const groupDocuments = (documents: any[]) => {
        return {
            images: documents?.filter(d => d.documentType === "ASSET_IMAGE"),
            videos: documents?.filter(d => d.documentType === "ASSET_VIDEO"),
            propertyDocs: documents?.filter(
                d =>
                    !["ASSET_IMAGE", "ASSET_VIDEO"].includes(d.documentType)
            )
        };
    };

    const meta = mapMeta(asset?.meta || []);
    const docs = groupDocuments(asset?.documents || []);

    const Info = ({ label, value }: { label: string; value: any }) => (
        <View style={{ marginTop: 14 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>
                {value || "N/A"}
            </Text>
        </View>
    );

    return (
        <>
            <SafeAreaView style={styles.root}>
                <View style={styles.container}>
                    <PropertyHeader enableBack />

                    <ScrollView contentContainerStyle={styles.main}>
                        <View style={styles.divider} />

                        <View style={styles.card}>
                            <Text style={styles.title}>{asset?.assetTitle}</Text>

                            <Text style={styles.subtitle}>
                                Full Specialization and Documentation of your asset
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                            <View style={styles.sectionDivider} />

                            <Info label="Asset Type" value={asset?.assetType} />
                            <Info label="Current Owner" value={asset?.currentOwnerName} />
                            <Info label="Status" value={asset?.status} />
                            <Info label="Verification" value={asset?.isVerified ? "Verified" : "Pending"} />
                            <Info label="Submission Date" value={asset?.createdAt?.slice(0, 10)} />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Technical & Financial Details
                            </Text>
                            <View style={styles.sectionDivider} />

                            <Info label="Geo Location" value={meta.geoLocation} />
                            <Info label="City" value={meta.city} />
                            <Info label="State" value={meta.state} />
                            <Info label="Country" value={meta.country} />
                            <Info label="Pincode" value={meta.pincode} />

                            <Info label="Asset Sub Type" value={meta.assetSubType} />
                            <Info label="Short Description" value={meta.shortDescription} />
                            <Info label="Detailed Description" value={meta.detailedDescription} />

                            <Info label="Ownership Entity Type" value={meta.ownershipEntityType} />
                            <Info label="Title Status" value={meta.titleStatus} />
                            <Info label="RERA Registration Number" value={meta.reraRegistrationNumber} />

                            <Info label="Land Area" value={meta.landArea} />
                            <Info label="Builtup Area" value={meta.builtupArea} />
                            <Info label="Year Of Construction" value={meta.yearOfConstruction} />
                            <Info label="Asset Age" value={meta.assetAge} />

                            <Info label="NOC" value={meta.noc} />
                            <Info label="Market Value" value={meta.marketValue} />
                            <Info label="Currency" value={meta.currency} />
                            <Info label="Valuation Agency Name" value={meta.valuationAgencyName} />

                            <Info label="Rental Income Monthly" value={meta.rentalIncomeMonthly} />
                            <Info label="Lease Tenure Remaining Month" value={meta.leaseTenureRemainingMonths} />
                            <Info label="Last 3 Years Revenue" value={meta.last3YearRevenue} />
                            <Info label="Operational Expenses Annual" value={meta.operationalExpensesAnnual} />
                            <Info label="Net Operational Income" value={meta.netOperationalIncome} />

                            <Info label="Expected Yield Percentage" value={meta.expectedYieldPercentage} />
                            <Info label="Expected Appreciation Percentage" value={meta.expectedAppreciationPercentage} />

                            <Info label="Financials" value={meta.financials} />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Documents & Media</Text>
                            <View style={styles.sectionDivider} />

                            <Text style={styles.subTitle}>Asset Image</Text>
                            {docs.images.map((img: any) => (
                                <Pressable
                                    key={img.id}
                                    onPress={() => setPreviewImage(img.url)}
                                >
                                    <Image
                                        source={{ uri: img.url }}
                                        style={styles.image}
                                    />
                                </Pressable>
                            ))}

                            <View style={styles.sectionDivider} />

                            <Text style={styles.subTitle}>Asset Video</Text>

                            {docs.videos.map((video: any) => (
                                <View style={styles.videoBox}>
                                    <Video
                                        source={{ uri: video.url }}
                                        style={styles.videoPlayer}
                                        resizeMode="contain"
                                    />

                                    <Pressable
                                        style={StyleSheet.absoluteFill}
                                        onPress={() => setPreviewVideo(video.url)}
                                    >
                                        <Text style={styles.playIcon}>▶</Text>
                                    </Pressable>
                                </View>
                            ))}

                            <View style={styles.sectionDivider} />

                            <Text style={styles.subTitle}>Property Documents</Text>

                            {docs.propertyDocs.map((doc: any) => (
                                <Pressable
                                    key={doc.id}
                                    onPress={() => setPreviewImage(doc.url)}
                                >
                                    <Image
                                        source={{ uri: doc.url }}
                                        style={styles.docImage}
                                    />
                                </Pressable>
                            ))}
                        </View>
                        {fromBrokerReferred && config.show && (
                            <View style={styles.bottomContainer}>
                                <Pressable
                                    style={[
                                        styles.approveBtn,
                                        tab === "approved" && { opacity: 0.6, marginLeft: "auto" },
                                    ]}
                                    onPress={() => handleStatusUpdate("approved")}
                                    disabled={tab === "approved"}
                                >
                                    <Text style={styles.btnText}>
                                        {config.approveText}
                                    </Text>
                                </Pressable>

                                {tab === "pending" && (
                                    <Pressable
                                        style={styles.rejectBtn}
                                        onPress={() => handleStatusUpdate("rejected")}
                                    >
                                        <Text style={styles.btnText}>
                                            {config.rejectText}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>

            <Modal
                visible={!!previewImage}
                transparent
                animationType="fade"
            >
                <Pressable
                    style={styles.imagePreviewContainer}
                    onPress={() => setPreviewImage(null)}
                >
                    <Image
                        source={{ uri: previewImage || "" }}
                        style={styles.previewImage}
                    />
                </Pressable>
            </Modal>

            <Modal
                visible={!!previewVideo}
                animationType="slide"
                transparent
            >
                <Pressable
                    style={styles.videoPreviewContainer}
                    onPress={() => setPreviewVideo(null)}
                >
                    <Video
                        source={{ uri: previewVideo || "" }}
                        style={styles.previewVideo}
                        controls
                        resizeMode="contain"
                        paused={false}
                    />
                </Pressable>
            </Modal>
        </>
    );
};

export default AssetHistoryDetails;