import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, SPACING } from '../theme';
import { signup, clearError } from '../redux/slices/authSlice';
import SCREEN_NAMES from '../constants/screenNames';
import { AppAlert } from '../components';
import {
  User,
  Phone,
  Mail,
  Shield,
  UserPlus,
  AlertCircle,
  Zap,
} from 'lucide-react-native';

const SignUpScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState({});
  const [firstFocused, setFirstFocused] = useState(false);
  const [lastFocused, setLastFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  });

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  // Entry animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 55,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
    dispatch(clearError());
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Required';
    if (!form.lastName.trim()) newErrors.lastName = 'Required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile is required';
    else if (form.mobile.length < 10) newErrors.mobile = 'Enter valid mobile number';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.mobile.trim(),
        dateOfBirth: form.dateOfBirth,
      };
      await dispatch(signup(payload)).unwrap();
      showAlert('Success', 'Your account has been created successfully!', 'success', () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        // navigation.navigate(SCREEN_NAMES.LOGIN); // Optional: if you want to navigate on success
      });
    } catch (err) {
      // error is already set in Redux state
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Zap size={22} color={COLORS.white} fill={COLORS.white} />
              </View>
              <Text style={styles.brandName}>{STRINGS.APP_NAME}</Text>
            </View>
            <Text style={styles.headerTitle}>{STRINGS.SIGNUP_TITLE}</Text>
            <Text style={styles.headerSubtitle}>{STRINGS.SIGNUP_SUBTITLE}</Text>
          </Animated.View>

          {/* API Error Banner */}
          {error ? (
            <Animated.View style={[styles.errorBanner, { opacity: fadeAnim }]}>
              <AlertCircle size={14} color="#EF4444" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Personal Info Section */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sectionHeader}>
              <User size={14} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Personal Info</Text>
            </View>

            {/* First & Last Name Row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label={STRINGS.FIRST_NAME}
                  value={form.firstName}
                  onChangeText={v => handleChange('firstName', v)}
                  placeholder="First Name"
                  leftIcon={
                    <View style={{ opacity: firstFocused ? 1 : 0.4 }}>
                      <User size={16} color={firstFocused ? COLORS.primary : COLORS.textSecondary} />
                    </View>
                  }
                  error={errors.firstName}
                  autoCapitalize="words"
                  onFocus={() => setFirstFocused(true)}
                  onBlur={() => setFirstFocused(false)}
                />
              </View>
              <View style={{ width: SPACING['8'] }} />
              <View style={{ flex: 1 }}>
                <AppInput
                  label={STRINGS.LAST_NAME}
                  value={form.lastName}
                  onChangeText={v => handleChange('lastName', v)}
                  placeholder="Last Name"
                  leftIcon={
                    <View style={{ opacity: lastFocused ? 1 : 0.4 }}>
                      <User size={16} color={lastFocused ? COLORS.primary : COLORS.textSecondary} />
                    </View>
                  }
                  error={errors.lastName}
                  autoCapitalize="words"
                  onFocus={() => setLastFocused(true)}
                  onBlur={() => setLastFocused(false)}
                />
              </View>
            </View>
          </Animated.View>

          {/* Contact Section */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sectionHeader}>
              <Phone size={14} color={COLORS.secondary} />
              <Text style={styles.sectionTitle}>Contact Details</Text>
            </View>

            <AppInput
              label={STRINGS.EMAIL}
              value={form.email}
              onChangeText={v => handleChange('email', v)}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={
                <View style={{ opacity: emailFocused ? 1 : 0.4 }}>
                  <Mail size={16} color={emailFocused ? COLORS.primary : COLORS.textSecondary} />
                </View>
              }
              error={errors.email}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />

            <AppInput
              label={STRINGS.MOBILE}
              value={form.mobile}
              onChangeText={v => handleChange('mobile', v)}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              leftIcon={
                <View style={{ opacity: mobileFocused ? 1 : 0.4 }}>
                  <Phone size={16} color={mobileFocused ? COLORS.primary : COLORS.textSecondary} />
                </View>
              }
              error={errors.mobile}
              onFocus={() => setMobileFocused(true)}
              onBlur={() => setMobileFocused(false)}
            />

            <DatePickerInput
              label={STRINGS.BIRTH_DATE}
              value={form.dateOfBirth}
              onChange={v => handleChange('dateOfBirth', v)}
              error={errors.dateOfBirth}
              maxYear={new Date().getFullYear() - 13}
            />
          </Animated.View>

          {/* Security Section */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sectionHeader}>
              <Shield size={14} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <PasswordInput
              label={STRINGS.PASSWORD}
              value={form.password}
              onChangeText={v => handleChange('password', v)}
              placeholder="Min. 6 characters"
              error={errors.password}
            />

            <PasswordInput
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={v => handleChange('confirmPassword', v)}
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
            />

            {/* Terms */}
            <View style={styles.termsRow}>
              <Text style={styles.termsText}>By creating an account, you agree to our </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <AppButton
              title={STRINGS.REGISTER}
              onPress={handleSignup}
              loading={loading}
              icon={<UserPlus size={16} color={COLORS.white} />}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footerContainer, { opacity: fadeAnim }]}>
            <Text style={styles.footerText}>{STRINGS.ALREADY_HAVE_ACCOUNT}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>{STRINGS.LOGIN}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <AppAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        onConfirm={() => {
          if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
          } else {
            setAlertConfig(prev => ({ ...prev, visible: false }));
          }
        }}
        showCancel={alertConfig.type === 'confirm'}
      />
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
    paddingHorizontal: SPACING['16'],
    paddingTop: SPACING['20'],
    paddingBottom: SPACING['32'],
  },

  // Header
  header: {
    marginBottom: SPACING['16'],
    paddingHorizontal: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // API Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING['16'],
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING['12'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING['12'],
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: SPACING['14'],
    marginTop: 4,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  termsLink: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 16,
  },

  // Footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default SignUpScreen;
