import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens';
import { COLORS, FONTS, SPACING } from '../theme';
import { Home, User, Settings } from 'lucide-react-native';

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

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileScreen" component={HomeScreen} options={{ title: 'Profile' }} />
  </Stack.Navigator>
);

// Settings Stack
const SettingsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="SettingsScreen" component={HomeScreen} options={{ title: 'Settings' }} />
  </Stack.Navigator>
);

// App Stack with Bottom Tab Navigation
const AppStack = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textTertiary,
      tabBarLabelStyle: {
        fontSize: FONTS.xs,
        fontWeight: '600',
        marginTop: 2,
      },
    }}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStack}
      options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
      }}
    />
    <Tab.Screen
      name="ProfileStack"
      component={ProfileStack}
      options={{
        title: 'Profile',
        tabBarIcon: ({ color, size }) => <User size={22} color={color} />,
      }}
    />
    <Tab.Screen
      name="SettingsStack"
      component={SettingsStack}
      options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => <Settings size={22} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default AppStack;
