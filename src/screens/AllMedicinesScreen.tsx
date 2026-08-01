import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

const RECOMMENDED_KEYWORDS = [
  'dolo', 'sinarest', 'polycrol', 'limcee', 'emolene'
];

const isRecommended = (name: string) => {
  if (!name) return false;
  return RECOMMENDED_KEYWORDS.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(name);
  });
};

const CHILDREN_KEYWORDS = [
  'junior', 'kid', 'kids', 'baby', 'infant', 'pediatric', 'pedia'
];

const isForChildren = (name: string) => {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  return CHILDREN_KEYWORDS.some(kw => lowerName.includes(kw));
};

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 90;

const MEDICINE_CATEGORIES = [
  { id: '1', name: 'Tablets', icon: '💊' },
  { id: '2', name: 'Capsules', icon: '💊' },
  { id: '3', name: 'Cream &\nOintment', icon: '🧴' },
  { id: '4', name: 'Syrup', icon: '🍯' },
  { id: '5', name: 'Drops', icon: '💧' },
  { id: '6', name: 'Injection', icon: '💉' },
  { id: '7', name: 'Gel', icon: '🧴' },
  { id: '8', name: 'Powder &\nSachet', icon: '🧂' },
  { id: '9', name: 'Lotion', icon: '🧴' },
  { id: '10', name: 'Suspension', icon: '🧪' },
  { id: '11', name: 'Oral\nSolution', icon: '🧪' },
  { id: '12', name: 'Inhaler', icon: '🌬️' },
  { id: '13', name: 'Medical\nDevice', icon: '🩺' },
];

const SUPPLEMENT_CATEGORIES = [
  { id: 's1', name: 'Vitamins &\nMinerals', icon: '💊', keywords: 'name.ilike.%vitamin%,name.ilike.%zinc%,name.ilike.%iron%,name.ilike.%calcium%,name.ilike.%multivitamin%' },
  { id: 's2', name: 'Immunity', icon: '🛡️', keywords: 'name.ilike.%immun%,name.ilike.%vitamin c%,name.ilike.%amla%,name.ilike.%tulsi%,name.ilike.%ashwagandha%' },
  { id: 's3', name: 'Bone &\nJoint Care', icon: '🦴', keywords: 'name.ilike.%bone%,name.ilike.%joint%,name.ilike.%calcium%,name.ilike.%d3%,name.ilike.%glucosamine%' },
  { id: 's4', name: 'Digestive\nHealth', icon: '🌿', keywords: 'name.ilike.%digest%,name.ilike.%gut%,name.ilike.%probiotic%,name.ilike.%enzyme%,name.ilike.%fiber%,name.ilike.%isabgol%' },
  { id: 's5', name: 'Nutrition\nDrinks', icon: '🥤', keywords: 'name.ilike.%protein%,name.ilike.%drink%,name.ilike.%ensure%,name.ilike.%pediasure%,name.ilike.%horlicks%,name.ilike.%bournvita%,name.ilike.%boost%' },
  { id: 's6', name: 'Heart\nHealth', icon: '❤️', keywords: 'name.ilike.%heart%,name.ilike.%cardio%,name.ilike.%omega%,name.ilike.%fish oil%,name.ilike.%cholesterol%' },
];

const CONDITION_CATEGORIES = [
  { id: '1', name: 'Fever &\nPain', icon: '🤒', keywords: 'name.ilike.%dolo%,name.ilike.%crocin%,name.ilike.%calpol%,name.ilike.%combiflam%,name.ilike.%meftal%,name.ilike.%zerodol%,name.ilike.%brufen%,name.ilike.%paracetamol%,name.ilike.%ibuprofen%' },
  { id: '2', name: 'Cold &\nCough', icon: '🤧', keywords: 'name.ilike.%cough%,name.ilike.%cold%,name.ilike.%cetirizine%,name.ilike.%sinus%,name.ilike.%phensedyl%,name.ilike.%sinarest%' },
  { id: '3', name: 'Digestion', icon: '🍽️', keywords: 'name.ilike.%digestion%,name.ilike.%antacid%,name.ilike.%pantoprazole%,name.ilike.%rabeprazole%,name.ilike.%domperidone%,name.ilike.%polycrol%,name.ilike.%digeraft%' },
  { id: '4', name: 'Heart', icon: '❤️', keywords: 'name.ilike.%heart%,name.ilike.%atorvastatin%,name.ilike.%rosuvastatin%,name.ilike.%atorfit%' },
  { id: '5', name: 'Diabetes', icon: '💉', keywords: 'name.ilike.%diabetes%,name.ilike.%metformin%,name.ilike.%glimepiride%' },
  { id: '6', name: 'Blood\nPressure', icon: '🩺', keywords: 'name.ilike.%blood pressure%,name.ilike.%telmisartan%,name.ilike.%amlodipine%,name.ilike.%cinod%' },
  { id: '7', name: 'Bones &\nJoints', icon: '🦴', keywords: 'name.ilike.%bone%,name.ilike.%joint%,name.ilike.%calcium%,name.ilike.%vitamin d3%,name.ilike.%arachitol%' },
  { id: '8', name: 'Skin Care', icon: '🧴', keywords: 'name.ilike.%skin%,name.ilike.%cream%,name.ilike.%lotion%,name.ilike.%ointment%,name.ilike.%quadriderm%,name.ilike.%crotorax%' },
  { id: '9', name: 'Baby Care', icon: '👶', keywords: 'name.ilike.%baby%,name.ilike.%pediatric%,name.ilike.%pediasure%' },
  { id: '10', name: 'Immunity', icon: '🌿', keywords: 'name.ilike.%immun%,name.ilike.%vitamin c%,name.ilike.%limcee%' },
];

export default function AllMedicinesScreen({ route, navigation }: any) {
  const isSupplements = route?.params?.filter === 'Supplements';
  const isConditions = route?.params?.filter === 'Condition';
  const isSearch = route?.params?.filter === 'Search';
  
  const SEARCH_CATEGORIES = [
    { id: 'search', name: 'Search\nResults', icon: '🔍', keywords: '' }
  ];
  
  const categories = isSearch ? SEARCH_CATEGORIES : isSupplements ? SUPPLEMENT_CATEGORIES : isConditions ? CONDITION_CATEGORIES : MEDICINE_CATEGORIES;
  
  const [activeCategory, setActiveCategory] = useState(route?.params?.categoryId || categories[0].id);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localQuery, setLocalQuery] = useState(route?.params?.searchQuery || '');
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');
  const insets = useSafeAreaInsets();
  
  const cart = useAppStore((state) => state.cart);
  const addToCart = useAppStore((state) => state.addToCart);

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  useEffect(() => {
    if (route?.params?.categoryId) {
      setActiveCategory(route.params.categoryId);
    } else {
      setActiveCategory(categories[0].id);
    }
  }, [isSupplements, isConditions, isSearch, route?.params?.categoryId]);

  useEffect(() => {
    async function fetchMedicines() {
      if (!activeCategoryData) return;
      
      setLoading(true);
      const categoryName = activeCategoryData.name.replace('\n', ' ');
      
      let searchCategory = categoryName;
      if (searchCategory.endsWith('s')) {
        searchCategory = searchCategory.slice(0, -1);
      }
      
      let query = supabase
        .from('medicine_products')
        .select('*')
        .limit(300);

      if (isSearch) {
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
      } else if (isSupplements || isConditions) {
        query = query.or((activeCategoryData as any).keywords);
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
      } else {
        query = query.ilike('dosage_form', `%${searchCategory}%`);
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
      }

      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching medicines:', error);
      } else if (data) {
        // Quick shuffle to mix companies up
        const mixedData = [...data].sort(() => 0.5 - Math.random());
        setMedicines(mixedData.slice(0, 100));
      }
      setLoading(false);
    }
    
    fetchMedicines();
  }, [activeCategoryData, searchQuery]);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1A1A24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isSearch ? 'Search Results' : isSupplements ? 'Supplements' : isConditions ? 'By Condition' : 'All Medicines'}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
          <Feather name="shopping-cart" size={20} color="#1A1A24" />
          {cart.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Left Sidebar */}
        {!isConditions && !isSearch && (
          <View style={styles.sidebar}>
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.sidebarScroll}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                    onPress={() => setActiveCategory(cat.id)}
                  >
                    <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                      <Text style={styles.iconText}>{cat.icon}</Text>
                    </View>
                    <Text 
                      style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>
                    {isActive && <View style={styles.activeIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Right Content */}
        <View style={styles.mainContent}>
          {/* Search Bar Sticky Row */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={18} color="#9B95A8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={isSearch ? "Search all medicines" : `Search in ${activeCategoryData?.name.replace('\n', ' ')}`}
                placeholderTextColor="#9B95A8"
                value={localQuery}
                onChangeText={setLocalQuery}
                returnKeyType="search"
                onSubmitEditing={() => setSearchQuery(localQuery.trim())}
              />
            </View>
          </View>

          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
            </View>
          ) : medicines.length === 0 ? (
            <View style={styles.stateContainer}>
              <Text style={styles.emptyText}>No medicines found in this category.</Text>
            </View>
          ) : (
            <FlatList
              data={medicines}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.mainScroll}
              columnWrapperStyle={styles.productsGrid}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[styles.productCard, (isConditions || isSearch) && { width: (width - 24 - 12) / 2 }]}>
                  <View>
                    <View style={styles.badgesContainer}>
                      {isRecommended(item.name) && (
                        <View style={styles.recommendedBadge}>
                          <Feather name="star" size={8} color="#FFFFFF" />
                          <Text style={styles.recommendedText}>Recommended</Text>
                        </View>
                      )}
                      {isForChildren(item.name) && (
                        <View style={[styles.recommendedBadge, { backgroundColor: '#3498DB' }]}>
                          <Feather name="smile" size={8} color="#FFFFFF" />
                          <Text style={styles.recommendedText}>Children</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.company ? (
                      <Text style={styles.productCompany} numberOfLines={1}>
                        {item.company}
                      </Text>
                    ) : null}
                  </View>
                  
                  <View style={styles.bottomRow}>
                    <View style={styles.priceContainer}>
                      {item.price > 0 && (
                        <Text style={styles.productMrp}>
                          ₹{(item.price * 1.2).toFixed(2)}
                        </Text>
                      )}
                      <Text style={styles.productPrice}>
                        ₹{item.price ? item.price.toFixed(2) : '0.00'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cartButton}
                      onPress={() => addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price || 0,
                        module: 'medicine'
                      })}
                    >
                      <Image 
                        source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/add.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvYWRkLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODUzMDg5OTYsImV4cCI6MTg3OTkxNjk5Nn0.VSui_Xn0DtUi7oeYuN7mq3VBG10DkHTIy4V-eWPcU40' }}
                        style={{ width: 12, height: 12, marginRight: 4 }}
                        resizeMode="contain"
                      />
                      <Text style={styles.cartButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListFooterComponent={<View style={{height: 100}}/>}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFF5',
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#F0EFF5',
  },
  sidebarScroll: {
    paddingBottom: 40,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  sidebarItemActive: {
    backgroundColor: '#F2F9F4', // Light green bg
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '20%',
    bottom: '20%',
    width: 4,
    backgroundColor: '#2E8B57', // Green indicator
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconCircleActive: {
    backgroundColor: '#E6F3EB',
  },
  iconText: {
    fontSize: 24,
  },
  sidebarItemText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#706B82',
    textAlign: 'center',
    lineHeight: 14,
  },
  sidebarItemTextActive: {
    color: '#1A1A24',
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F9F8FC',
  },
  searchBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFF5',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F1F8',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E8E4F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A24',
    fontWeight: '400',
    paddingVertical: 0,
  },
  mainScroll: {
    padding: 12,
  },
  productsGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: (width - SIDEBAR_WIDTH - 24 - 12) / 2, // 24 for horizontal padding, 12 for gap
    height: 120, // fixed squarish height
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0EFF5',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A24',
    lineHeight: 18,
    width: '100%',
    zIndex: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ECC71',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 2,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  productCompany: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9B95A8',
    marginTop: 4,
    zIndex: 2,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  cartButtonText: {
    color: '#1A1A24',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A24',
  },
  priceContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  productMrp: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9B95A8',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  stateContainer: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9B95A8',
    fontSize: 14,
    fontWeight: '500',
  },
});
