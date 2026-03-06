import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import { updateFcmToken } from './userServices';
import store from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission status:', authStatus);
    await getFcmToken();
  }
};

export const getFcmToken = async () => {
  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
    console.log('FCM Token:', fcmToken);

    // Sync token with backend if user is logged in
    const token = await AsyncStorage.getItem('authToken');
    if (token && fcmToken) {
      try {
        await updateFcmToken(fcmToken);
        console.log('FCM Token synced with backend');
      } catch (error) {
        console.error('Error syncing FCM token:', error);
      }
    }

    return fcmToken;
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};

export const notificationListener = async () => {
  // Foreground notifications
  messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

    // Dispatch to Redux store
    store.dispatch(addNotification({
      title: remoteMessage.notification?.title || 'Notification',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
    }));
  });

  // Background/Quit state notifications (when user clicks)
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
  });

  // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
      }
    });
};