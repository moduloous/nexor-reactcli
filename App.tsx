/**
 * Nexor Super App
 * Entry point — wires up navigation, gesture handler, safe area provider,
 * and the blackhole splash screen.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Simulate backend + frontend readiness check
  useEffect(() => {
    async function prepare() {
      try {
        if (Platform.OS === 'android') {
          try {
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Location Permission',
                message: 'Nexor needs access to your location for delivery and nearby services.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
          } catch (err) {
            console.warn(err);
          }
        }
        await new Promise<void>(resolve => setTimeout(resolve, 2800)); // min display time
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Main app — always mounted so nav state is ready */}
        {!showSplash && <RootNavigator />}

        {/* Splash overlays everything until isReady + fade-out done */}
        {showSplash && (
          <SplashScreen isReady={isReady} onFinish={handleSplashFinish} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});
