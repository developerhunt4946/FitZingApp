import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { RootNavigator } from './src/navigation';
import { COLORS } from './src/theme';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={COLORS.background}
          translucent={false}
        />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
