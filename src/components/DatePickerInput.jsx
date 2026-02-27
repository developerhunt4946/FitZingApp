import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme';

/**
 * DatePickerInput - Uses react-native-date-picker library.
 * Shows dd/mm/yyyy formatted date with a calendar icon.
 * Tapping opens the native date picker modal.
 *
 * Props:
 *  label      - string
 *  value      - string: 'dd/mm/yyyy'
 *  onChange   - function(dateString: 'dd/mm/yyyy')
 *  error      - string
 *  maxYear    - number (default current year - 13)
 */

const pad = n => String(n).padStart(2, '0');

const DatePickerInput = ({
    label = 'Date of Birth',
    value = '',
    onChange,
    error,
    maxYear = new Date().getFullYear() - 13,
}) => {
    const [open, setOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Parse 'dd/mm/yyyy' -> Date object, or default to Jan 1, 2000
    const parseToDate = () => {
        if (value && value.length === 10) {
            const [d, m, y] = value.split('/').map(Number);
            if (d && m && y) return new Date(y, m - 1, d);
        }
        return new Date(2000, 0, 1);
    };

    const maxDate = new Date(maxYear, 11, 31);

    const displayValue = value || 'DD / MM / YYYY';

    return (
        <View style={styles.wrapper}>
            {label ? (
                <Text style={[
                    styles.label,
                    isFocused && styles.labelFocused,
                    error && styles.labelError,
                ]}>
                    {label}
                </Text>
            ) : null}

            <TouchableOpacity
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
                onPress={() => {
                    setIsFocused(true);
                    setOpen(true);
                }}
                activeOpacity={0.8}
            >
                <View style={styles.leftIcon}>
                    <Calendar
                        size={18}
                        color={isFocused ? COLORS.primary : COLORS.textSecondary}
                        style={{ opacity: isFocused ? 1 : 0.5 }}
                    />
                </View>
                <Text style={[styles.valueText, !value && styles.placeholderText]}>
                    {displayValue}
                </Text>
                <View style={styles.rightIcon}>
                    <ChevronRight size={16} color={COLORS.textTertiary} />
                </View>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <DatePicker
                modal
                open={open}
                date={parseToDate()}
                mode="date"
                maximumDate={maxDate}
                minimumDate={new Date(1920, 0, 1)}
                title="Select Date of Birth"
                onConfirm={(date) => {
                    setOpen(false);
                    setIsFocused(false);
                    const formatted = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
                    onChange && onChange(formatted);
                }}
                onCancel={() => {
                    setOpen(false);
                    setIsFocused(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: SPACING['12'],
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 5,
        letterSpacing: 0.3,
    },
    labelFocused: {
        color: COLORS.primary,
    },
    labelError: {
        color: COLORS.error,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 44,
        paddingHorizontal: 4,
    },
    inputFocused: {
        borderColor: COLORS.primary,
        borderWidth: 1.5,
        backgroundColor: COLORS.inputBgFocused,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    leftIcon: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightIcon: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '400',
    },
    placeholderText: {
        color: COLORS.textTertiary,
    },
    errorText: {
        fontSize: 11,
        color: COLORS.error,
        marginTop: 3,
        marginLeft: 4,
    },
});

export default DatePickerInput;
