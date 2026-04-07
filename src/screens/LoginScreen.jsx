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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, SPACING } from '../theme';
import { login, clearError } from '../redux/slices/authSlice';
import { AppInput, PasswordInput, AppButton } from '../components';
import STRINGS from '../constants/strings';
import SCREEN_NAMES from '../constants/screenNames';
import {
  Mail,
  Trophy,
  AlertCircle,
  Zap,
} from 'lucide-react-native';
import AppLogo from '../../assets/bootsplash_logo.png'

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
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
    // Clear any previous errors
    dispatch(clearError());
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err) {
      // error is already set in Redux state
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero / Brand Area */}
          <Animated.View style={[styles.heroArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.logoCircle}>
                <Image source={AppLogo} style={styles.logoImage} />
              </View>
              {/* <View style={styles.logoAccent} /> */}
            </View>
            <Text style={styles.brandName}>{STRINGS.APP_NAME}</Text>
            <Text style={styles.brandTagline}>Sports Tournament Platform</Text>

            {/* Sport Icons Row */}
            <View style={styles.sportBadges}>
              {['🏏', '🏸', '⚽', '🏐', '🏓'].map((sport, i) => (
                <View key={i} style={styles.sportBadge}>
                  <Text style={styles.sportEmoji}>{sport}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.cardTitle}>{STRINGS.WELCOME}</Text>
            <Text style={styles.cardSubtitle}>{STRINGS.LOGIN_SUBTITLE}</Text>

            {/* Error Banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={15} color="#EF4444" />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <AppInput
              label={STRINGS.EMAIL}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={
                <View style={{ opacity: emailFocused ? 1 : 0.5 }}>
                  <Mail size={18} color={emailFocused ? COLORS.primary : COLORS.textSecondary} />
                </View>
              }
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />

            {/* Password */}
            <PasswordInput
              label={STRINGS.PASSWORD}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
            />

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
              <Text style={styles.forgotText}>{STRINGS.FORGOT_PASSWORD}</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <AppButton
              title={STRINGS.LOGIN}
              onPress={handleLogin}
              loading={loading}
              disabled={!isFormValid}
              style={styles.loginBtn}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Trophy line */}
            <View style={styles.promoRow}>
              <Trophy size={14} color={COLORS.primary} />
              <Text style={styles.promoText}>Join 10,000+ athletes competing now</Text>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footerContainer, { opacity: fadeAnim }]}>
            <Text style={styles.footerText}>{STRINGS.DONT_HAVE_ACCOUNT}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREEN_NAMES.SIGN_UP)}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>{STRINGS.SIGN_UP}</Text>
            </TouchableOpacity>
          </Animated.View>
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
    paddingHorizontal: SPACING['20'],
    paddingTop: SPACING['24'],
    paddingBottom: SPACING['32'],
  },

  // Hero
  heroArea: {
    alignItems: 'center',
    marginBottom: SPACING['28'],
  },
  logoImage: {
    width: 160,
    height: 100,
  },
  logoWrap: {
    position: 'relative',
    // marginBottom: 12,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    // backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: COLORS.primary,
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.5,
    // shadowRadius: 16,
    // elevation: 10,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 2,
  },
  brandTagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
    fontWeight: '500',
  },
  sportBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  sportBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sportEmoji: {
    fontSize: 18,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING['20'],
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING['20'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING['20'],
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    lineHeight: 18,
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  loginBtn: {
    marginBottom: SPACING['16'],
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginHorizontal: 10,
    fontWeight: '500',
  },

  // Promo
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  promoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
