import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '../components/Text';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import Animated, { FadeInUp } from 'react-native-reanimated';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const DELIVERY_INSTRUCTIONS = [
  { id: 'security', label: 'Leave near security', icon: 'shield' },
  { id: 'nocall', label: 'Do not call', icon: 'phone-off' },
  { id: 'nobell', label: 'Do not ring the bell', icon: 'bell-off' },
];

export default function PrescriptionOrderScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);
  
  // Prescription Form State
  const [notes, setNotes] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [prescriptionBase64, setPrescriptionBase64] = useState('');
  const [loading, setLoading] = useState(false);

  // Checkout Modal State
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [houseAddress, setHouseAddress] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instruction, setInstruction] = useState('');

  const handleUploadClick = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true, maxWidth: 800, maxHeight: 800, quality: 0.7 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        useAppStore.getState().showAlert('Error', response.errorMessage || 'Failed to open gallery');
      } else if (response.assets && response.assets.length > 0) {
        setPrescriptionUploaded(true);
        if (response.assets[0].base64) {
          const mimeType = response.assets[0].type || 'image/jpeg';
          setPrescriptionBase64(`data:${mimeType};base64,${response.assets[0].base64}`);
        }
      }
    });
  };

  const handleCallFromStore = async () => {
    if (!prescriptionUploaded) {
      useAppStore.getState().showAlert('Missing Prescription', 'Please upload your prescription first.');
      return;
    }
    if (!contactNumber.trim()) {
      useAppStore.getState().showAlert('Missing Contact', 'Please provide a contact number so the store can call you.');
      return;
    }

    try {
      setLoading(true);
      const DASHBOARD_URL = 'https://pharmacy-orders.netlify.app';
      await axios.post(`${DASHBOARD_URL}/api/orders`, {
        store_id: "d4d70946-1ac4-4bb4-9f09-1b98f59e880b",
        user_email: user?.email || "user@example.com",
        total_amount: 0,
        status: "PENDING", // Pharmacy will review and call
        items: [{ id: 'rx', name: 'Prescription Order', price: 0, quantity: 1, module: 'medicine' }],
        delivery_address: `Call requested at: ${contactNumber} | Notes: ${notes || 'None'}`,
        prescription_url: prescriptionBase64 || "https://example.com/mock-prescription.jpg"
      });
      
      useAppStore.getState().showAlert('Success', 'Your request has successfully sent.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      useAppStore.getState().showAlert('Error', 'Failed to send your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = () => {
    if (!prescriptionUploaded) {
      useAppStore.getState().showAlert('Missing Prescription', 'Please upload your prescription first.');
      return;
    }
    setShowCheckoutForm(true);
  };

  const validateAndSubmitOrder = async () => {
    if (!fullName.trim() || !contactNumber.trim() || !houseAddress.trim() || !flatNo.trim()) {
      useAppStore.getState().showAlert('Missing Details', 'Please fill in all required fields (Name, Phone, Address, Flat No).');
      return;
    }

    try {
      setLoading(true);
      const fullDeliveryAddress = `${flatNo}, ${houseAddress}${landmark ? `, Near ${landmark}` : ''} | Instructions: ${instruction || 'None'} | Notes: ${notes}`;
      
      const DASHBOARD_URL = 'https://pharmacy-orders.netlify.app';
      await axios.post(`${DASHBOARD_URL}/api/orders`, {
        store_id: "d4d70946-1ac4-4bb4-9f09-1b98f59e880b",
        user_email: user?.email || "user@example.com",
        total_amount: 0, // Price to be decided by pharmacy
        status: "PENDING",
        items: [{ id: 'rx', name: 'Prescription Order', price: 0, quantity: 1, module: 'medicine' }],
        delivery_address: fullDeliveryAddress,
        prescription_url: prescriptionBase64 || "https://example.com/mock-prescription.jpg"
      });

      setShowCheckoutForm(false);
      useAppStore.getState().showAlert('Order Placed!', 'The pharmacy will review your prescription and update the final amount. You can check your Orders section for live updates.', [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (error) {
      useAppStore.getState().showAlert('Error', 'Failed to place the order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F8FC" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1A1A24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order via Prescription</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Upload Box */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <TouchableOpacity 
            style={[styles.uploadBox, prescriptionUploaded && styles.uploadBoxSuccess]} 
            onPress={handleUploadClick}
          >
            <View style={[styles.iconCircle, prescriptionUploaded && styles.iconCircleSuccess]}>
              <Feather name={prescriptionUploaded ? "check" : "upload-cloud"} size={28} color={prescriptionUploaded ? "#2E7D32" : "#4A90E2"} />
            </View>
            <Text style={styles.uploadTitle}>
              {prescriptionUploaded ? "Prescription Uploaded!" : "Upload Prescription"}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {prescriptionUploaded ? "Tap to change image" : "Tap here to upload image or PDF"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.inputSection}>
          <Text style={styles.inputLabel}>Quantity / Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., I need 2 strips of the first medicine, substitute generic brands if needed..."
            placeholderTextColor="#A09CAB"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.inputSection}>
          <Text style={styles.inputLabel}>Contact Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            placeholderTextColor="#A09CAB"
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity 
          style={styles.callStoreBtn} 
          onPress={handleCallFromStore}
          disabled={loading}
        >
          <Feather name="phone-call" size={18} color="#1A1A24" />
          <Text style={styles.callStoreText}>Get a call from store</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.completeBtn} 
          onPress={handleCompleteOrder}
          disabled={loading}
        >
          <Text style={styles.completeText}>Complete the order</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Checkout Address Modal */}
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
                <Text style={styles.modalInputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A09CAB"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.modalInputLabel}>Flat No. / Floor *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 402"
                    placeholderTextColor="#A09CAB"
                    value={flatNo}
                    onChangeText={setFlatNo}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.modalInputLabel}>Landmark</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Near Apollo"
                    placeholderTextColor="#A09CAB"
                    value={landmark}
                    onChangeText={setLandmark}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalInputLabel}>House/Building Address *</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80, paddingTop: 16 }]}
                  placeholder="Enter full street address"
                  placeholderTextColor="#A09CAB"
                  multiline
                  value={houseAddress}
                  onChangeText={setHouseAddress}
                />
              </View>

              <View style={styles.instructionsSection}>
                <Text style={styles.modalInputLabel}>Special Delivery Instructions</Text>
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
                onPress={validateAndSubmitOrder}
                disabled={loading}
              >
                <Text style={styles.completeText}>Confirm Delivery Details</Text>
                <Feather name="check-circle" size={18} color="#FFFFFF" />
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
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A24',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EAE8F0',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadBoxSuccess: {
    borderColor: '#81C784',
    backgroundColor: '#F1F8E9',
    borderStyle: 'solid',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSuccess: {
    backgroundColor: '#E8F5E9',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#706B82',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 10,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A24',
    borderWidth: 1,
    borderColor: '#EAE8F0',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 15,
    gap: 12,
  },
  callStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F8',
    gap: 8,
  },
  callStoreText: {
    color: '#1A1A24',
    fontSize: 16,
    fontWeight: '700',
  },
  completeBtn: {
    backgroundColor: '#1A1A24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    gap: 8,
  },
  completeText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
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
