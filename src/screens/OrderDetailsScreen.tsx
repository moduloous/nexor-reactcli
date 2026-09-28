import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from '../components/Text';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import Video from 'react-native-video';

export default function OrderDetailsScreen({ route, navigation }: any) {
  const { order } = route.params;
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);

  const rawDate = order.createdAt || order.created_at || order.date;
  const dateObj = rawDate ? new Date(rawDate) : new Date();
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const items = order.items || [];
  const total = order.total_amount || order.total || 0;
  const subtotal = order.subtotal || total;
  const deliveryFee = order.deliveryFee || 0;
  const deliveryAddress = order.deliveryAddress || 'Address not available';

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
      default:
        return { bg: '#FFF8E1', text: '#F57F17', icon: 'clock' };
    }
  };

  const statusInfo = getStatusColor(order.status);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F8FC" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1A1A24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        
        {/* Order Status & ID */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{order.id.substring(0, 8).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Feather name={statusInfo.icon} size={14} color={statusInfo.text} style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: statusInfo.text }]}>{order.status || 'PENDING'}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>Placed on {formattedDate}</Text>
        </View>

        {/* Animation Video */}
        <View style={styles.deliveryVideoContainer}>
          <Video 
            source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/loader/PjvqI4v87p16Hj6133.mp4?token=eyJraWQiOiI3NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2FkZXIvUGp2cUk0djg3cDE2SGo2MTMzLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTAzNDg1NzcsImV4cCI6MTgyMTg4NDU3N30.xtd5fQqLHZCHDZYeE7uhAUBRKzWJc4e53BhO6TNWkq0' }}
            style={styles.deliveryVideo}
            resizeMode="contain"
            repeat={true}
            muted={true}
          />
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.detailRow}>
            <Feather name="user" size={16} color="#706B82" style={styles.detailIcon} />
            <Text style={styles.detailText}>{user?.name || 'Customer'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="phone" size={16} color="#706B82" style={styles.detailIcon} />
            <Text style={styles.detailText}>{user?.phone || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color="#706B82" style={styles.detailIcon} />
            <Text style={styles.detailText}>{deliveryAddress}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {items.map((cartItem: any, idx: number) => {
            const name = cartItem.name || cartItem.medicine?.name || 'Unknown Item';
            const price = cartItem.price || cartItem.unitPrice || 0;
            return (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemQuantity}>{cartItem.quantity}x</Text>
                  <Text style={styles.itemText} numberOfLines={2}>{name}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{(price * cartItem.quantity).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: '#F9F8FC',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A24',
  },
  content: {
    padding: 20,
  },
  section: {
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
  lastSection: {
    marginBottom: 32,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A24',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8B99',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#4A4A52',
    lineHeight: 20,
  },
  deliveryVideoContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryVideo: {
    width: '100%',
    height: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 16,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
    width: 32,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#4A4A52',
    fontWeight: '500',
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#706B82',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A24',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1A1A24',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    color: '#1A1A24',
    fontWeight: '800',
  },
});
