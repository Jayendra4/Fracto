import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../util/theme';
import { createStyles } from './HofLoader.style';
import Logo from "../../assets/icons/logo.svg";

const HofLoader = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <View style={styles.container}>
            <Logo width={72} height={72} />
            <View style={styles.spacer} />
            <ActivityIndicator size="large" color={colors.icon.primary} />
        </View>
    );
};

export default HofLoader;
