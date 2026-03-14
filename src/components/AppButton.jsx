import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    Animated,
    ActivityIndicator,
    StyleSheet,
    View,
} from 'react-native';
import { COLORS, SPACING } from '../theme';

/**
 * AppButton - Reusable button with scale press animation.
 * Sports dark theme version.
 *
 * Props:
 *  title       - string: button label
 *  onPress     - function
 *  loading     - bool: show spinner
 *  disabled    - bool
 *  variant     - 'primary' | 'outline' | 'ghost'
 *  style       - extra container style
 *  textStyle   - extra text style
 *  icon        - React element: optional left icon
 */
const AppButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
    textStyle,
    icon,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const isDisabled = disabled || loading;

    const getContainerStyle = () => {
        if (variant === 'outline') {
            return [styles.base, styles.outline, isDisabled && styles.outlineDisabled];
        }
        if (variant === 'ghost') {
            return [styles.base, styles.ghost];
        }
        return [styles.base, styles.primary, isDisabled && styles.primaryDisabled];
    };

    const getTextStyle = () => {
        if (variant === 'outline') {
            return [styles.text, styles.outlineText, isDisabled && styles.disabledText];
        }
        if (variant === 'ghost') {
            return [styles.text, styles.ghostText];
        }
        return [styles.text, styles.primaryText];
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                style={getContainerStyle()}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={1}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? COLORS.white : COLORS.primary}
                        size="small"
                    />
                ) : (
                    <View style={styles.content}>
                        {icon && <View style={styles.iconWrapper}>{icon}</View>}
                        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    primary: {
        backgroundColor: COLORS.primary,
    },
    primaryDisabled: {
        backgroundColor: COLORS.disabled,
        shadowOpacity: 0,
        elevation: 0,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    outlineDisabled: {
        borderColor: COLORS.disabled,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconWrapper: {
        marginRight: 2,
    },
    text: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    primaryText: {
        color: COLORS.white,
    },
    outlineText: {
        color: COLORS.primary,
    },
    ghostText: {
        color: COLORS.primary,
    },
    disabledText: {
        color: COLORS.textTertiary,
    },
});

export default AppButton;
