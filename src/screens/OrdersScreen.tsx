import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '../components/Text';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
        <Text style={styles.emoji}>📦</Text>
        <Text style={styles.title}>No Orders Yet</Text>
        <Text style={styles.subtitle}>
          Your order history will appear here
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 20,
  },
});
