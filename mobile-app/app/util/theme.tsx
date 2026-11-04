import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';

const themeMode = "themeMode";

let currentMode: 'light' | 'dark' = 'dark';
const subscribers = new Set<() => void>();

const subscribe = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
};

const notify = () => {
    subscribers.forEach(cb => cb());
};

export const setThemeMode = async (mode: 'light' | 'dark') => {
    currentMode = mode;
    await AsyncStorage.setItem(themeMode, mode);
    notify();
};

const getSnapshot = () => currentMode;

const palette = {
    white: '#FFFFFF',
    black: '#000000',

    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#EAEAEA',
    slate300: '#CBD5E1',
    slate400: '#5C6C7C',
    slate700: '#334155',
    slate900: '#020617',

    blue500: '#3B82F6',
    blue400: '#60A5FA',
    primary: '#4F86C0',
    green: '#33BD56',
    lightGrey: '#757575',
    darkblue: '#132436',
    slightly: '#041221',

    red500: '#FF0000',
};

const baseColors = {
    primary: {
        default: palette.blue500,
    },
    danger: {
        default: palette.red500,
    },
    success: {
        primary: palette.green,
    },
    constant: {
        white: palette.white,
        black: palette.black,
        darkblue: palette.darkblue,
        primary: palette.primary,
    },
};

const lightColors = {
    ...baseColors,
    background: {
        default: palette.white,
        inverse: palette.black,
        main: palette.white,
        slightly: palette.slate200,
        surface: palette.slate50,
        input: palette.slate100,
        secondary: palette.slate200,
        primary: '#233241',
        primaryLight: '#0f1d2c',
        darkYellow: '#CD971E',
        darkBlue: palette.slate200,
        green: '#33BD56',
        blue: "#2F5BCC",
        banner: palette.slate200,
        danger: '#F03F23',
        loader: "#E5E7EB",
    },
    text: {
        default: palette.black,
        inverse: palette.white,
        primary: palette.primary,
        secondary: palette.slate700,
        muted: palette.slate400,
        yellow: "#CD971E",
        darkYellow: '#FFB816',
        mutedLight: '#CECECE',
        green: palette.green,
        lightGrey: palette.lightGrey,
        darkBlue: palette.darkblue,
        danger: '#F03F23',
        title: palette.darkblue,
        subTitle: palette.black,
        link: "#2F5BCC",
        extraLight: "#3D3D3D",
    },
    border: {
        default: '#475462',
        primary: palette.black,
        secondary: palette.white,
        slightly: palette.slightly,
        green: palette.green,
        lightDark: '#282828',
        lightGrey: palette.lightGrey,
        darkBlue: palette.darkblue,
        danger: "#F03F23",
        yellow: "#FFB816",
        divider: "#475462",
        prime: palette.primary,
    },
    icon: {
        primary: palette.black,
        secondary: palette.white,
        green: palette.green,
        danger: "#F03F23",
    },
};

const darkColors = {
    ...baseColors,
    background: {
        default: palette.black,
        inverse: palette.white,
        main: '#030f1b',
        slightly: palette.slightly,
        surface: palette.slate900,
        input: '#020617',
        secondary: palette.slate200,
        primary: '#233241',
        primaryLight: '#0f1d2c',
        darkYellow: '#CD971E',
        darkBlue: palette.darkblue,
        green: '#33BD56',
        blue: "#2F5BCC",
        banner: palette.black,
        danger: '#F03F23',
        loader: "#2A2A2A",
    },
    text: {
        default: palette.white,
        inverse: palette.black,
        primary: palette.primary,
        secondary: palette.slate300,
        muted: palette.slate400,
        yellow: '#FFB816',
        darkYellow: '#CD971E',
        mutedLight: '#CECECE',
        green: '#33BD56',
        lightGrey: palette.lightGrey,
        darkBlue: palette.darkblue,
        danger: '#F03F23',
        title: palette.white,
        subTitle: palette.slate400,
        link: "#4F86C0",
        extraLight: "#F5F5F5B2",
    },
    border: {
        default: '#475462',
        primary: palette.white,
        secondary: palette.black,
        slightly: palette.slightly,
        green: '#33BD56',
        lightDark: '#282828',
        lightGrey: palette.lightGrey,
        darkBlue: palette.darkblue,
        danger: "#F03F23",
        yellow: "#FFB816",
        divider: "#F5F5F533",
        prime: palette.primary,
    },
    icon: {
        primary: palette.white,
        secondary: palette.black,
        green: '#33BD56',
        danger: "#F03F23",
    },
};

export const themes = {
    light: {
        colors: { ...lightColors, isLight: true },
        themeAppearance: currentMode,
    },
    dark: {
        colors: { ...darkColors, isLight: false },
        themeAppearance: currentMode,
    },
};

export const useTheme = () => {
    const mode = useSyncExternalStore(subscribe, getSnapshot);

    useEffect(() => {
        AsyncStorage.getItem(themeMode).then(stored => {
            if (stored === 'light' || stored === 'dark') {
                currentMode = stored;
                notify();
            }
        });
    }, []);

    return themes[mode];
};

export type Theme = ReturnType<typeof useTheme>;
export type Colors = Theme['colors'];
