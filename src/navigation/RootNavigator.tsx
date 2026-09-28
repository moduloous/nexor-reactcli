import React, { useEffect } from 'react';
import { View, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import MedicinesScreen from '../screens/MedicinesScreen';
import CategoryComingSoonScreen from '../screens/CategoryComingSoonScreen';
import AllMedicinesScreen from '../screens/AllMedicinesScreen';
import CartScreen from '../screens/CartScreen';
import PrescriptionOrderScreen from '../screens/PrescriptionOrderScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import SwiggyCallbackScreen from '../screens/SwiggyCallbackScreen';
import SwiggyConnectScreen from '../screens/SwiggyConnectScreen';
import SwiggyFoodScreen from '../screens/SwiggyFoodScreen';
import SwiggyGroceryScreen from '../screens/SwiggyGroceryScreen';
import SwiggyRestaurantScreen from '../screens/SwiggyRestaurantScreen';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { CustomAlertModal } from '../components/CustomAlertModal';
import { CustomLoader } from '../components/CustomLoader';

const Stack = createNativeStackNavigator();

/** Deep-link config — maps nexor:// URIs to named screens */
const linking = {
  prefixes: ['nexor://'],
  config: {
    screens: {
      // Swiggy OAuth callback: nexor://swiggy/callback?code=xxx
      SwiggyCallback: 'swiggy/callback',
      Main: 'main',
    },
  },
};

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <CustomLoader size={60} />
    </View>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const setAuth = useAppStore((state) => state.setAuth);
  const logout = useAppStore((state) => state.logout);
  const setLoading = useAppStore((state) => state.setLoading);

  useEffect(() => {
    // Check for existing session on app startup
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuth(session.access_token, session.refresh_token ?? '', {
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.email?.split('@')[0] || 'User',
          phone: '',
        });
      }
      setLoading(false);
    });

    // Listen to future auth changes (token refresh, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setAuth(session.access_token, session.refresh_token ?? '', {
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.email?.split('@')[0] || 'User',
            phone: '',
          });
        } else {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            animation: 'slide_from_right',
          }}
        >
          {isLoading ? (
            <Stack.Screen name="Loading" component={LoadingScreen} />
          ) : isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen
                name="Medicines"
                component={MedicinesScreen}
                options={{ contentStyle: { backgroundColor: '#FFFFFF' } }}
              />
              <Stack.Screen
                name="PrescriptionOrder"
                component={PrescriptionOrderScreen}
                options={{ contentStyle: { backgroundColor: '#F9F8FC' } }}
              />
              <Stack.Screen
                name="AllMedicines"
                component={AllMedicinesScreen}
                options={{ contentStyle: { backgroundColor: '#FFFFFF' } }}
              />
              <Stack.Screen
                name="CategoryComingSoon"
                component={CategoryComingSoonScreen}
                options={{ contentStyle: { backgroundColor: '#FFFFFF' } }}
              />
              <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{ contentStyle: { backgroundColor: '#F9F8FC' } }}
              />
              <Stack.Screen
                name="OrderTracking"
                component={OrderTrackingScreen}
                options={{ contentStyle: { backgroundColor: '#FFF' } }}
              />
              <Stack.Screen
                name="OrderDetails"
                component={OrderDetailsScreen}
                options={{ contentStyle: { backgroundColor: '#F9F8FC' } }}
              />
              {/* ── Swiggy Screens ─────────────────────────────────────── */}
              {/* OAuth deep-link callback */}
              <Stack.Screen
                name="SwiggyCallback"
                component={SwiggyCallbackScreen}
                options={{ contentStyle: { backgroundColor: '#0D0D0D' }, animation: 'fade' }}
              />
              {/* 'Powered by Swiggy' connect gate (mode: food | grocery) */}
              <Stack.Screen
                name="SwiggyConnect"
                component={SwiggyConnectScreen}
                options={{ contentStyle: { backgroundColor: '#1A0A00' } }}
              />
              {/* Live food delivery */}
              <Stack.Screen
                name="SwiggyFood"
                component={SwiggyFoodScreen}
                options={{ contentStyle: { backgroundColor: '#FAFAFA' } }}
              />
              {/* Live grocery / Instamart */}
              <Stack.Screen
                name="SwiggyGrocery"
                component={SwiggyGroceryScreen}
                options={{ contentStyle: { backgroundColor: '#FAFAFA' } }}
              />
              {/* Restaurant menu + ordering */}
              <Stack.Screen
                name="SwiggyRestaurant"
                component={SwiggyRestaurantScreen}
                options={{ contentStyle: { backgroundColor: '#FAFAFA' } }}
              />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <CustomAlertModal />
    </>
  );
}
