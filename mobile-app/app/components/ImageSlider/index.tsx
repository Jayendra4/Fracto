import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
    View,
    ScrollView,
    Image,
    Dimensions,
    StyleSheet,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    Animated,
    Easing,
    Modal,
    Text,
} from "react-native";
import { Colors, useTheme } from "../../util/theme";
import BookmarkSecondary from "../../assets/icons/bookmark_secondary.svg";
import BookmarkPrimary from "../../assets/icons/bookmark_primary.svg";
import Feather from "react-native-vector-icons/Feather";
import { useSaveAssetApi } from "../../services/hooks/useApi";
import Video from "react-native-video";

const { width, height } = Dimensions.get("window");

interface Props {
    images: string[];
    videos: string[];
    propertyId: number;
    isFavourite?: boolean;
}

const VISIBLE_DOTS = 5;

const ImageSlider: React.FC<Props> = ({ images, videos, propertyId, isFavourite }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [index, setIndex] = useState(0);
    const [dotSizes, setDotSizes] = useState<Animated.Value[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(isFavourite ?? false);
    const { mutateAsync: saveAssetMutation, isPending } = useSaveAssetApi();
    const [modalType, setModalType] = useState<"image" | "video">("image");
    const mediaArray = modalType === "image" ? images : videos;

    useEffect(() => {
        setDotSizes(images.map(() => new Animated.Value(2)));
        setIndex(0);
    }, [images]);

    useLayoutEffect(() => {
        setIsSaved(isFavourite ?? false);
    }, [isFavourite]);

    useEffect(() => {
        if (!dotSizes?.length) return;

        dotSizes?.forEach((anim, i) => {
            const distance = Math.abs(i - index);

            let targetSize = 2;
            if (distance === 0) targetSize = 8;
            else if (distance === 1) targetSize = 4;

            Animated.timing(anim, {
                toValue: targetSize,
                duration: 180,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }).start();
        });
    }, [index, dotSizes]);

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pageIndex = Math.round(
            e.nativeEvent.contentOffset.x / (width - 32)
        );
        setIndex(pageIndex);
    };

    const half = Math.floor(VISIBLE_DOTS / 2);

    const startIndex = Math.max(
        0,
        Math.min(index - half, images?.length - VISIBLE_DOTS)
    );

    const endIndex = Math.min(startIndex + VISIBLE_DOTS, images?.length);

    const visibleIndices = Array.from(
        { length: endIndex - startIndex },
        (_, i) => startIndex + i
    );

    const openImageModal = (index: number) => {
        setModalType("image");
        setModalIndex(index);
        setIsModalVisible(true);
    };

    const openVideoModal = () => {
        setModalType("video");
        setModalIndex(0);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const onModalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pageIndex = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
        setModalIndex(pageIndex);
    };

    const handleSave = useCallback(async () => {
        if (isPending) return;

        try {
            const newValue = !isSaved;

            const response = await saveAssetMutation({
                assetId: propertyId,
                isFavourite: newValue,
            });

            setIsSaved(response?.isFavourite);
        } catch (error) {
            console.log("Save failed", error);
        }
    }, [isPending, isSaved, propertyId, saveAssetMutation]);

    return (
        <View style={styles.container}>
            <View style={[styles.wrapper, images?.length === 0 && { height: 30 }]}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onScrollEnd}
                >
                    {images?.map((img, i) => (
                        <Pressable key={i} onPress={() => openImageModal(i)}>
                            <Image source={{ uri: img }} style={styles.image} />
                        </Pressable>
                    ))}
                </ScrollView>

                <Pressable
                    onPress={handleSave}
                    disabled={isPending}
                    style={[
                        styles.bookmark,
                        images?.length === 0 && { bottom: 5 },
                        { backgroundColor: isSaved ? colors.background.darkYellow : colors.constant.white }
                    ]}
                >
                    {isSaved ? (
                        <BookmarkPrimary width={15} height={15} />
                    ) : (
                        <BookmarkSecondary width={15} height={15} />
                    )}
                </Pressable>
            </View>

            {images?.length > 0 && (
                <View style={styles.dotCountWrapper}>
                    <View style={styles.dotWrapper}>
                        <View style={styles.dots}>
                            {dotSizes.length === images?.length &&
                                visibleIndices.map((actualIndex) => (
                                    <Animated.View
                                        key={actualIndex}
                                        style={{
                                            width: dotSizes[actualIndex],
                                            height: dotSizes[actualIndex],
                                            borderRadius: Animated.divide(
                                                dotSizes[actualIndex],
                                                2
                                            ),
                                            backgroundColor: colors.isLight ? "#585454ff" : "#D9D9D9",
                                            opacity:
                                                actualIndex === index ? 1 : 0.5,
                                        }}
                                    />
                                ))}
                        </View>
                    </View>

                    <Text style={styles.imageCount}>{index + 1}/{images?.length}</Text>
                </View>
            )}

            {videos?.length > 0 && (
                <Pressable style={styles.videosCountWrapper} onPress={openVideoModal}>
                    <Feather name="video" size={16} color={colors.text.default} />
                    <Text style={styles.videosCount}>{videos?.length} Videos</Text>
                </Pressable>
            )}

            <Modal
                visible={isModalVisible}
                transparent={true}
                onRequestClose={closeModal}
                animationType="fade"
            >
                <View style={styles.modalBackground}>
                    <Pressable style={styles.modalCloseButton} onPress={closeModal}>
                        <Feather name="x" size={24} color={colors.constant.white} />
                    </Pressable>

                    <View style={styles.modalWrapper}>
                        {modalType === "image" ? (
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={onModalScroll}
                            >
                                {images?.map((img, i) => (
                                    <Image key={i} source={{ uri: img }} style={styles.modalImage} />
                                ))}
                            </ScrollView>
                        ) : (
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={onModalScroll}
                            >
                                {videos?.map((video, i) => (
                                    <Video
                                        key={i}
                                        source={{ uri: video }}
                                        style={styles.modalMedia}
                                        controls
                                        resizeMode="contain"
                                        paused={i !== modalIndex}
                                    />
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.modalDots}>
                        {mediaArray?.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.modalDot,
                                    i === modalIndex && styles.modalDotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ImageSlider;

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        alignItems: "center",
    },
    wrapper: {
        width: width - 32,
        height: 190,
        borderRadius: 4,
        overflow: "hidden",
        marginHorizontal: 16,
    },
    image: {
        width: width - 32,
        height: 190,
        resizeMode: "cover",
    },
    dots: {
        flexDirection: "row",
        gap: 10,
        alignItems: 'center',
        marginTop: 10,
        minHeight: 10,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 10,
        backgroundColor: '#D9D9D9',
    },
    bookmark: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: "#D8D8D8",
        width: 24,
        height: 24,
        justifyContent: 'center',
        borderRadius: 100,
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalWrapper: {
        flex: 1,
        width: width - 32,
        maxHeight: height - 150,
        borderRadius: 4,
        overflow: "hidden",
        marginHorizontal: 16,
    },
    modalImage: {
        width: width - 32,
        maxHeight: height - 150,
        resizeMode: 'contain',
    },
    modalDots: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    modalDot: {
        width: 4,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#D9D9D9',
        margin: 5,
    },
    modalDotActive: {
        width: 8,
        height: 8,
        backgroundColor: 'white',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 8,
        backgroundColor: colors.constant.black,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: 100,
        zIndex: 10,
    },
    modalMedia: {
        width: width - 32,
        height: height * 0.7,
    },
    videosCountWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
        alignSelf: 'flex-end',
        marginHorizontal: 16,
        backgroundColor: colors.isLight ? colors.background.secondary : colors.background.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
    },
    videosCount: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
    dotCountWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
    },
    dotWrapper: { flex: 1, alignItems: 'center', marginLeft: 26 },
    imageCount: {
        color: colors.text.default,
        fontSize: 14,
        fontFamily: 'WorkSans-Medium',
    },
});
