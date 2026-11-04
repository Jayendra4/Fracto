import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useTheme } from '../util/theme';

interface SkeletonClassicProps {
    width?: number | `${number}%` | 'auto';
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

const SkeletonClassic: React.FC<SkeletonClassicProps> = ({
    width = '100%',
    height = 16,
    borderRadius = 6,
    style,
}) => {
    const { colors } = useTheme();
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmer]);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 1],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: colors.background.loader,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export default SkeletonClassic;
