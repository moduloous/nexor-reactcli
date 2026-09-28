/**
 * SwiggyGroceryScreen
 *
 * Grocery / Instamart experience powered by Swiggy MCP.
 * Reuses the same address + search infrastructure as food delivery
 * but presents a grocery-focused UI.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getSwiggyAddresses, searchSwiggyRestaurants } from '../api/swiggy.api';

const { width } = Dimensions.get('window');
const ORANGE = '#FF5200';
const GREEN = '#00A676';

// Grocery category quick-filters
const FILTERS = [
  { id: '', label: '🛒 All' },
  { id: 'fruits', label: '🍎 Fruits' },
  { id: 'vegetables', label: '🥦 Vegetables' },
  { id: 'dairy', label: '🥛 Dairy' },
  { id: 'snacks', label: '🍿 Snacks' },
  { id: 'beverages', label: '🧃 Beverages' },
];

export default function SwiggyGroceryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (selectedAddress) loadStores(selectedAddress.id, activeFilter || query);
  }, [selectedAddress, activeFilter]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const addrResult = await getSwiggyAddresses();
      const addrList: any[] = addrResult?.content?.[0]?.text
        ? JSON.parse(addrResult.content[0].text)
        : addrResult?.addresses ?? addrResult?.data ?? [];
      setAddresses(addrList);
      if (addrList.length > 0) {
        setSelectedAddress(addrList[0]);
        await loadStores(addrList[0].id, '');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadStores(addressId: string, q: string) {
    try {
      setError(null);
      // Instamart query — append 'instamart' or 'grocery' to narrow results
      const searchQ = q ? `${q} grocery` : 'grocery instamart';
      const result = await searchSwiggyRestaurants(addressId, searchQ);
      const list: any[] = result?.content?.[0]?.text
        ? JSON.parse(result.content[0].text)
        : result?.restaurants ?? result?.data ?? [];
      setStores(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load stores');
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  function handleSearch(text: string) {
    setQuery(text);
    if (selectedAddress) loadStores(selectedAddress.id, text);
  }

  function handleFilter(filterId: string) {
    setActiveFilter(filterId);
    if (selectedAddress) loadStores(selectedAddress.id, filterId);
  }

  function renderStore({ item }: { item: any }) {
    const name = item.name ?? item.restaurantName ?? 'Store';
    const eta = item.deliveryTime ?? item.eta ?? '';
    const img = item.cloudinaryImageId
      ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${item.cloudinaryImageId}`
      : null;

    return (
      <TouchableOpacity
        style={styles.storeCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('SwiggyRestaurant', {
            restaurantId: item.id ?? item.restaurantId,
            name,
            mode: 'grocery',
          })
        }
      >
        {img ? (
          <Image source={{ uri: img }} style={styles.storeImage} resizeMode="cover" />
        ) : (
          <View style={[styles.storeImage, styles.storeImagePlaceholder]}>
            <Text style={{ fontSize: 40 }}>🛒</Text>
          </View>
        )}

        {!!eta && (
          <View style={styles.etaBadge}>
            <Feather name="zap" size={10} color="#FFF" />
            <Text style={styles.etaText}>{eta} min</Text>
          </View>
        )}

        <View style={styles.storeBody}>
          <Text style={styles.storeName} numberOfLines={1}>{name}</Text>
          <Text style={styles.storeTag}>Instamart · Express Delivery</Text>
        </View>
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Grocery</Text>
          <View style={styles.poweredPill}>
            <View style={styles.dot} />
            <Text style={styles.poweredText}>Powered by Swiggy Instamart</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Address */}
      {addresses.length > 0 && (
        <View style={styles.addressBar}>
          <Feather name="map-pin" size={13} color={ORANGE} />
          <Text style={styles.addressText} numberOfLines={1}>
            {selectedAddress?.addressLine1 ?? selectedAddress?.flatNo ?? selectedAddress?.title ?? 'Your Location'}
          </Text>
          <Feather name="chevron-down" size={13} color="#AAA" />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color="#999" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groceries, vegetables, dairy…"
          placeholderTextColor="#BBB"
          value={query}
          onChangeText={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Feather name="x" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === item.id && styles.filterPillActive]}
            onPress={() => handleFilter(item.id)}
          >
            <Text style={[styles.filterText, activeFilter === item.id && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Finding nearby stores…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : stores.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>🛒</Text>
          <Text style={styles.errorText}>No stores found nearby</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item, i) => String(item.id ?? item.restaurantId ?? i)}
          renderItem={renderStore}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.storeRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />}
        />
      )}
    </View>
  );
}

const CARD_W = (width - 52) / 2;

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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A24' },
  poweredPill: {
    flexDirection: 'row', alignItems: 'center', marginTop: 3,
    backgroundColor: '#E8F8F3', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN, marginRight: 5 },
  poweredText: { fontSize: 10, fontWeight: '700', color: GREEN },
  addressBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0EEF6', gap: 6,
  },
  addressText: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    backgroundColor: '#FFF', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#EEE',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A24' },
  filterList: { paddingHorizontal: 16, paddingVertical: 10 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: '#F3F1F8', borderWidth: 1, borderColor: '#E8E4F0',
  },
  filterPillActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  filterText: { fontSize: 12, fontWeight: '600', color: '#555' },
  filterTextActive: { color: '#FFF' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  storeRow: { justifyContent: 'space-between', marginBottom: 14 },
  storeCard: {
    width: CARD_W, backgroundColor: '#FFF', borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  storeImage: { width: '100%', height: 110 },
  storeImagePlaceholder: { backgroundColor: '#E8F8F3', alignItems: 'center', justifyContent: 'center' },
  etaBadge: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3,
  },
  etaText: { fontSize: 10, color: '#FFF', fontWeight: '700' },
  storeBody: { padding: 10 },
  storeName: { fontSize: 13, fontWeight: '700', color: '#1A1A24', marginBottom: 3 },
  storeTag: { fontSize: 10, color: '#999' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loadingText: { marginTop: 14, fontSize: 14, color: '#999' },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  retryBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, backgroundColor: ORANGE },
  retryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
