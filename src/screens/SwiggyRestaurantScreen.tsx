/**
 * SwiggyRestaurantScreen
 *
 * Shows the menu for a selected restaurant/store, lets the user
 * add items to cart, and place a Swiggy order — all via the MCP backend.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {
  getRestaurantMenu,
  updateSwiggyCart,
  placeSwiggyOrder,
} from '../api/swiggy.api';

const { width } = Dimensions.get('window');
const ORANGE = '#FF5200';

type CartItem = { itemId: string; name: string; price: number; quantity: number };

export default function SwiggyRestaurantScreen({ route, navigation }: any) {
  const { restaurantId, name, mode } = route.params ?? {};
  const insets = useSafeAreaInsets();

  const [sections, setSections] = useState<{ title: string; data: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [placing, setPlacing] = useState(false);

  // Cart bar slide animation
  const cartBarAnim = useRef(new Animated.Value(120)).current;

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    Animated.spring(cartBarAnim, {
      toValue: cartCount > 0 ? 0 : 120,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [cartCount]);

  async function loadMenu() {
    try {
      setLoading(true);
      setError(null);
      const result = await getRestaurantMenu(restaurantId);

      // Parse MCP tool response
      const raw = result?.content?.[0]?.text
        ? JSON.parse(result.content[0].text)
        : result;

      // Normalise into sections
      let built: { title: string; data: any[] }[] = [];

      if (Array.isArray(raw?.categories)) {
        built = raw.categories.map((cat: any) => ({
          title: cat.name ?? cat.title ?? 'Menu',
          data: cat.items ?? cat.dishes ?? [],
        }));
      } else if (Array.isArray(raw?.items)) {
        built = [{ title: 'Menu', data: raw.items }];
      } else if (Array.isArray(raw)) {
        built = [{ title: 'Menu', data: raw }];
      }

      setSections(built.filter((s) => s.data.length > 0));
    } catch (e: any) {
      setError(e.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  function getQty(itemId: string) {
    return cart.find((i) => i.itemId === itemId)?.quantity ?? 0;
  }

  function addItem(item: any) {
    const itemId = String(item.id ?? item.itemId ?? item.name);
    const price = parseFloat(item.price ?? item.defaultPrice ?? 0);
    const itemName = item.name ?? item.itemName ?? 'Item';

    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === itemId);
      if (existing) {
        return prev.map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { itemId, name: itemName, price, quantity: 1 }];
    });
  }

  function removeItem(itemId: string) {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((i) => i.itemId !== itemId);
      return prev.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i,
      );
    });
  }

  async function handlePlaceOrder() {
    if (cart.length === 0) return;

    Alert.alert(
      'Confirm Order',
      `Place order for ₹${cartTotal.toFixed(0)} from ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          style: 'default',
          onPress: async () => {
            try {
              setPlacing(true);

              // Sync cart to backend
              await updateSwiggyCart(
                restaurantId,
                cart.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
              );

              // Place the order
              const result = await placeSwiggyOrder('COD');

              const orderId =
                result?.content?.[0]?.text
                  ? JSON.parse(result.content[0].text)?.orderId
                  : result?.orderId ?? result?.data?.orderId;

              Alert.alert('🎉 Order Placed!', `Your order from ${name} has been placed successfully.`, [
                {
                  text: 'Track Order',
                  onPress: () => {
                    navigation.navigate('OrderTracking', { orderId, source: 'swiggy' });
                  },
                },
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert('Order Failed', e.message || 'Could not place order. Please try again.');
            } finally {
              setPlacing(false);
            }
          },
        },
      ],
    );
  }

  function renderItem({ item }: { item: any }) {
    const itemId = String(item.id ?? item.itemId ?? item.name);
    const itemName = item.name ?? item.itemName ?? 'Item';
    const desc = item.description ?? item.itemDesc ?? '';
    const price = parseFloat(item.price ?? item.defaultPrice ?? 0);
    const img = item.imageId
      ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${item.imageId}`
      : null;
    const isVeg = item.itemAttribute?.vegClassifier === 'VEG' || item.isVeg === true;
    const qty = getQty(itemId);

    return (
      <View style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          {/* Veg/Non-veg dot */}
          <View style={[styles.vegDot, { borderColor: isVeg ? '#0f8a00' : '#e43b4f' }]}>
            <View style={[styles.vegDotInner, { backgroundColor: isVeg ? '#0f8a00' : '#e43b4f' }]} />
          </View>
          <Text style={styles.menuItemName}>{itemName}</Text>
          {!!desc && (
            <Text style={styles.menuItemDesc} numberOfLines={2}>{desc}</Text>
          )}
          <Text style={styles.menuItemPrice}>
            {price > 0 ? `₹${price.toFixed(0)}` : 'Price on request'}
          </Text>
        </View>

        {/* Image + quantity controls */}
        <View style={styles.menuItemRight}>
          {img ? (
            <Image source={{ uri: img }} style={styles.menuItemImg} resizeMode="cover" />
          ) : (
            <View style={[styles.menuItemImg, styles.menuItemImgPlaceholder]}>
              <Text style={{ fontSize: 28 }}>{mode === 'grocery' ? '🛒' : '🍽️'}</Text>
            </View>
          )}

          {qty === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}>
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(itemId)}>
                <Feather name="minus" size={14} color={ORANGE} />
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem(item)}>
                <Feather name="plus" size={14} color={ORANGE} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#1A1A24" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
          <View style={styles.poweredPill}>
            <View style={styles.dot} />
            <Text style={styles.poweredText}>Powered by Swiggy</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Menu */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading menu…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadMenu}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>🍽️</Text>
          <Text style={styles.errorText}>Menu not available right now</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, i) => String(item.id ?? item.itemId ?? i)}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={[styles.list, { paddingBottom: cartCount > 0 ? 140 : 100 }]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
        />
      )}

      {/* Sticky Cart Bar */}
      <Animated.View
        style={[
          styles.cartBar,
          { bottom: insets.bottom + 16, transform: [{ translateY: cartBarAnim }] },
        ]}
      >
        <View style={styles.cartBarLeft}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
          <View>
            <Text style={styles.cartBarItems}>
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.cartBarTotal}>₹{cartTotal.toFixed(0)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Feather name="arrow-right" size={16} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0EEF6',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F5F8', alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A24', maxWidth: width * 0.55 },
  poweredPill: {
    flexDirection: 'row', alignItems: 'center', marginTop: 3,
    backgroundColor: '#FFF2EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE, marginRight: 5 },
  poweredText: { fontSize: 10, fontWeight: '700', color: ORANGE },

  // Section
  sectionHeader: {
    backgroundColor: '#F5F3FA', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#ECEAF2',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A24', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Menu item
  list: { paddingHorizontal: 0 },
  menuItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F5F3FA',
  },
  menuItemLeft: { flex: 1, paddingRight: 12 },
  vegDot: {
    width: 16, height: 16, borderRadius: 3, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  vegDotInner: { width: 8, height: 8, borderRadius: 4 },
  menuItemName: { fontSize: 14, fontWeight: '600', color: '#1A1A24', marginBottom: 4 },
  menuItemDesc: { fontSize: 12, color: '#999', lineHeight: 17, marginBottom: 6 },
  menuItemPrice: { fontSize: 14, fontWeight: '700', color: '#1A1A24' },
  menuItemRight: { alignItems: 'center', width: 96 },
  menuItemImg: { width: 90, height: 80, borderRadius: 10, marginBottom: 8 },
  menuItemImgPlaceholder: {
    backgroundColor: '#FFF2EC', alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    borderWidth: 1.5, borderColor: ORANGE, borderRadius: 8,
    paddingHorizontal: 18, paddingVertical: 6, backgroundColor: '#FFF',
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: ORANGE },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: ORANGE, borderRadius: 8, overflow: 'hidden',
  },
  qtyBtn: {
    width: 30, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF2EC',
  },
  qtyNum: { width: 28, textAlign: 'center', fontSize: 14, fontWeight: '700', color: ORANGE },

  // States
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loadingText: { marginTop: 14, fontSize: 14, color: '#999' },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  retryBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, backgroundColor: ORANGE },
  retryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Cart bar
  cartBar: {
    position: 'absolute', left: 16, right: 16,
    backgroundColor: '#1A1A24', borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: ORANGE,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  cartBarItems: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 1 },
  cartBarTotal: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  placeOrderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: ORANGE, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
  },
  placeOrderText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
