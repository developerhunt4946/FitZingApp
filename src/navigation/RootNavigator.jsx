import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { setUser, setToken } from '../redux/slices/authSlice';
import { COLORS } from '../theme';

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Restore token and user data from AsyncStorage on app launch
      const savedToken = await AsyncStorage.getItem('authToken');
      const savedUserData = await AsyncStorage.getItem('userData');

      if (savedToken && savedUserData) {
        // Token and user data found, restore them
        const userData = JSON.parse(savedUserData);
        dispatch(setToken(savedToken));
        dispatch(setUser(userData));
      }
    } catch (e) {
      // Restoring token failed
      console.log('Failed to restore token:', e);
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token && user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
