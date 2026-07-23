import React, { memo, useCallback, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
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

const BUBBLE_WIDTH = 56;
const BUBBLE_HEIGHT = 52;
const BUBBLE_RADIUS = 18;
const PILL_HEIGHT = 68;
const BUBBLE_TOP = (PILL_HEIGHT - BUBBLE_HEIGHT) / 2;
const PILL_RADIUS = 34;
const RIM_THICKNESS = 1.5;

export type TabKey = 'Home' | 'Flash' | 'Grid' | 'Orders' | 'Profile';

interface Tab {
  key: TabKey;
  label: string;
  iconName: string;
}

const TABS: Tab[] = [
  { key: 'Home', label: 'Home', iconName: 'home' },
  { key: 'Flash', label: 'Flash', iconName: 'zap' },
  { key: 'Grid', label: 'Grid', iconName: 'grid' },
  { key: 'Orders', label: 'Orders', iconName: 'menu' },
  { key: 'Profile', label: 'Profile', iconName: 'user' },
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
        <Feather
          name={tab.iconName}
          size={20}
          color={active ? '#FFFFFF' : 'rgba(255,255,255,0.65)'}
        />
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
    </TouchableOpacity>
  );
});

function GlassBottomNav({ state, descriptors, navigation }: any) {
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
        const targetX = x + width / 2 - BUBBLE_WIDTH / 2;

        if (!hasPositioned.current) {
          bubbleX.setValue(targetX);
          hasPositioned.current = true;
        } else {
          Animated.spring(bubbleX, {
            toValue: targetX,
            useNativeDriver: true,
            friction: 8,
            tension: 90,
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
      <View style={styles.shadowWrap}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.85)',
            'rgba(255,255,255,0.2)',
            'rgba(255,255,255,0.05)',
            'rgba(255,255,255,0.2)',
          ]}
          locations={[0, 0.28, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.rim}
        >
          <View style={styles.pill}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={22}
              reducedTransparencyFallbackColor="rgba(20,20,45,0.85)"
            />

            <LinearGradient
              colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.08)']}
              locations={[0, 0.45, 1]}
              start={{ x: 0.15, y: -0.2 }}
              end={{ x: 0.7, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.24)']}
              style={styles.innerBottomShadow}
              pointerEvents="none"
            />

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
        </LinearGradient>
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <GlassBottomNav {...props} />}
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
    bottom: 24,
    alignItems: 'center',
  },
  shadowWrap: {
    width: '90%',
    borderRadius: PILL_RADIUS,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.4,
        shadowRadius: 22,
        shadowOffset: { width: 6, height: 14 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  rim: {
    borderRadius: PILL_RADIUS,
    padding: RIM_THICKNESS,
  },
  pill: {
    flexDirection: 'row',
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS - RIM_THICKNESS,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,20,45,0.4)',
  },
  innerBottomShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 22,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    top: BUBBLE_TOP,
    left: 0,
    width: BUBBLE_WIDTH,
    height: BUBBLE_HEIGHT,
    borderRadius: BUBBLE_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.35,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tabLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
