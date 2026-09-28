/**
 * Nexor Super App
 * Entry point — wires up navigation, gesture handler, safe area provider,
 * and the blackhole splash screen.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, View, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';

import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/components/SplashScreen';
import { useAppStore } from './src/store/useAppStore';
import Config from 'react-native-config';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Simulate backend + frontend readiness check
  useEffect(() => {
    async function prepare() {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'Nexor needs access to your location for delivery and nearby services.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Location Required', 'Nexor strictly requires location permissions to operate. Please restart the app and grant permission.');
            return; // Block the app from continuing
          }

          // Fetch real location
          await new Promise<void>((resolve, reject) => {
            Geolocation.getCurrentPosition(
              async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                useAppStore.getState().setUserLocation(lat, lng);

                try {
                  const baseUrl = Config.API_BASE_URL || 'https://nexor-backend.onrender.com/api';
                  const res = await fetch(`${baseUrl}/medicines/serviceability/pharmacies?lat=${lat}&lng=${lng}`);
                  const data = await res.json();
                  const responseData = data.data || data;
                  if (res.ok && responseData.pharmacies && responseData.pharmacies.length > 0) {
                    useAppStore.getState().setServiceability(true, responseData.pharmacies[0].pharmacyId || responseData.pharmacies[0].id);
                  } else {
                    // Temporarily set to true in DEV if it fails so you can keep building UI, 
                    // or show an alert to debug
                    console.log('Location check failed or no pharmacies:', responseData);
                    Alert.alert('Location Check Failed', `No pharmacies found near ${lat}, ${lng}. Response: ${JSON.stringify(responseData)}`);
                    // Real serviceability check completed
                    useAppStore.getState().setServiceability(false, null);
                  }
                } catch (e: any) {
                  Alert.alert('Network Error', `Could not reach backend: ${e.message}`);
                  useAppStore.getState().setServiceability(false, null);
                }

                resolve();
              },
              (error) => {
                Alert.alert('GPS Required', 'Please enable GPS on your device and restart the app.');
                reject(error);
              },
              { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
            );
          });
        }
        await new Promise<void>(resolve => setTimeout(resolve, 2000)); // min display time
        setIsReady(true);
      } catch (err) {
        console.warn('App prepare error:', err);
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
