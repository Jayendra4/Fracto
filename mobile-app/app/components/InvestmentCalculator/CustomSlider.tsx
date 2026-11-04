import React from 'react';
import Slider from '@react-native-community/slider';

interface Props {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    trackColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
}

const CustomSlider = ({
    value,
    min,
    max,
    step = 1,
    onChange,
    trackColor = '#4F86C0',
    inactiveColor = '#D9D9D9',
    thumbColor = '#F5F5F5',
}: Props) => {
    return (
        <Slider
            value={value}
            minimumValue={min}
            maximumValue={max}
            step={step}
            onValueChange={onChange}
            minimumTrackTintColor={trackColor}
            maximumTrackTintColor={inactiveColor}
            thumbTintColor={thumbColor}
            style={{ width: '100%', height: 30 }}
        />
    );
};

export default CustomSlider;
