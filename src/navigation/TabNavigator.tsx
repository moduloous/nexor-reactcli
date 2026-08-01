import React, { memo, useCallback, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const FlashScreen = () => (
  <View style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#000', fontSize: 24 }}>Flash</Text>
  </View>
);

const GridScreen = () => (
  <View style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#000', fontSize: 24 }}>Grid</Text>
  </View>
);

const BUBBLE_SIZE = 56;
const PILL_HEIGHT = 72;
const BUBBLE_TOP = (PILL_HEIGHT - BUBBLE_SIZE) / 2;
const PILL_RADIUS = 36;

export type TabKey = 'Home' | 'Flash' | 'Grid' | 'Orders' | 'Profile';

interface Tab {
  key: TabKey;
  iconName?: string;
  imageUrl?: string;
}

const TABS: Tab[] = [
  { key: 'Home', imageUrl: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/home%20icons/home.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJob21lIGljb25zL2hvbWUucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDg3Njc1NSwiZXhwIjoxODc5NDg0NzU1fQ.TfVnsiJCDJJTR9WEMlwgNuHxGKZ3ERQbqrwTDyIK-Tg' },
  { key: 'Flash', imageUrl: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/home%20icons/flash.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJob21lIGljb25zL2ZsYXNoLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4NzY1MzMsImV4cCI6MTg3OTQ4NDUzM30.Cwn0FKv39NF7NSvIrLuH21WUPXs6w1ipS5jqKTzwL3E' },
  { key: 'Grid', imageUrl: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/home%20icons/grid.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJob21lIGljb25zL2dyaWQucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDg3NjcyNCwiZXhwIjoxODc5NDg0NzI0fQ.531ha98tIHfuElen4K0MqqVgmoWNnbhkhcF_-7ybQDo' },
  { key: 'Orders', imageUrl: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/home%20icons/orders.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJob21lIGljb25zL29yZGVycy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0ODc3MTA3LCJleHAiOjE4Nzk0ODUxMDd9.zhEzhyjctmSu06gUThsXodD9lH0oQf_-a7JrCnTV7SU' },
  { key: 'Profile', imageUrl: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/home%20icons/profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJob21lIGljb25zL3Byb2ZpbGUucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDg3NzEzOCwiZXhwIjoxODc5NDg1MTM4fQ.VQlgVIYK8fUZepJAXR6ujphvqOqnbtIooZVRczXenYM' },
];

const TabButton = memo(function TabButton({
  tab,
  active,
  onPress,
  iconRef,
}: {
  tab: Tab;
  active: boolean;
  onPress: (key: TabKey) => void;
  iconRef: (node: View | null) => void;
}) {
  const handlePress = useCallback(() => onPress(tab.key), [onPress, tab.key]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      style={styles.tabButton}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
    >
      <View ref={iconRef} collapsable={false} style={styles.iconWrap}>
        {tab.imageUrl ? (
          <Image
            source={{ uri: tab.imageUrl }}
            style={{ width: 26, height: 26, tintColor: active ? '#13141C' : '#FFFFFF' }}
            resizeMode="contain"
          />
        ) : (
          <Feather
            name={tab.iconName!}
            size={24}
            color={active ? '#13141C' : '#FFFFFF'}
          />
        )}
      </View>
    </TouchableOpacity>
  );
});

function SolidBottomNav({ state, descriptors, navigation }: any) {
  const activeTab = state.routes[state.index].name as TabKey;

  const onTabPress = useCallback(
    (key: TabKey) => {
      const isFocused = activeTab === key;
      const route = state.routes.find((r: any) => r.name === key);
      if (!route) return;

      if (!isFocused) {
        navigation.navigate(route.name);
      }
      navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: false,
      });
    },
    [activeTab, navigation, state.routes]
  );

  const rowRef = useRef<View>(null);
  const iconRefs = useRef<(View | null)[]>([]);
  const hasPositioned = useRef(false);

  const bubbleX = useRef(new Animated.Value(0)).current;

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  const positionBubble = useCallback(() => {
    const iconNode = iconRefs.current[activeIndex];
    const rowNode = rowRef.current;
    if (!iconNode || !rowNode) return;

    iconNode.measureLayout(
      // @ts-ignore
      rowNode,
      (x: number, _y: number, width: number) => {
        const targetX = x + width / 2 - BUBBLE_SIZE / 2;

        if (!hasPositioned.current) {
          bubbleX.setValue(targetX);
          hasPositioned.current = true;
        } else {
          Animated.spring(bubbleX, {
            toValue: targetX,
            useNativeDriver: true,
            friction: 7,
            tension: 80,
          }).start();
        }
      },
      () => { }
    );
  }, [activeIndex, bubbleX]);

  useEffect(() => {
    positionBubble();
  }, [positionBubble]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.pill}>
        <View style={styles.row} ref={rowRef} onLayout={positionBubble}>
          <Animated.View
            pointerEvents="none"
            style={[styles.bubble, { transform: [{ translateX: bubbleX }] }]}
          />

          {TABS.map((tab, index) => (
            <TabButton
              key={tab.key}
              tab={tab}
              active={activeTab === tab.key}
              onPress={onTabPress}
              iconRef={(node) => {
                iconRefs.current[index] = node;
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <SolidBottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Flash" component={FlashScreen} />
      <Tab.Screen name="Grid" component={GridScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: 'center',
  },
  pill: {
    width: '90%',
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    backgroundColor: '#13141C',
    flexDirection: 'row',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.25,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    top: BUBBLE_TOP,
    left: 0,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
  },
});
