/**
 * SwiggyConnectScreen
 *
 * Shown when user taps "Grocery" or "Food Delivery" on the home screen.
 * If they haven't connected Swiggy yet → beautiful "Powered by Swiggy" splash
 * with a connect button that kicks off the PKCE OAuth flow.
 *
 * If already connected → navigates directly to the appropriate Swiggy screen.
 *
 * Props (route params):
 *   mode: 'food' | 'grocery'
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { checkSwiggyConnection, startSwiggyOAuth } from '../api/swiggy.api';

const { width, height } = Dimensions.get('window');

const SWIGGY_ORANGE = '#FF5200';
const SWIGGY_DARK = '#1A0A00';

type Mode = 'food' | 'grocery';

const CONTENT: Record<Mode, { title: string; subtitle: string; badge: string; icon: string }> = {
  food: {
    title: 'Food Delivery',
    subtitle: 'Order from thousands of restaurants near you, all inside Nexor.',
    badge: '🛵',
    icon: '🍕',
  },
  grocery: {
    title: 'Grocery & Instamart',
    subtitle: 'Get groceries, veggies, dairy and more delivered in minutes.',
    badge: '🛒',
    icon: '🥦',
  },
};

export default function SwiggyConnectScreen({ route, navigation }: any) {
  const mode: Mode = route.params?.mode ?? 'food';
  const insets = useSafeAreaInsets();

  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start orb animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Check if already connected
    checkSwiggyConnection().then((connected) => {
      setChecking(false);
      if (connected) {
        // Already linked — go straight to the screen
        navigation.replace(mode === 'food' ? 'SwiggyFood' : 'SwiggyGrocery');
      } else {
        // Show connect UI
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();

        // Pulse the button
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          ])
        ).start();
      }
    });
  }, []);

  async function handleConnect() {
    setConnecting(true);
    try {
      await startSwiggyOAuth();
      // The OAuth flow opens a browser. The deep-link will bring us back to SwiggyCallbackScreen.
      // Nothing else to do here — the app will navigate from the callback screen.
    } catch (e) {
      setConnecting(false);
    }
  }

  const orbTranslateY = orbAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });

  if (checking) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={SWIGGY_DARK} />
        <ActivityIndicator size="large" color={SWIGGY_ORANGE} />
      </View>
    );
  }

  const content = CONTENT[mode];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={SWIGGY_DARK} />

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="arrow-left" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Animated orb background */}
      <Animated.View
        style={[
          styles.orb,
          { transform: [{ translateY: orbTranslateY }] },
        ]}
      />
      <View style={styles.orbSmall} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingTop: insets.top + 60,
          },
        ]}
      >
        {/* Badge icon */}
        <View style={styles.badgeCircle}>
          <Text style={styles.badgeEmoji}>{content.badge}</Text>
        </View>

        {/* Powered by Swiggy pill */}
        <View style={styles.poweredPill}>
          <View style={styles.swiggyDot} />
          <Text style={styles.poweredText}>Powered by Swiggy</Text>
        </View>

        {/* Heading */}
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          {(mode === 'food'
            ? ['1000+ Restaurants', 'Live Tracking', 'Fast Delivery']
            : ['Fresh Produce', '10-min Delivery', 'Best Prices']
          ).map((label) => (
            <View key={label} style={styles.featurePill}>
              <Text style={styles.featurePillText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Login prompt */}
        <Text style={styles.loginPrompt}>
          Connect your Swiggy account to get started
        </Text>

        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnect}
            activeOpacity={0.85}
            disabled={connecting}
          >
            {connecting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.connectButtonText}>
                  {mode === 'food' ? 'Connect for Food Delivery' : 'Connect for Grocery'}
                </Text>
                <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.disclaimer}>
          You'll be redirected to Swiggy to log in securely.{'\n'}We never store your Swiggy password.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: SWIGGY_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: SWIGGY_DARK,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: SWIGGY_ORANGE,
    opacity: 0.12,
    top: -80,
    right: -80,
  },
  orbSmall: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF8C42',
    opacity: 0.08,
    bottom: 120,
    left: -60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  badgeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,82,0,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,82,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badgeEmoji: {
    fontSize: 44,
  },
  poweredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,0,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,82,0,0.4)',
    marginBottom: 22,
  },
  swiggyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SWIGGY_ORANGE,
    marginRight: 8,
  },
  poweredText: {
    fontSize: 13,
    fontWeight: '700',
    color: SWIGGY_ORANGE,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
  },
  featurePill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  featurePillText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  loginPrompt: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 18,
    textAlign: 'center',
  },
  connectButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: SWIGGY_ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SWIGGY_ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
