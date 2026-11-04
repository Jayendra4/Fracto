import React, { useEffect, useRef, useState, forwardRef } from 'react';
import {
    View,
    TextInput as RNTextInput,
    Text,
    TouchableOpacity,
    TextInputProps,
    Pressable,
    Animated,
    StyleProp,
    TextStyle,
    ScrollView,
    Dimensions,
    Keyboard,
} from 'react-native';
import { useTheme } from '../../util/theme';
import { createstyles } from './TextInputClassic.style';
import Eye from '../../assets/icons/eye.svg';
import EyeOff from '../../assets/icons/eye-off.svg';
import EyeLight from '../../assets/icons/eye-light.svg';
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { Dropdown } from '../AssetFilterBar';
import Feather from "react-native-vector-icons/Feather";
import HelpModal from '../Modals/HelpModal';

interface DropdownOption {
    label: string;
    value: string;
    flag?: string;
    isoCode?: string;
}

interface Props extends TextInputProps {
    label?: string;
    error?: string;
    required?: boolean;
    type?: TextInputType;
    options?: DropdownOption[];
    onSelect?: (value: string) => void;
    extraInfo?: string;
    strength?: { label: string, level: number, color: string } | null;
    setError?: (val: string) => void;
    labelStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
    dialCode?: string;
    selectDialCode?: (val: string) => void;
    activateMini?: boolean;
    endText?: string;
    setSelectedValue?: (val: string) => void;
    disabled?: boolean;
    searchValue?: string;
    onChangeSearch?: (value: string) => void;
    helpText?: string;
}

export enum TextInputType {
    Input = 'input',
    Dropdown = 'dropdown',
    Mobile = 'mobile',
    Date = 'date',
    Radio = 'radio',
}

const dialCodeOptions = ["+91", "+971"];

const TextInputClassic = forwardRef<RNTextInput, Props>(
    (
        {
            label,
            error,
            style,
            secureTextEntry,
            required = false,
            type = 'input',
            options = [],
            onSelect,
            value,
            strength,
            extraInfo,
            setError,
            dialCode,
            selectDialCode,
            labelStyle,
            inputStyle,
            activateMini,
            endText,
            setSelectedValue,
            disabled,
            searchValue,
            onChangeSearch,
            helpText,
            ...props
        },
        ref
    ) => {
        const { colors, themeAppearance } = useTheme();
        const styles = createstyles(colors, error, activateMini);

        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const [dropdownVisible, setDropdownVisible] = useState(false);
        const inputRef = useRef<View>(null);
        const [openUp, setOpenUp] = useState(false);
        const [dobOpen, setDobOpen] = useState(false);
        const [dialCodeFilter, setDialCodeFilter] = useState(false);
        const [helpVisible, setHelpVisible] = useState(false);

        const isPasswordField = !!secureTextEntry;
        const isDropdown = type === TextInputType.Dropdown;
        const isMobileField = type === TextInputType.Mobile;
        const isDateField = type === TextInputType.Date;
        const isRadioField = type === TextInputType.Radio;
        const effectiveDialCode = dialCode || '+91';
        const mobileMaxLength = effectiveDialCode === '+971' ? 9 : 10;

        const rotation = useRef(new Animated.Value(0)).current;
        const dropdownAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            Animated.timing(rotation, {
                toValue: dropdownVisible ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }, [dropdownVisible]);

        useEffect(() => {
            Animated.spring(dropdownAnim, {
                toValue: dropdownVisible ? 1 : 0,
                damping: 15,
                stiffness: 120,
                useNativeDriver: false,
            }).start();
        }, [dropdownVisible]);

        const dropdownOpacity = dropdownAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const dropdownTranslate = dropdownAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-8, 0],
        });

        const rotateInterpolate = rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
        });

        const handleMobileChange = (text: string) => {
            const numeric = text?.replace(/\D/g, '');
            props.onChangeText?.(`${effectiveDialCode}${numeric}`);
        };

        const parenthesesMatch = label?.match(/\(.*?\)/);

        return (
            <View ref={inputRef} style={{ position: 'relative' }}>
                {label && (
                    <View style={styles.labelWrapper}>
                        <Text style={[styles.label, labelStyle]}>
                            {label?.replace(/\(.*?\)/g, '')}

                            {parenthesesMatch && (
                                <Text style={styles.parentheses}>
                                    {parenthesesMatch[0]}
                                </Text>
                            )}

                            {required && <Text style={styles.required}> *</Text>}
                            {helpText && (
                                <Text onPress={() => setHelpVisible(true)}>
                                    {" "}
                                    <Feather
                                        name="info"
                                        size={18}
                                        color={colors.text.extraLight}
                                    />
                                </Text>
                            )}
                        </Text>
                    </View>
                )}

                {!isRadioField && (
                    <Pressable
                        onPress={() => {
                            Keyboard.dismiss();
                            if (isDateField) {
                                setDobOpen(true);
                            } else if (isDropdown) {
                                inputRef.current?.measureInWindow((x, y, width, height) => {
                                    const screenHeight = Dimensions.get('window').height;
                                    const spaceBelow = screenHeight - (y + height);

                                    setOpenUp(spaceBelow < 260);
                                    setDropdownVisible(prev => !prev);
                                    setError?.('');
                                });
                            }
                        }}

                        disabled={(!isDropdown && !isDateField) || disabled}
                    >
                        <View style={[styles.inputWrapper, style, disabled && { opacity: 0.6 }]}>
                            {isMobileField && (
                                <Pressable
                                    style={styles.countryCodeWrapper}
                                    onPress={() => setDialCodeFilter(true)}
                                    disabled={!selectDialCode}
                                >
                                    <Text style={styles.countryCode}>{dialCode || '+91'}</Text>
                                    {selectDialCode && (
                                        <Ionicons name="chevron-down" size={12} color={colors.icon.primary} />
                                    )}
                                    <View style={styles.separator} />
                                </Pressable>
                            )}

                            <RNTextInput
                                ref={ref}
                                {...props}
                                value={
                                    isMobileField
                                        ? value?.replace(
                                            new RegExp(`^(${effectiveDialCode?.replace('+', '\\+')})`),
                                            ''
                                        )
                                        : value
                                }
                                editable={!isDropdown && !isDateField}
                                pointerEvents={isDropdown || isDateField ? 'none' : 'auto'}
                                secureTextEntry={isPasswordField && !isPasswordVisible}
                                placeholderTextColor={colors.text.muted}
                                keyboardType={isMobileField ? 'phone-pad' : props.keyboardType}
                                onChangeText={isMobileField ? handleMobileChange : props.onChangeText}
                                maxLength={isMobileField ? mobileMaxLength : props.maxLength}
                                style={[
                                    styles.input,
                                    inputStyle,
                                ]}
                                keyboardAppearance={themeAppearance}
                            />

                            {isPasswordField && (
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(prev => !prev)}
                                    style={styles.eyeButton}
                                >
                                    {isPasswordVisible ?
                                        colors.isLight ?
                                            <EyeLight width={20} height={20} /> :
                                            <Eye width={20} height={20} /> :
                                        <EyeOff width={20} height={20} />
                                    }
                                </TouchableOpacity>
                            )}

                            {isDropdown && (
                                <View style={styles.eyeButton}>
                                    <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                                        <Ionicons name="chevron-down" size={activateMini ? 16 : 20} color={colors.icon.primary} />
                                    </Animated.View>
                                </View>
                            )}

                            {isDateField && (
                                <View style={styles.eyeButton}>
                                    <FontAwesome6 name='calendar-days' size={activateMini ? 16 : 20} color={colors.text.muted} />
                                </View>
                            )}

                            {endText && (
                                <View style={styles.eyeButton}>
                                    <Text style={styles.endText}>{endText}</Text>
                                </View>
                            )}
                        </View>
                    </Pressable>
                )}

                {isRadioField && (
                    <View style={[styles.radioContainer, disabled && { opacity: 0.6 }]}>
                        {options.map((item) => {
                            const selected = value === item.value;

                            return (
                                <Pressable
                                    key={item.value}
                                    style={styles.radioOption}
                                    onPress={() => {
                                        onSelect?.(item.value);
                                        setError?.('');
                                    }}
                                    disabled={disabled}
                                >
                                    <View style={[
                                        styles.radioOuter,
                                        selected && styles.radioOuterActive
                                    ]}>
                                        {selected && <View style={styles.radioInner} />}
                                    </View>

                                    <Text style={styles.radioLabel}>
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {extraInfo && <Text style={styles.extraInfo}>{extraInfo}</Text>}

                {error && <Text style={styles.error}>{error}</Text>}

                {strength && !error && (
                    <View style={styles.strengthContainer}>
                        <Text style={styles.strength}>
                            Your password strength is <Text style={{ color: strength.color }}>{strength.label}</Text>
                        </Text>

                        <View style={styles.strengthBars}>
                            {[1, 2, 3, 4].map(bar => (
                                <View
                                    key={bar}
                                    style={[
                                        styles.strengthBar,
                                        bar <= strength.level && {
                                            backgroundColor: strength.color,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {isDropdown && dropdownVisible && (
                    <Pressable
                        style={styles.dropdownClose}
                        onPress={() => setDropdownVisible(false)}
                    />
                )}

                {isDropdown && (
                    <Animated.View
                        style={[
                            styles.dropdown,
                            openUp
                                ? { bottom: activateMini ? 75 : 88, top: undefined }
                                : { top: activateMini ? 75 : 88, bottom: undefined },
                            {
                                opacity: dropdownOpacity,
                                transform: [{ translateY: dropdownTranslate }],
                            },
                        ]}
                        pointerEvents={dropdownVisible ? 'auto' : 'none'}
                    >
                        {searchValue !== undefined && (
                            <View style={styles.searchContainer}>
                                <Feather name="search" size={16} color={colors.text.muted} />
                                <RNTextInput
                                    value={searchValue}
                                    onChangeText={onChangeSearch}
                                    placeholder="Search..."
                                    placeholderTextColor={colors.text.muted}
                                    style={styles.searchInput}
                                    keyboardAppearance={themeAppearance}
                                />
                            </View>
                        )}

                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                        >
                            {options?.length === 0 && (
                                <View style={styles.noOptions}>
                                    <Text style={styles.noOptionsText}>No options found</Text>
                                </View>
                            )}
                            {options?.map((item, index) => (
                                <View key={item.value}>
                                    <Pressable
                                        style={styles.option}
                                        onPress={() => {
                                            item?.flag
                                                ? onSelect?.(`${item.flag}  ${item.value}`)
                                                : onSelect?.(item.value);
                                            item?.isoCode && setSelectedValue?.(item?.isoCode);
                                            setError?.('');
                                            setDropdownVisible(false);
                                            onChangeSearch?.('');
                                        }}
                                    >
                                        {item?.flag && (
                                            <Text style={{ fontSize: 16 }}>{item.flag}</Text>
                                        )}
                                        <Text style={styles.optionText}>{item.label}</Text>
                                    </Pressable>

                                    {index < options?.length - 1 && (
                                        <View
                                            style={{
                                                borderBottomWidth: 1,
                                                borderBottomColor: colors.border.default,
                                            }}
                                        />
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {isDateField && (
                    <DatePicker
                        modal
                        open={dobOpen}
                        mode="date"
                        date={
                            value ? moment(value, 'DD/MM/YYYY').toDate() : new Date()
                        }
                        onConfirm={(date) => {
                            setDobOpen(false);
                            const formatted = moment(date).format('DD/MM/YYYY');
                            props.onChangeText?.(formatted);
                        }}
                        onCancel={() => setDobOpen(false)}
                        theme={colors.isLight ? 'light' : 'dark'}
                    />
                )}

                {dialCodeFilter && selectDialCode && (
                    <Dropdown
                        data={dialCodeOptions}
                        onSelect={selectDialCode}
                        onClose={() => setDialCodeFilter(false)}
                    />
                )}

                <HelpModal
                    visible={helpVisible}
                    text={helpText}
                    onClose={() => setHelpVisible(false)}
                />
            </View>
        );
    });

export default TextInputClassic;

TextInputClassic.displayName = 'TextInputClassic';