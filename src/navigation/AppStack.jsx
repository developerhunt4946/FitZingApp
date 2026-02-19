import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens';
import { COLORS, FONTS, SPACING } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          fontSize: FONTS.lg,
          fontWeight: '600',
          color: COLORS.text,
        },
        headerTintColor: COLORS.primary,
        headerShadowVisible: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack (Empty for now - you can add more screens later)
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          fontSize: FONTS.lg,
          fontWeight: '600',
          color: COLORS.text,
        },
        headerTintColor: COLORS.primary,
        headerShadowVisible: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={HomeScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Stack.Navigator>
  );
};

// Settings Stack (Empty for now - you can add more screens later)
const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          fontSize: FONTS.lg,
          fontWeight: '600',
          color: COLORS.text,
        },
        headerTintColor: COLORS.primary,
        headerShadowVisible: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="SettingsScreen"
        component={HomeScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};

// App Stack with Bottom Tab Navigation
const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
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
          fontWeight: '500',
          marginTop: SPACING['4'],
        },
        tabBarIconStyle: {
          marginTop: SPACING['4'],
        },
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Import Text for emoji icons
import { Text } from 'react-native';

export default AppStack;
