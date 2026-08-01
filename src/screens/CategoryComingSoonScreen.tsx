import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text } from '../components/Text';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryComingSoonScreen({ route, navigation }: any) {
  const { category } = route.params || {};
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1A1A24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{category} medicines coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A24',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A24',
    textAlign: 'center',
  },
});
