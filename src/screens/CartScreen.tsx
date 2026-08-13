import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  Alert,
  Platform,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { CustomLoader } from '../components/CustomLoader';
import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';
import { Text } from '../components/Text';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import Animated, { FadeIn, FadeInDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const DELIVERY_INSTRUCTIONS = [
  { id: 'security', label: 'Leave near security', icon: 'shield' },
  { id: 'nocall', label: 'Do not call', icon: 'phone-off' },
  { id: 'nobell', label: 'Do not ring the bell', icon: 'bell-off' },
];

export default function CartScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const cart = useAppStore((state) => state.cart);
  const cartTotal = useAppStore((state) => state.cartTotal);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const addOrder = useAppStore((state) => state.addOrder);
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [houseAddress, setHouseAddress] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instruction, setInstruction] = useState('');

  // Update name and phone if user info loads late
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!phone) setPhone(user.phone || '');
    }
  }, [user]);

  const validateAndProceed = () => {
    if (!fullName.trim() || !phone.trim() || !houseAddress.trim() || !flatNo.trim()) {
      useAppStore.getState().showAlert('Missing Details', 'Please fill in all required fields (Name, Phone, Address, Flat No).');
      return;
    }
    processPayment();
  };

  const processPayment = async () => {
    try {
      setLoading(true);
      
      const fullDeliveryAddress = `${flatNo}, ${houseAddress}${landmark ? `, Near ${landmark}` : ''} | Instructions: ${instruction || 'None'}`;

      // 0. Sync local cart items to the backend database cart
      try {
        await axios.delete('https://nexor-backend.onrender.com/api/medicines/cart', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
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
      const orderRes = await axios.post('https://nexor-backend.onrender.com/api/medicines/orders', {
        deliveryLat: 12.9116,
        deliveryLng: 77.6412,
        deliveryAddress: fullDeliveryAddress
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // 1.5 Send order to the Pharmacy Dashboard so they can fulfill it!
      const DASHBOARD_URL = 'https://pharmacy-orders.netlify.app';
      try {
        await axios.post(`${DASHBOARD_URL}/api/orders`, {
          store_id: "d4d70946-1ac4-4bb4-9f09-1b98f59e880b",
          user_email: user?.email || "user@example.com",
          total_amount: cartTotal,
          items: cart,
          delivery_address: fullDeliveryAddress
        });
      } catch (dashErr) {
        console.warn('Dashboard sync warning:', dashErr);
      }
      
      const dbOrderId = orderRes.data?.id || `ORDER_${Date.now()}`;
      
      const rzpOrderId = ""; 
      
      // 3. Open Razorpay Checkout Sheet
      const options = {
        description: 'Medicine Order',
        image: 'https://cdn-icons-png.flaticon.com/512/2966/2966486.png',
        currency: 'INR',
        key: 'rzp_live_ScwgdcTUFSNBeY', 
        amount: (cartTotal * 100).toString(),
        name: 'Nexor Pharmacy',
        order_id: rzpOrderId, 
        theme: { color: '#1A1A24' },
        prefill: {
          email: user?.email || 'user@example.com',
          contact: phone || '9999999999',
          name: fullName || 'Nexor User'
        }
      };
      
      setShowCheckoutForm(false);
      
      RazorpayCheckout.open(options).then((data: any) => {
        useAppStore.getState().showAlert('Order Placed!', `Payment successful. ID: ${data.razorpay_payment_id}`);
        addOrder({
          id: dbOrderId,
          items: [...cart],
          total: cartTotal,
          date: new Date().toISOString(),
          status: 'Processing',
        });
        clearCart();
        navigation.navigate('Main');
      }).catch((error: any) => {
        setShowCheckoutForm(true); // Re-open if payment fails
        useAppStore.getState().showAlert('Payment Failed', `Error: ${error.code} | ${error.description}`);
      });

    } catch (error: any) {
      console.error(error);
      useAppStore.getState().showAlert('Checkout Error', error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = () => {
    if (!accessToken) {
      useAppStore.getState().showAlert('Authentication Required', 'Please log in to proceed to checkout.');
      return;
    }
    setShowCheckoutForm(true);
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
          <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
            <View style={styles.emptyIconCircle}>
              <Feather name="shopping-bag" size={40} color="#1A1A24" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Looks like you haven't added any medicines yet.</Text>
            
            <TouchableOpacity 
              style={styles.shopNowBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.shopNowText}>Shop Medicines</Text>
            </TouchableOpacity>
          </Animated.View>
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
              onPress={handleOpenCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Checkout Modal Form */}
      <Modal
        visible={showCheckoutForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckoutForm(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Details</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCheckoutForm(false)}>
                <Feather name="x" size={24} color="#1A1A24" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A09CAB"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#A09CAB"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Flat No. / Floor *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 402"
                    placeholderTextColor="#A09CAB"
                    value={flatNo}
                    onChangeText={setFlatNo}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Landmark</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Near Apollo"
                    placeholderTextColor="#A09CAB"
                    value={landmark}
                    onChangeText={setLandmark}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House/Building Address *</Text>
                <TextInput
                  style={[styles.input, { height: 80, paddingTop: 16 }]}
                  placeholder="Enter full street address"
                  placeholderTextColor="#A09CAB"
                  multiline
                  value={houseAddress}
                  onChangeText={setHouseAddress}
                />
              </View>

              <View style={styles.instructionsSection}>
                <Text style={styles.inputLabel}>Special Delivery Instructions</Text>
                <View style={styles.instructionPills}>
                  {DELIVERY_INSTRUCTIONS.map((inst) => {
                    const isSelected = instruction === inst.label;
                    return (
                      <TouchableOpacity
                        key={inst.id}
                        style={[styles.instructionPill, isSelected && styles.instructionPillSelected]}
                        onPress={() => setInstruction(isSelected ? '' : inst.label)}
                      >
                        <Feather 
                          name={inst.icon} 
                          size={16} 
                          color={isSelected ? '#1A1A24' : '#6E6E73'} 
                        />
                        <Text style={[styles.instructionPillText, isSelected && styles.instructionPillTextSelected]}>
                          {inst.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              
              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.payBtn} 
                onPress={validateAndProceed}
                disabled={loading}
              >
                {loading ? (
                  <CustomLoader size={24} />
                ) : (
                  <>
                    <Text style={styles.checkoutText}>Pay ₹{cartTotal.toFixed(2)}</Text>
                    <Feather name="check-circle" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A24',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#706B82',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  shopNowBtn: {
    backgroundColor: '#1A1A24',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#1A1A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  itemDetails: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A24',
    lineHeight: 22,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A90E2',
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8FC',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#EAE8F0',
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A24',
    marginHorizontal: 14,
  },
  
  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    color: '#706B82',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A24',
  },
  checkoutBtn: {
    backgroundColor: '#1A1A24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    gap: 12,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A24',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F5F5F8',
    borderRadius: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F9F8FC',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A24',
    borderWidth: 1,
    borderColor: '#EAE8F0',
  },
  instructionsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  instructionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8FC',
    borderWidth: 1,
    borderColor: '#EAE8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  instructionPillSelected: {
    backgroundColor: '#F5F5F5',
    borderColor: '#1A1A24',
    borderWidth: 2,
  },
  instructionPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E73',
  },
  instructionPillTextSelected: {
    color: '#1A1A24',
    fontWeight: '700',
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    backgroundColor: '#FFFFFF',
  },
  payBtn: {
    backgroundColor: '#1A1A24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    gap: 12,
  },
});

