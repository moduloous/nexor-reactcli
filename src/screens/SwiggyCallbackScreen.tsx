/**
 * SwiggyCallbackScreen
 *
 * Handles the deep-link: nexor://swiggy/callback?code=<authorization_code>
 *
 * Flow:
 *  1. Backend receives https://nexor.app/swiggy/callback from Swiggy.
 *  2. Backend redirects to nexor://swiggy/callback?code=<code> (this screen).
 *  3. This screen exchanges the code for a bearer token via POST /swiggy/auth/token.
 *  4. On success → navigates to Main tab stack.
 *  5. On error   → shows an error and lets the user retry.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Config from 'react-native-config';
import { useAppStore } from '../store/useAppStore';

type SwiggyCallbackParams = {
  SwiggyCallback: {
    code?: string;
    error?: string;
    state?: string;
  };
};

type Status = 'loading' | 'success' | 'error';

export default function SwiggyCallbackScreen() {
  const route = useRoute<RouteProp<SwiggyCallbackParams, 'SwiggyCallback'>>();
  const navigation = useNavigation<any>();
  const token = useAppStore((s) => s.token);

  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Animations
  const iconScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    handleCallback();
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  async function handleCallback() {
    const { code, error } = route.params ?? {};

    // --- Error returned by Swiggy or backend relay ---
    if (error || !code) {
      setErrorMsg(error || 'Authorization failed. No code was returned.');
      setStatus('error');
      return;
    }

    // --- Exchange the code for a bearer token ---
    try {
      const baseUrl = Config.API_BASE_URL || 'https://nexor-backend.onrender.com/api';

      // We need the PKCE code_verifier that was stored before the OAuth flow started.
      // It should be in the app store (set when the user initiated Swiggy connect).
      const codeVerifier = useAppStore.getState().swiggyCodeVerifier;

      if (!codeVerifier) {
        throw new Error('PKCE code verifier not found. Please try connecting Swiggy again.');
      }

      const res = await fetch(`${baseUrl}/swiggy/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, codeVerifier }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Server error ${res.status}`);
      }

      // Clear the stored verifier — it's single-use
      useAppStore.getState().clearSwiggyCodeVerifier?.();
      // Mark Swiggy as connected so the connect screen skips login next time
      useAppStore.getState().setSwiggyConnected(true);

      setStatus('success');

      // Wait a beat so the user sees the success state, then go to the right screen
      setTimeout(() => {
        const pendingMode = (route.params as any)?.mode;
        if (pendingMode === 'grocery') {
          navigation.replace('SwiggyGrocery');
        } else if (pendingMode === 'food') {
          navigation.replace('SwiggyFood');
        } else {
          navigation.replace('Main');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Swiggy orange glow background */}
      <View style={styles.glowBg} />

      <Animated.View style={[styles.iconCircle, { transform: [{ scale: iconScale }] },
        isSuccess && styles.iconCircleSuccess,
        status === 'error' && styles.iconCircleError,
      ]}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF5200" />
        ) : isSuccess ? (
          <Text style={styles.iconEmoji}>✓</Text>
        ) : (
          <Text style={styles.iconEmoji}>✕</Text>
        )}
      </Animated.View>

      <Text style={styles.title}>
        {isLoading
          ? 'Connecting Swiggy…'
          : isSuccess
          ? 'Swiggy Connected!'
          : 'Connection Failed'}
      </Text>

      <Text style={styles.subtitle}>
        {isLoading
          ? 'Exchanging your authorization code with the server.'
          : isSuccess
          ? 'You can now order food through Nexor.'
          : errorMsg}
      </Text>

      {status === 'error' && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Go Back & Retry</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const ORANGE = '#FF5200';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  glowBg: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: ORANGE,
    opacity: 0.06,
    top: '28%',
    alignSelf: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconCircleSuccess: {
    borderColor: '#22C55E',
    backgroundColor: '#14532D33',
  },
  iconCircleError: {
    borderColor: '#EF4444',
    backgroundColor: '#7F1D1D33',
  },
  iconEmoji: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 36,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    backgroundColor: ORANGE,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
