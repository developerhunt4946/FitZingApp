import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, Button, CustomTextInput, Card } from '../components';
import { COLORS, FONTS, SPACING } from '../theme';
import { registerUser } from '../redux/actions/authActions';
import { authAPI } from '../services/api';

const SignUpScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Required', 'Please agree to terms and conditions');
      return;
    }

    try {
      // Call API to register
      const response = await authAPI.register({
        fullName,
        email,
        password,
      });

      if (response.data) {
        const { token, user } = response.data;
        
        // Save token and user data to AsyncStorage
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        // Dispatch registration action
        dispatch(registerUser({ user, token }));
        
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Container scroll>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us and start your journey
          </Text>
        </View>

        <Card style={styles.formCard}>
          <CustomTextInput
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            error={fullNameError}
            style={styles.inputMargin}
            editable={!isLoading}
          />

          <CustomTextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={emailError}
            style={styles.inputMargin}
            editable={!isLoading}
          />

          <CustomTextInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            error={passwordError}
            style={styles.inputMargin}
            editable={!isLoading}
          />

          <CustomTextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            error={confirmPasswordError}
            style={styles.inputMargin}
            editable={!isLoading}
          />

          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              style={styles.checkbox}
            >
              <View
                style={[
                  styles.checkboxBox,
                  agreeToTerms && styles.checkboxBoxChecked,
                ]}
              >
                {agreeToTerms && (
                  <Text style={styles.checkboxTick}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the Terms and Conditions
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            style={styles.signupButton}
          />
        </Card>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING['24'],
  },
  backButton: {
    color: COLORS.primary,
    fontSize: FONTS.base,
    fontWeight: '600',
    marginBottom: SPACING['16'],
  },
  title: {
    ...FONTS.heading2,
    color: COLORS.text,
    marginBottom: SPACING['8'],
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  formCard: {
    width: '100%',
    marginBottom: SPACING['24'],
  },
  inputMargin: {
    marginBottom: SPACING['16'],
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['16'],
  },
  checkbox: {
    marginRight: SPACING['10'],
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxTick: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  termsText: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING['12'],
    borderRadius: 8,
    marginBottom: SPACING['16'],
  },
  errorMessage: {
    color: COLORS.error,
    fontSize: FONTS.sm,
    fontWeight: '500',
  },
  signupButton: {
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SignUpScreen;
