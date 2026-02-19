import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={style}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: error ? COLORS.error : COLORS.text },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : COLORS.border,
            borderWidth: error ? 2 : isFocused ? 2 : 1,
          },
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            { paddingLeft: icon ? SPACING['8'] : SPACING['14'] },
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    marginBottom: SPACING['8'],
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING['12'],
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: FONTS.base,
    color: COLORS.text,
  },
  iconLeft: {
    marginRight: SPACING['8'],
  },
  iconRight: {
    padding: SPACING['8'],
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.xs,
    marginTop: SPACING['6'],
    fontWeight: '500',
  },
});

export default CustomTextInput;
