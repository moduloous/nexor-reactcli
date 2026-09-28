import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';
import { useAppStore } from '../store/useAppStore';
import { CustomLoader } from '../components/CustomLoader';

export default function OrderTrackingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { orderId } = route.params || {};
  const token = useAppStore(state => state.accessToken);

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const baseUrl = 'https://nexor-backend.onrender.com/api';
        const res = await fetch(`${baseUrl}/medicines/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch order');
        const json = await res.json();
        const data = json.data || json;
        
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order', err);
      }
    };
    if (orderId && token) fetchOrder();
  }, [orderId, token]);

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoader size={40} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.videoContainer}>
          <Video 
            source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/loader/PjvqI4v87p16Hj6133.mp4?token=eyJraWQiOiI3NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2FkZXIvUGp2cUk0djg3cDE2SGo2MTMzLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTAzNDg1NzcsImV4cCI6MTgyMTg4NDU3N30.xtd5fQqLHZCHDZYeE7uhAUBRKzWJc4e53BhO6TNWkq0' }}
            style={styles.video}
            resizeMode="cover"
            repeat={true}
            muted={true}
          />
        </View>
        <Text style={styles.title}>Your Order is on the Way!</Text>
        <Text style={styles.subtitle}>
          Our delivery partner is currently en route with your items. 
          Please keep your phone handy!
        </Text>

        <View style={styles.statusCard}>
          <Icon name="package" size={24} color="#6C63FF" />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Order Status</Text>
            <Text style={styles.statusValue}>{order.status || 'OUT FOR DELIVERY'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A24' },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  videoContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    backgroundColor: '#F9F8FC',
    marginBottom: 40,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A24',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#706B82',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8FC',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  statusTextContainer: {
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 13,
    color: '#706B82',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A24',
  }
});
