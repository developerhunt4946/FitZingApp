import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../theme';

const SignUpScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    dob: '',
  });

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSignup = () => {
    console.log('Signup Data:', form);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Fill in the details to get started
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>

            {/* First & Last Name */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  value={form.firstName}
                  onChangeText={(v) => handleChange('firstName', v)}
                  placeholder="First name"
                  placeholderTextColor={COLORS.textTertiary}
                  style={styles.input}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  value={form.lastName}
                  onChangeText={(v) => handleChange('lastName', v)}
                  placeholder="Last name"
                  placeholderTextColor={COLORS.textTertiary}
                  style={styles.input}
                />
              </View>
            </View>
             {/* Mobile & DOB */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Mobile</Text>
                <TextInput
                  value={form.mobile}
                  onChangeText={(v) => handleChange('mobile', v)}
                  placeholder="Mobile number"
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.textTertiary}
                  style={styles.input}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>DOB</Text>
                <TextInput
                  value={form.dob}
                  onChangeText={(v) => handleChange('dob', v)}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={COLORS.textTertiary}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(v) => handleChange('email', v)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.textTertiary}
                style={styles.input}
              />
            </View>
            

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                value={form.password}
                onChangeText={(v) => handleChange('password', v)}
                placeholder="Enter password"
                secureTextEntry
                placeholderTextColor={COLORS.textTertiary}
                style={styles.input}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                value={form.confirmPassword}
                onChangeText={(v) => handleChange('confirmPassword', v)}
                placeholder="Confirm password"
                secureTextEntry
                placeholderTextColor={COLORS.textTertiary}
                style={styles.input}
              />
            </View>

           

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.signupButton}
              activeOpacity={0.8}
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>
                Create Account
              </Text>
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Login
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING['24'],
    paddingTop: SPACING['40'],
    paddingBottom: SPACING['40'],
  },

  headerContainer: {
    marginBottom: SPACING['32'],
  },

  title: {
    ...FONTS.heading2,
    color: COLORS.text,
    marginBottom: SPACING['8'],
  },

  subtitle: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
  },

  formContainer: {
    marginBottom: SPACING['32'],
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING['16'],
    marginBottom: SPACING['20'],
  },

  halfInput: {
    flex: 1,
  },

  inputWrapper: {
    marginBottom: SPACING['20'],
  },

  inputLabel: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SPACING['6'],
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING['16'],
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    ...FONTS.body1,
  },

  signupButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING['8'],
  },

  signupButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING['24'],
  },

  footerText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginRight: SPACING['6'],
  },

  loginText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
});

export default SignUpScreen;
