import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyHeader from "../../components/Property/PropertyHeader";
import { useTheme } from "../../util/theme";
import { createStyles } from "./PreviewDocument.style";
import GoBack from "../../components/GoBack";
import { useRoute } from "@react-navigation/native";
import Pdf from "react-native-pdf";

const PreviewDocument = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const routes = useRoute();

    const { title, imageUrl } = routes?.params as {
        title: string;
        imageUrl: string;
    };

    const isPdf = imageUrl?.toLowerCase().includes(".pdf");

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
                <PropertyHeader />

                <View style={styles.wrapper}>
                    <View style={styles.headerRow}>
                        <GoBack withoutText />
                        <Text style={styles.headerTitle}>{title}</Text>
                    </View>
                </View>

                <View style={styles.cardsWrapper}>
                    {isPdf ? (
                        <Pdf
                            source={{ uri: imageUrl }}
                            style={styles.document}
                            trustAllCerts={false}
                        />
                    ) : (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.document}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default PreviewDocument;