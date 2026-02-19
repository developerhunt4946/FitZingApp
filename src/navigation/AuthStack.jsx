import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, SignUpScreen } from '../screens';
import { COLORS, FONTS, SPACING } from '../theme';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // animationEnabled: true,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        // options={{
        //   animationTypeForReplace: true,
        // }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        // options={{
        //   animationTypeForReplace: false,
        // }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
