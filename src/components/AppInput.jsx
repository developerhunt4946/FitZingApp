import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Animated,
    StyleSheet,
} from 'react-native';
import { COLORS, SPACING } from '../theme';

/**
 * AppInput - Reusable input component with optional left icon, right component, focus state styling.
 * Sports dark theme version — compact height, dark surface.
 */
const AppInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    leftIcon,
    rightComponent,
    error,
    style,
    inputStyle,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = (e) => {
        setIsFocused(true);
        Animated.timing(borderAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
        onFocusProp && onFocusProp(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        Animated.timing(borderAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        onBlurProp && onBlurProp(e);
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? COLORS.error : COLORS.border, error ? COLORS.error : COLORS.primary],
    });

    return (
        <View style={[styles.wrapper, style]}>
            {label && (
                <Text style={[styles.label, isFocused && styles.labelFocused, error && styles.labelError]}>
                    {label}
                </Text>
            )}
            <Animated.View
                style={[
                    styles.inputContainer,
                    { borderColor },
                    isFocused && styles.inputContainerFocused,
                ]}
            >
                {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        leftIcon ? styles.inputWithLeftIcon : null,
                        rightComponent ? styles.inputWithRightComponent : null,
                        inputStyle,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />
                {rightComponent && (
                    <View style={styles.rightIconContainer}>{rightComponent}</View>
                )}
            </Animated.View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
        overflow: 'hidden',
    },
    inputContainerFocused: {
        backgroundColor: COLORS.inputBgFocused,
    },
    leftIconContainer: {
        paddingLeft: 12,
        paddingRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightIconContainer: {
        paddingRight: 12,
        paddingLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        paddingHorizontal: 14,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '400',
    },
    inputWithLeftIcon: {
        paddingLeft: 6,
    },
    inputWithRightComponent: {
        paddingRight: 6,
    },
    errorText: {
        fontSize: 11,
        color: COLORS.error,
        marginTop: 3,
        marginLeft: 4,
        fontWeight: '400',
    },
});

export default AppInput;
