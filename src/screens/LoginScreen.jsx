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
import { loginUser } from '../redux/actions/authActions';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

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

    try {
      // Call API to login
      const response = await authAPI.login(email, password);
      
      if (response.data) {
        const { token, user } = response.data;
        
        // Save token and user data to AsyncStorage for persistent login
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        // Dispatch login action
        dispatch(loginUser({ user, token }));
        
        Alert.alert('Success', 'Login successful!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Container scroll centerContent>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Please login to your account
          </Text>
        </View>

        <Card style={styles.formCard}>
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            error={passwordError}
            style={styles.inputMargin}
            onRightIconPress={() => setShowPassword(!showPassword)}
            editable={!isLoading}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            style={styles.loginButton}
          />
        </Card>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING['32'],
    alignItems: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING['20'],
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONTS.sm,
    fontWeight: '600',
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
  loginButton: {
    width: '100%',
    marginTop: SPACING['8'],
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  signupLink: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
