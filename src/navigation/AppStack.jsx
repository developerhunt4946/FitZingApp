import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import {
  HomeScreen,
  TournamentDetailsScreen,
  CreateTournamentScreen,
  CreateESportsTournamentScreen,
  ESportsTournamentDetailsScreen,
  ESportsRegistrationScreen,
  ProfileScreen,
  NotificationScreen,
  RegistrationScreen,
  BookingsScreen,
  AllTournamentsScreen,
  RegistrationConfirmationScreen,
  CategoryScreen,
  RegisteredTeamsScreen,
  RoundsScreen,
  GroupsScreen,
  MatchesScreen,
  TossScreen,
  CricketScoringScreen,
  CricketScorecardScreen,
  MyMatchesScreen,
  MyAchievementsScreen,
  ReferFriendScreen,
  HelpSupportScreen
} from '../screens';
import { COLORS, FONTS, SPACING } from '../theme';
import { Home, User, Ticket, Plus } from 'lucide-react-native';
import SCREEN_NAMES from '../constants/screenNames';
import STRINGS from '../constants/strings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTitleStyle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerTintColor: COLORS.primary,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.background },
};

const CustomTabBarButton = ({ children, onPress, isProminent }) => (
  <TouchableOpacity
    style={[
      styles.customButtonContainer,
      isProminent && styles.prominentButtonContainer
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[
      styles.customButton,
      isProminent && styles.prominentButton
    ]}>
      {children}
    </View>
  </TouchableOpacity>
);

// Main Tabs Navigator
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'admin' || user?.userRole === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      {/* Tab 1: Home */}
      <Tab.Screen
        name={SCREEN_NAMES.HOME}
        component={HomeScreen}
        options={{
          title: STRINGS.HOME || 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />

      {/* Tab 2: Create (Admin) or Bookings (User) */}
      {isAdmin ? (
        <Tab.Screen
          name={SCREEN_NAMES.CREATE_TOURNAMENT}
          component={CreateTournamentScreen}
          options={{
            tabBarLabel: () => null,
            tabBarButton: (props) => <CustomTabBarButton {...props} isProminent />,
            tabBarIcon: () => <Plus size={28} color={COLORS.white} />,
          }}
        />
      ) : (
        <Tab.Screen
          name={SCREEN_NAMES.BOOKINGS}
          component={BookingsScreen}
          options={{
            tabBarLabel: () => null,
            tabBarButton: (props) => <CustomTabBarButton {...props} isProminent />,
            tabBarIcon: () => <Ticket size={28} color={COLORS.white} />,
          }}
        />
      )}

      {/* Tab 3: Profile */}
      <Tab.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
        options={{
          title: STRINGS.PROFILE,
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Root App Stack
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        headerShown: false,
      }}
    >
      {/* Main Tab Navigator */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Screens where Bottom Tab Bar should be hidden */}
      <Stack.Screen
        name={SCREEN_NAMES.TOURNAMENT_DETAILS}
        component={TournamentDetailsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.NOTIFICATION}
        component={NotificationScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.REGISTRATION}
        component={RegistrationScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ALL_TOURNAMENTS}
        component={AllTournamentsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.REGISTRATION_CONFIRMATION}
        component={RegistrationConfirmationScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CATEGORY}
        component={CategoryScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.REGISTERED_TEAMS}
        component={RegisteredTeamsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ROUNDS}
        component={RoundsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.GROUPS}
        component={GroupsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.MATCHES}
        component={MatchesScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TOSS}
        component={TossScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CRICKET_SCORING}
        component={CricketScoringScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CRICKET_SCORECARD}
        component={CricketScorecardScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.MY_MATCHES}
        component={MyMatchesScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.MY_ACHIEVEMENTS}
        component={MyAchievementsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.REFER_FRIEND}
        component={ReferFriendScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.HELP_SUPPORT}
        component={HelpSupportScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CREATE_ESPORTS_TOURNAMENT}
        component={CreateESportsTournamentScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ESPORTS_TOURNAMENT_DETAILS}
        component={ESportsTournamentDetailsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ESPORTS_REGISTRATION}
        component={ESportsRegistrationScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  customButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prominentButtonContainer: {
    top: -20, // Raise the middle button
  },
  customButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  prominentButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.background,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AppStack;
