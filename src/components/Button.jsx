import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    let baseStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      paddingHorizontal: SPACING['16'],
    };

    // Size variants
    if (size === 'sm') {
      baseStyle.paddingVertical = SPACING['8'];
      baseStyle.minWidth = 80;
    } else if (size === 'md') {
      baseStyle.paddingVertical = SPACING['12'];
      baseStyle.minWidth = 120;
    } else if (size === 'lg') {
      baseStyle.paddingVertical = SPACING['16'];
      baseStyle.minWidth = 150;
    }

    // Color variants
    if (variant === 'primary') {
      baseStyle.backgroundColor = disabled ? COLORS.gray300 : COLORS.primary;
    } else if (variant === 'secondary') {
      baseStyle.backgroundColor = disabled ? COLORS.gray300 : COLORS.secondary;
    } else if (variant === 'outline') {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = disabled ? COLORS.gray300 : COLORS.primary;
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    let baseStyle = {
      ...FONTS.button,
      fontWeight: '600',
    };

    if (variant === 'outline') {
      baseStyle.color = disabled ? COLORS.gray400 : COLORS.primary;
    } else {
      baseStyle.color = COLORS.white;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
