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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, FONTS, SPACING } from '../theme';
import { login } from '../redux/slices/authSlice';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      console.log('Login Success', result);
      // Navigation will happen in RootNavigator based on auth state
    } catch (err) {
      console.log('Login Error', err);
    }
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
  contentInsetAdjustmentBehavior="automatic"
>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.subtitle}>
              Login to continue
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry
                style={styles.input}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotContainer}>
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (!email || !password) && styles.disabledButton,
              ]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={!email || !password || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Don’t have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.signupText}>
                Sign Up
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

  keyboardContainer: {
    flex: 1,
  },

  scrollContainer: {
  flexGrow: 1,
  paddingHorizontal: SPACING['24'],
  paddingTop: SPACING['40'],
  paddingBottom: SPACING['40'],
},

  headerContainer: {
    marginBottom: SPACING['40'],
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

  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: SPACING['12'],
    marginBottom: SPACING['20'],
  },

  errorText: {
    ...FONTS.body2,
    color: '#D32F2F',
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

  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING['24'],
  },

  forgotText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: COLORS.disabled,
  },

  loginButtonText: {
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

  signupText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
});


export default LoginScreen;
