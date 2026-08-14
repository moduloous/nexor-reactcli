import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, StatusBar, Image } from 'react-native';
import { CustomLoader } from '../components/CustomLoader';
import { Text } from '../components/Text';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function OrdersScreen() {
  const localOrders = useAppStore((state) => state.orders);
  const user = useAppStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const emailToUse = user?.email || "user@example.com";

    const fetchOrders = async () => {
      const startTime = Date.now();
      try {
        const { data, error } = await supabase
          .from('medicine_orders')
          .select('*')
          .eq('user_email', emailToUse)
          .order('created_at', { ascending: false });
          
        if (data && !error) {
          setLiveOrders(data);
        }
      } catch (err) {
        console.warn('Error fetching live orders:', err);
      } finally {
        const elapsed = Date.now() - startTime;
        if (elapsed < 500) {
          await new Promise(resolve => setTimeout(() => resolve(undefined), 500 - elapsed));
        }
        setLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to realtime updates for this user's orders
    const channel = supabase
      .channel('public:medicine_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medicine_orders',
          filter: `user_email=eq.${emailToUse}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLiveOrders((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLiveOrders((prev) =>
              prev.map((order) => (order.id === payload.new.id ? payload.new : order))
            );
          } else if (payload.eventType === 'DELETE') {
            setLiveOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase() || 'PENDING';
    switch (s) {
      case 'DELIVERED':
      case 'COMPLETED':
        return { bg: '#E8F5E9', text: '#2E7D32', icon: 'check-circle' };
      case 'OUT_FOR_DELIVERY':
        return { bg: '#E3F2FD', text: '#1565C0', icon: 'truck' };
      case 'PACKED':
      case 'PREPARING':
        return { bg: '#FFF3E0', text: '#E65100', icon: 'package' };
      case 'CANCELLED':
        return { bg: '#FFEBEE', text: '#C62828', icon: 'x-circle' };
      default: // PENDING, ACCEPTED, PROCESSING
        return { bg: '#FFF8E1', text: '#F57F17', icon: 'clock' };
    }
  };

  const renderOrder = ({ item, index }: any) => {
    const formattedDate = new Date(item.created_at || item.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const items = item.items || [];
    const total = item.total_amount || item.total || 0;
    const statusInfo = getStatusColor(item.status);
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(500)} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.idContainer}>
            <Text style={styles.orderId}>Order #{item.id.substring(0, 8).toUpperCase()}</Text>
            {item.created_at && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Feather name={statusInfo.icon} size={12} color={statusInfo.text} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>{item.status || 'PENDING'}</Text>
          </View>
        </View>
        <Text style={styles.orderDate}>{formattedDate}</Text>
        
        <View style={styles.itemsList}>
          {items.map((cartItem: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{cartItem.quantity}x</Text>
              <Text style={styles.itemText} numberOfLines={1}>{cartItem.name}</Text>
              <Text style={styles.itemPrice}>₹{(cartItem.price * cartItem.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.orderTotal}>₹{total.toFixed(2)}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['ACCEPTED', 'RIDER_AT_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(item.status) && (
              <TouchableOpacity
                style={[styles.reorderBtn, { backgroundColor: '#34C759' }]}
                onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
              >
                <Feather name="map-pin" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.reorderText}>Track</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.reorderBtn}>
              <Feather name="refresh-cw" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Combine live orders with local orders (preferring live orders)
  // We use the ID to deduplicate, but since IDs might differ, we just show liveOrders if available, 
  // and append any local orders that aren't in liveOrders (based on date proximity or just display both for now)
  const displayOrders = liveOrders.length > 0 ? liveOrders : localOrders;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F8FC" />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <CustomLoader size={40} />
          <Text style={styles.loaderText}>Syncing orders...</Text>
        </View>
      ) : displayOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
            <Image 
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/home%20icons/order.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJob21lIGljb25zL29yZGVyLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODY0NTY0NTYsImV4cCI6MTgxNzk5MjQ1Nn0.QLfgiKvZ7R7Eo-Hvav5EIiw8dlwDTZ1m4GJRwOJx_Xs' }} 
              style={{ width: 80, height: 80, marginBottom: 20 }} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>No Orders Yet</Text>
            <Text style={styles.subtitle}>
              Your active and past orders will appear here.
            </Text>
          </Animated.View>
        </View>
      ) : (
        <FlatList
          data={displayOrders}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F8FC',
  },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    backgroundColor: '#F9F8FC',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A24',
    letterSpacing: -0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6E6E73',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A24',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D32F2F',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D32F2F',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: 13,
    color: '#8E8B99',
    marginBottom: 16,
    fontWeight: '500',
  },
  itemsList: {
    marginBottom: 16,
    backgroundColor: '#F9F8FC',
    borderRadius: 12,
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
    width: 28,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#4A4A52',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  totalLabel: {
    fontSize: 12,
    color: '#8E8B99',
    fontWeight: '600',
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A24',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#1A1A24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  reorderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

