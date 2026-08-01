import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import MedicinesScreen from '../screens/MedicinesScreen';
import CategoryComingSoonScreen from '../screens/CategoryComingSoonScreen';
import AllMedicinesScreen from '../screens/AllMedicinesScreen';
import CartScreen from '../screens/CartScreen';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="#4A90E2" />
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
    <NavigationContainer>
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
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
