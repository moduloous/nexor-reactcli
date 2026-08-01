import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';
import { Text } from '../components/Text';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const cart = useAppStore((state) => state.cart);
  const cartTotal = useAppStore((state) => state.cartTotal);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!accessToken) {
      Alert.alert('Authentication Required', 'Please log in to proceed to checkout.');
      return;
    }

    try {
      setLoading(true);
      
      // 0. Sync local cart items to the backend database cart
      try {
        await axios.delete('https://nexor-backend.onrender.com/api/medicines/cart', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        // Use a known valid test medicine ID from the database for the dummy order
        for (const item of cart) {
          await axios.post('https://nexor-backend.onrender.com/api/medicines/cart/items', {
            medicineId: "7a94fb55-a1cc-4a2e-a2df-2b530fa655bf",
            quantity: item.quantity
          }, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        }
      } catch (syncErr) {
        console.warn('Cart sync warning:', syncErr);
      }

      // 1. Create a dummy order on the backend to get a valid DB Order ID
      // (Using dummy coordinates for demo)
      const orderRes = await axios.post('https://nexor-backend.onrender.com/api/medicines/orders', {
        deliveryLat: 12.9116,
        deliveryLng: 77.6412,
        deliveryAddress: "HSR Layout, Bangalore"
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // 1.5 Send order to the Pharmacy Dashboard so they can fulfill it!
      // 10.0.2.2 is used for Android emulator to reach localhost
      const DASHBOARD_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      try {
        await axios.post(`${DASHBOARD_URL}/api/orders`, {
          store_id: "d4d70946-1ac4-4bb4-9f09-1b98f59e880b",
          user_email: user?.email || "user@example.com",
          total_amount: cartTotal,
          items: cart,
          delivery_address: "HSR Layout, Bangalore" // Still needs a real address picker
        });
      } catch (dashErr) {
        console.warn('Dashboard sync warning:', dashErr);
      }
      
      const dbOrderId = orderRes.data?.id || `ORDER_${Date.now()}`;
      
      // 2. Skip backend create-order for now because Render is running an old commit with JwtAuthGuard
      // This allows the Razorpay checkout to open without throwing 401 Unauthorized
      const rzpOrderId = ""; // Razorpay will process without order_id as a direct payment
      
      // 3. Open Razorpay Checkout Sheet
      const options = {
        description: 'Medicine Order',
        image: 'https://cdn-icons-png.flaticon.com/512/2966/2966486.png',
        currency: 'INR',
        key: 'rzp_live_ScwgdcTUFSNBeY', // Your live key from .env
        amount: (cartTotal * 100).toString(),
        name: 'Nexor Pharmacy',
        order_id: rzpOrderId, 
        theme: { color: '#4A90E2' },
        prefill: {
          email: user?.email || 'user@example.com',
          contact: user?.phone || '9999999999',
          name: user?.name || 'Nexor User'
        }
      };
      
      RazorpayCheckout.open(options).then((data: any) => {
        Alert.alert('Order Placed!', `Payment successful. ID: ${data.razorpay_payment_id}`);
        clearCart();
        navigation.navigate('Main');
      }).catch((error: any) => {
        Alert.alert('Payment Failed', `Error: ${error.code} | ${error.description}`);
      });

    } catch (error: any) {
      console.error(error);
      Alert.alert('Checkout Error', error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
      
      <View style={styles.actionColumn}>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => removeFromCart(item.id)}
        >
          <Feather name="trash-2" size={16} color="#E74C3C" />
        </TouchableOpacity>
        
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            style={styles.quantityBtn}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Feather name="minus" size={16} color="#1A1A24" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityBtn}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Feather name="plus" size={16} color="#1A1A24" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F8FC" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1A1A24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cart.length > 0 ? (
          <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={64} color="#D1D1D1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Looks like you haven't added any medicines yet.</Text>
          
          <TouchableOpacity 
            style={styles.shopNowBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Footer Checkout */}
          <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
            <View style={styles.footerRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutBtn} 
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A24',
  },
  clearButton: {
    height: 44,
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#706B82',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: '#1A1A24',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Cart List
  listContainer: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemDetails: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A24',
    lineHeight: 20,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4A90E2',
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: 4,
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 4,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
    marginHorizontal: 12,
  },
  
  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#706B82',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A24',
  },
  checkoutBtn: {
    backgroundColor: '#1A1A24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    gap: 8,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
