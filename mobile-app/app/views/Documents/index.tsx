import { Animated, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./Documents.style";
import GoBack from "../../components/GoBack";
import Feather from "react-native-vector-icons/Feather";
import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import Routes, { NavigationProp } from "../../constant/Routes";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { EntityDocument } from "../../store/authSlice.types";
import { usePressScale } from "../../services/hooks/usePressScale";

interface Card {
    title: string;
    imageUrl: string;
}

const Documents = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const navigation = useNavigation<NavigationProp>();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const documents: EntityDocument[] =
        userDetails?.entityDocument ?? [];

    const uniqueDocuments = documents.filter(
        (doc, index, self) =>
            index === self.findIndex(d => d.documentName === doc.documentName)
    );

    const showPreview = useCallback((title: string, imageUrl: string) => {
        navigation.navigate(Routes.PROFILE.PREVIEWDOCUMENT, {
            title,
            imageUrl,
        });
    }, [navigation]);

    const DocumentCard = ({ title, imageUrl }: Card) => {
        const { scale, onPressIn, onPressOut } = usePressScale();
        const isPdf = imageUrl?.toLowerCase().endsWith(".pdf");

        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {title}
                </Text>

                <View style={styles.previewSide}>
                    {isPdf ? (
                        <View>
                            <Feather
                                name="file-text"
                                size={14}
                                color={colors.text.primary}
                            />
                            <Text style={styles.pdfText}>PDF</Text>
                        </View>
                    ) : (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.prePreview}
                            resizeMode="cover"
                        />
                    )}

                    <View style={styles.divider} />

                    <Pressable
                        style={[styles.previewSide, { paddingVertical: 8 }]}
                        onPress={() => showPreview(title, imageUrl)}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                    >
                        <Animated.Text style={[styles.previewText, { transform: [{ scale }] }]}>Preview</Animated.Text>
                        <Feather
                            name="eye"
                            size={12}
                            color={colors.text.primary}
                        />
                    </Pressable>
                </View>
            </View>
        )
    };

    const EmptyDocuments = () => (
        <View style={styles.emptyContainer}>
            <Feather
                name="file-text"
                size={48}
                color={colors.text.lightGrey}
            />
            <Text style={styles.emptyTitle}>No documents uploaded</Text>
            <Text style={styles.emptySubtitle}>
                Your uploaded documents will appear here
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />
                <View style={styles.wrapper}>
                    <View style={styles.headerRow}>
                        <GoBack withoutText />
                        <Text style={styles.headerTitle}>Documents</Text>
                    </View>
                </View>
                <View style={styles.cardsWrapper}>
                    {uniqueDocuments?.length === 0 ? (
                        <EmptyDocuments />
                    ) : (
                        uniqueDocuments.map(doc => (
                            <DocumentCard
                                key={doc?.id}
                                title={doc?.documentName}
                                imageUrl={doc?.url}
                            />
                        ))
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Documents;