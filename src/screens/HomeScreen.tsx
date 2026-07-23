import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'grocery', icon: '🍉', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/app%20icons/grocery.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAgaWNvbnMvZ3JvY2VyeS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzMzIyNjAyLCJleHAiOjE4MTQ4NTg2MDJ9.D-MEEoTnkWX3iZ51GloA-EIYYIkG9PsrN2JuJ6PGsWM', title: 'Grocery' },
  { id: 'food', icon: '🛵', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/app%20icons/fooddelivery.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAgaWNvbnMvZm9vZGRlbGl2ZXJ5LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMzMjI2MTYsImV4cCI6MTgxNDg1ODYxNn0.V-iU_x8Ck5pnWaUN1hdLGJXNoI050SGN97nqBCgHYKo', title: 'Food\nDelivery' },
  { id: 'medicine', icon: '💊', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/app%20icons/medicines.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAgaWNvbnMvbWVkaWNpbmVzLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMzMjI2MzYsImV4cCI6MTgxNDg1ODYzNn0.WJw8EOoDZ-3hiXnXJfi1rMF9UeVwOr74m-4ra57xKrM', title: 'Medicines' },
  { id: 'rides', icon: '🚗', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/icons/ride.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy9yaWRlLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMzMjI2ODMsImV4cCI6MTgxNDg1ODY4M30.RKj7DtpjJt5nM7qtlo7ynIsUJmTnxjNnf0d1AqixMao', title: 'Rides' },
  { id: 'stays', icon: '🏨', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/icons/stays.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy9zdGF5cy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzMzIyNzIwLCJleHAiOjE4MTQ4NTg3MjB9.9s2GY6Z6R-y6Nq-jk17yw1JslXr8o33ms1G6Lnzc-Y8', title: 'Stays' },
  { id: 'travel', icon: '🧳', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/app%20icons/travel.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAgaWNvbnMvdHJhdmVsLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMzMjI3NDAsImV4cCI6MTgxNDg1ODc0MH0.3-YUZVJVyIZtmdmOSWs2iM0yPAY6Qr2dfU4YeSfgVkU', title: 'Travel' },
  { id: 'shopping', icon: '🛍️', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/app%20icons/sneakers.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAgaWNvbnMvc25lYWtlcnMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzMyMjc1MywiZXhwIjoxODE0ODU4NzUzfQ.s0X7Uye9bh_ha6LtduJLh7X3xTWGZt6_ipzL_ZFKWV0', title: 'Shopping' },
  { id: 'events', icon: '🎸', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/app%20icons/Events.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAgaWNvbnMvRXZlbnRzLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODMzMjI4MjMsImV4cCI6MTgxNDg1ODgyM30.r-pUiGDizX74rpEMcfKF7CGVPSMuEeu88BKb5afHFP0', title: 'Events' },
  { id: 'quick', icon: '🛒', title: 'Quick\nCommerce' },
  { id: 'pay', icon: '💳', imageUrl: 'https://ajfonpzetlpmenxemofe.supabase.co/storage/v1/object/sign/app%20icons/nexor%20pay.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjQ3ZWJkYy1kYmRiLTQyYTgtOGRkOS1mMjliZWM0ZTU5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcHAgaWNvbnMvbmV4b3IgcGF5LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDMxNjMsImV4cCI6MTg3OTMxMTE2M30.3xolLtwf7Ka_ygJsKRrqHOfkB8OwBddFZrsS0obI9QQ', title: 'Nexor Pay' },
];

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  console.log('[HomeScreen] Rendering...');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/noxorlogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbm94b3Jsb2dvLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQ2MjgsImV4cCI6MTgxNjI0MDYyOH0.GpNodQ3zCNnNL5LCKxmnX8VrGalTFhnRER-SwUW_owg' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Image 
                source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/qr%20code.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvcXIgY29kZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0NzA0MTc2LCJleHAiOjE4NzkzMTIxNzZ9.RfW01maAbZTSMdv_gohZ0H-KZ1KvfcvrPWZpnrzH4GI' }}
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}>
              <Image 
                source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/icons8-night-94.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvaWNvbnM4LW5pZ2h0LTk0LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQwMDIsImV4cCI6MTgxNjI0MDAwMn0.k3tawyje2ZUFiusOc769gEqiHPeLtb2-ggW8tfR1HKs' }}
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.searchContainer}>
          <Image 
            source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/searchbar.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvc2VhcmNoYmFyLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQ0NjQsImV4cCI6MTg3OTMxMjQ2NH0.XTKuRDagScS_4aVKJ6SHFbimzWM0P6iFosNJL7T4dIY' }}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            value={search}
            onChangeText={setSearch}
          />
        </Animated.View>

        {/* Categories Grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.grid}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryItem} 
              activeOpacity={0.7}
              onPress={() => {
                if (cat.id === 'medicine') {
                  navigation.navigate('Medicines');
                }
              }}
            >
              {cat.imageUrl ? (
                <Image source={{ uri: cat.imageUrl }} style={styles.categoryImage} resizeMode="contain" />
              ) : (
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
              )}
              <Text style={styles.categoryTitle}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Deals Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.dealsSection}>
          <Text style={styles.dealsTitle}>Today's deals !</Text>

        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logoImage: {
    width: 105,
    height: 36,
    marginLeft: -16,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  iconText: {
    fontSize: 20,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 46,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  categoryItem: {
    width: '19%',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIcon: {
    fontSize: 48,
  },
  categoryImage: {
    width: 56,
    height: 56,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dealsSection: {
    marginTop: 'auto',
  },
  dealsTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginBottom: 16,
    letterSpacing: 0,
    textShadowColor: 'transparent',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  promoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    height: 180,
    padding: 24,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  promoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  promoBrand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    fontStyle: 'italic',
    lineHeight: 40,
  },
  discountBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  discountTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  discountTextLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 2,
  },
  spacer: {
    height: 40,
  },
});
