import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

// ─── Tab Config ───────────────────────────────────────────

const TAB_CONFIG: Record<string, { label: string; icon: string; activeIcon: string }> = {
  Home:    { label: 'Home',    icon: '🏠', activeIcon: '🏠' },
  Search:  { label: 'Search',  icon: '🔍', activeIcon: '🔍' },
  Orders:  { label: 'Orders',  icon: '📦', activeIcon: '📦' },
  Profile: { label: 'Profile', icon: '👤', activeIcon: '👤' },
};

// ─── Navigator ────────────────────────────────────────────

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#845EF7',
        tabBarInactiveTintColor: '#6E6E73',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const config = TAB_CONFIG[route.name];
          return (
            <View style={styles.iconWrap}>
              <Text style={styles.tabIcon}>
                {focused ? config.activeIcon : config.icon}
              </Text>
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111114',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
    height: 70,
    paddingTop: 6,
    paddingBottom: 10,
    position: 'absolute',
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 22,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#845EF7',
    marginTop: 3,
  },
});
