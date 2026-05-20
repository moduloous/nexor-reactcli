import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';

// ─── Root Stack ───────────────────────────────────────────
// Future: add Auth screens, module detail screens, etc.
// e.g. Stack.Screen name="FoodDetail" component={FoodDetailScreen}

export type RootStackParamList = {
  MainTabs: undefined;
  // Auth
  // Login: undefined;
  // Signup: undefined;
  // Module Screens
  // FoodDetail: { restaurantId: string };
  // MedicineDetail: { productId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
