import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';

// ─── Module Cards ─────────────────────────────────────────

const MODULES = [
  { id: 'food', emoji: '🍔', title: 'Food', subtitle: 'Delivery in 30 min', color: '#FF6B35' },
  { id: 'medicine', emoji: '💊', title: 'Medicine', subtitle: 'Pharmacy near you', color: '#00C9A7' },
  { id: 'rides', emoji: '🚗', title: 'Rides', subtitle: 'Go anywhere', color: '#845EF7' },
  { id: 'shopping', emoji: '🛍️', title: 'Shopping', subtitle: 'Everything store', color: '#FF6B9D' },
  { id: 'events', emoji: '🎫', title: 'Events', subtitle: 'What\'s happening', color: '#FFC43D' },
  { id: 'more', emoji: '⚡', title: 'More', subtitle: 'Coming soon', color: '#4ECDC4' },
];

// ─── Component ────────────────────────────────────────────

export default function HomeScreen() {
  const user = useAppStore((s) => s.user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.greeting}>
            Hey{user?.name ? `, ${user.name}` : ''} 👋
          </Text>
          <Text style={styles.tagline}>What do you need today?</Text>
        </Animated.View>

        {/* Module Grid */}
        <View style={styles.grid}>
          {MODULES.map((mod, index) => (
            <Animated.View
              key={mod.id}
              entering={FadeInRight.delay(index * 80).duration(500)}
            >
              <TouchableOpacity
                style={[styles.card, { borderColor: mod.color + '30' }]}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: mod.color + '15' }]}>
                  <Text style={styles.emoji}>{mod.emoji}</Text>
                </View>
                <Text style={styles.cardTitle}>{mod.title}</Text>
                <Text style={styles.cardSub}>{mod.subtitle}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickEmoji}>📋</Text>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>Upload Prescription</Text>
              <Text style={styles.quickSub}>Get medicines delivered</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickEmoji}>🔁</Text>
            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>Reorder Last Order</Text>
              <Text style={styles.quickSub}>Same items, one tap</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  card: {
    width: 165,
    backgroundColor: '#15151A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: '#6E6E73',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15151A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  quickEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  quickText: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickSub: {
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#6E6E73',
  },
});
