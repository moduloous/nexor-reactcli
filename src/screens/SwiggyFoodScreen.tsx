/**
 * SwiggyFoodScreen
 *
 * Food delivery experience powered by Swiggy MCP.
 * Shows saved addresses → restaurants list → tapping opens menu.
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

export default function SwiggyFoodScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      loadRestaurants(selectedAddress.id, query);
    }
  }, [selectedAddress]);

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
        await loadRestaurants(addrList[0].id, '');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadRestaurants(addressId: string, q: string) {
    try {
      setError(null);
      const result = await searchSwiggyRestaurants(addressId, q);
      const list: any[] = result?.content?.[0]?.text
        ? JSON.parse(result.content[0].text)
        : result?.restaurants ?? result?.data ?? [];
      setRestaurants(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load restaurants');
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (selectedAddress) {
      loadRestaurants(selectedAddress.id, text);
    }
  };

  function renderRestaurant({ item }: { item: any }) {
    const name = item.name ?? item.restaurantName ?? item.title ?? 'Restaurant';
    const cuisine = Array.isArray(item.cuisines) ? item.cuisines.join(', ') : (item.cuisine ?? '');
    const rating = item.avgRating ?? item.rating ?? '';
    const eta = item.deliveryTime ?? item.eta ?? '';
    const img = item.cloudinaryImageId
      ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${item.cloudinaryImageId}`
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('SwiggyRestaurant', {
            restaurantId: item.id ?? item.restaurantId,
            name,
          })
        }
      >
        {img ? (
          <Image source={{ uri: img }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={{ fontSize: 36 }}>🍽️</Text>
          </View>
        )}

        {/* Rating badge */}
        {!!rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {rating}</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
          <Text style={styles.cardCuisine} numberOfLines={1}>{cuisine}</Text>
          <View style={styles.cardMeta}>
            {!!eta && (
              <View style={styles.metaPill}>
                <Feather name="clock" size={11} color={ORANGE} />
                <Text style={styles.metaText}>{eta} min</Text>
              </View>
            )}
          </View>
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
          <Text style={styles.headerTitle}>Food Delivery</Text>
          <View style={styles.poweredPill}>
            <View style={styles.dot} />
            <Text style={styles.poweredText}>Powered by Swiggy</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Address selector */}
      {addresses.length > 0 && (
        <View style={styles.addressBar}>
          <Feather name="map-pin" size={14} color={ORANGE} />
          <Text style={styles.addressText} numberOfLines={1}>
            {selectedAddress?.addressLine1 ?? selectedAddress?.flatNo ?? selectedAddress?.title ?? 'Your Location'}
          </Text>
          <Feather name="chevron-down" size={14} color="#999" />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color="#999" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants or cuisine…"
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

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Fetching nearby restaurants…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : restaurants.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>🍽️</Text>
          <Text style={styles.errorText}>No restaurants found nearby</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item, i) => String(item.id ?? item.restaurantId ?? i)}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEF6',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F5F8', alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A24' },
  poweredPill: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 3, backgroundColor: '#FFF2EC',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE, marginRight: 5 },
  poweredText: { fontSize: 10, fontWeight: '700', color: ORANGE },
  addressBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0EEF6',
    gap: 6,
  },
  addressText: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginVertical: 12,
    backgroundColor: '#FFF', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#EEE',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A24' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 14 },
  card: {
    width: CARD_W, backgroundColor: '#FFF', borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardImage: { width: '100%', height: 110 },
  cardImagePlaceholder: {
    backgroundColor: '#FFF2EC', alignItems: 'center', justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  ratingText: { fontSize: 10, color: '#FFF', fontWeight: '700' },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '700', color: '#1A1A24', marginBottom: 2 },
  cardCuisine: { fontSize: 11, color: '#999', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFF2EC', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  metaText: { fontSize: 10, color: ORANGE, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loadingText: { marginTop: 14, fontSize: 14, color: '#999' },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  retryBtn: {
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, backgroundColor: ORANGE,
  },
  retryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
