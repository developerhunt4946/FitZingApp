import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { HomeScreen, TournamentDetailsScreen, CreateTournamentScreen, ProfileScreen } from '../screens';
import { COLORS, FONTS, SPACING } from '../theme';
import { Home, User, Settings, Plus } from 'lucide-react-native';
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

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name={SCREEN_NAMES.HOME} component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name={SCREEN_NAMES.TOURNAMENT_DETAILS} component={TournamentDetailsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const SharedStackScreens = () => (
  <>
    <Stack.Screen name={SCREEN_NAMES.TOURNAMENT_DETAILS} component={TournamentDetailsScreen} options={{ headerShown: false }} />
  </>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name={SCREEN_NAMES.PROFILE} component={ProfileScreen} options={{ title: STRINGS.PROFILE, headerShown: false }} />
    {SharedStackScreens()}
  </Stack.Navigator>
);

// Settings Stack
const SettingsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name={SCREEN_NAMES.SETTINGS} component={HomeScreen} options={{ title: STRINGS.SETTINGS, headerShown: false }} />
    {SharedStackScreens()}
  </Stack.Navigator>
);

// Create Stack (Admin only)
const CreateStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name={SCREEN_NAMES.CREATE_TOURNAMENT} component={CreateTournamentScreen} options={{ headerShown: false }} />
    {SharedStackScreens()}
  </Stack.Navigator>
);

// App Stack with Bottom Tab Navigation
const AppStack = () => {
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
      {/* Tab 1: Home (Both) */}
      <Tab.Screen
        name={SCREEN_NAMES.HOME}
        component={HomeStack}
        options={{
          title: STRINGS.HOME || 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />

      {/* Tab 2: Prominent Middle Tab */}
      {isAdmin ? (
        <Tab.Screen
          name={SCREEN_NAMES.CREATE_TOURNAMENT}
          component={CreateStack}
          options={{
            tabBarLabel: () => null,
            tabBarButton: (props) => <CustomTabBarButton {...props} isProminent />,
            tabBarIcon: ({ color }) => <Plus size={28} color={COLORS.white} />,
          }}
        />
      ) : (
        <Tab.Screen
          name={SCREEN_NAMES.PROFILE}
          component={ProfileStack}
          options={{
            tabBarLabel: () => null,
            tabBarButton: (props) => <CustomTabBarButton {...props} isProminent />,
            tabBarIcon: ({ color }) => <User size={28} color={COLORS.white} />,
          }}
        />
      )}

      {/* Tab 3: Contextual (User -> Settings, Admin -> Profile) */}
      {isAdmin ? (
        <Tab.Screen
          name={SCREEN_NAMES.PROFILE}
          component={ProfileStack}
          options={{
            title: STRINGS.PROFILE || 'Profile',
            tabBarIcon: ({ color }) => <User size={22} color={color} />,
          }}
        />
      ) : (
        <Tab.Screen
          name={SCREEN_NAMES.SETTINGS}
          component={SettingsStack}
          options={{
            title: STRINGS.SETTINGS || 'Settings',
            tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
          }}
        />
      )}
    </Tab.Navigator>
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
