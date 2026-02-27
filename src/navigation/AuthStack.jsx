import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, SignUpScreen } from '../screens';
import { COLORS, FONTS, SPACING } from '../theme';

import SCREEN_NAMES from '../constants/screenNames';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.LOGIN}
        component={LoginScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.SIGN_UP}
        component={SignUpScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
