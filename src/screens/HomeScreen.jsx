import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, Button, Card } from '../components';
import { COLORS, FONTS, SPACING } from '../theme';
import { logoutUser } from '../redux/actions/authActions';
import { authAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { user, token, isLoading } = auth;
  const [userProfile, setUserProfile] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsFetching(true);
      // If you have a get profile endpoint, uncomment this
      // const response = await authAPI.getUserProfile();
      // setUserProfile(response.data);
      
      // For now, use the user data from Redux
      if (user) {
        setUserProfile(user);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
      // Continue even if fetch fails
      if (user) {
        setUserProfile(user);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Call logout API if needed
              // await authAPI.logout();
              
              // Clear storage
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              
              // Dispatch logout action
              dispatch(logoutUser());
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (isFetching) {
    return (
      <Container centerContent>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </Container>
    );
  }

  return (
    <Container scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Card */}
      {userProfile && (
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile.fullName || userProfile.name || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {userProfile.email}
              </Text>
            </View>
          </View>
          <Button
            title="View Profile"
            variant="outline"
            size="md"
            style={styles.profileButton}
          />
        </Card>
      )}

      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to FitZing! 🎯</Text>
        <Text style={styles.welcomeDescription}>
          You're all set! Start exploring the features and integrate your APIs here.
        </Text>
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <Card style={styles.actionCard}>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.iconBox, { backgroundColor: COLORS.infoLight }]}>
            <Text style={styles.iconText}>📊</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Dashboard</Text>
            <Text style={styles.actionDescription}>View your statistics</Text>
          </View>
        </TouchableOpacity>
      </Card>

      <Card style={styles.actionCard}>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.iconBox, { backgroundColor: COLORS.successLight }]}>
            <Text style={styles.iconText}>⚙️</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionDescription}>Manage your preferences</Text>
          </View>
        </TouchableOpacity>
      </Card>

      <Card style={styles.actionCard}>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.iconBox, { backgroundColor: COLORS.warningLight }]}>
            <Text style={styles.iconText}>❓</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Help & Support</Text>
            <Text style={styles.actionDescription}>Get help when you need it</Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* API Integration Guide */}
      <Card style={styles.guideCard}>
        <Text style={styles.guideTitle}>Next Steps:</Text>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>1. Update API base URL in src/services/apiClient.js</Text>
        </View>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>2. Implement your API endpoints in src/services/api.js</Text>
        </View>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>3. Create Redux actions for your API calls</Text>
        </View>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>4. Integrate with your screens</Text>
        </View>
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['24'],
  },
  title: {
    ...FONTS.heading2,
    color: COLORS.text,
  },
  logoutButton: {
    color: COLORS.error,
    fontSize: FONTS.base,
    fontWeight: '600',
  },
  profileCard: {
    marginBottom: SPACING['16'],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['16'],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING['16'],
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONTS['2xl'],
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...FONTS.body1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING['4'],
  },
  profileEmail: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  profileButton: {
    width: '100%',
  },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING['24'],
  },
  welcomeTitle: {
    ...FONTS.heading3,
    color: COLORS.white,
    marginBottom: SPACING['8'],
  },
  welcomeDescription: {
    ...FONTS.body2,
    color: 'rgba(255,255,255,0.9)',
  },
  sectionTitle: {
    ...FONTS.heading4,
    color: COLORS.text,
    marginBottom: SPACING['12'],
    marginTop: SPACING['8'],
  },
  actionCard: {
    marginBottom: SPACING['12'],
    paddingHorizontal: SPACING['12'],
    paddingVertical: SPACING['12'],
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING['12'],
  },
  iconText: {
    fontSize: FONTS['2xl'],
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionDescription: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING['2'],
  },
  guideCard: {
    backgroundColor: COLORS.gray50,
    marginTop: SPACING['16'],
    marginBottom: SPACING['32'],
  },
  guideTitle: {
    ...FONTS.heading4,
    color: COLORS.text,
    marginBottom: SPACING['12'],
  },
  guideItem: {
    marginBottom: SPACING['10'],
  },
  guideBullet: {
    ...FONTS.body2,
    color: COLORS.text,
    paddingLeft: SPACING['8'],
  },
});

export default HomeScreen;
