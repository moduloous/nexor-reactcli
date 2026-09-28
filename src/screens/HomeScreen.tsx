import React, { useState, useEffect } from 'react';
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
import Animated, { FadeInDown, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const SkeletonBlock = ({ width, height, borderRadius, style }: any) => {
  const opacity = useSharedValue(0.5);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: '#E2E0E7' }, animatedStyle, style]} />
  );
};
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

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

  // Skeleton State
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const TOTAL_IMAGES = 13;

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  useEffect(() => {
    if (imagesLoaded >= TOTAL_IMAGES) {
      setIsReady(true);
    }
  }, [imagesLoaded]);

  // Fallback timeout so we don't block forever
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 12000); // 12 seconds max wait
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/noxorlogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbm94b3Jsb2dvLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQ2MjgsImV4cCI6MTgxNjI0MDYyOH0.GpNodQ3zCNnNL5LCKxmnX8VrGalTFhnRER-SwUW_owg' }} 
              style={styles.logoImage} 
              resizeMode="contain" 
              onLoad={handleImageLoad}
              onError={handleImageLoad}
            />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Image 
                source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/qr%20code.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvcXIgY29kZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0NzA0MTc2LCJleHAiOjE4NzkzMTIxNzZ9.RfW01maAbZTSMdv_gohZ0H-KZ1KvfcvrPWZpnrzH4GI' }} 
                style={{ width: 44, height: 44 }} 
                resizeMode="contain" 
                onLoad={handleImageLoad}
                onError={handleImageLoad}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}>
              <Image 
                source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/icons8-night-94.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvaWNvbnM4LW5pZ2h0LTk0LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQwMDIsImV4cCI6MTgxNjI0MDAwMn0.k3tawyje2ZUFiusOc769gEqiHPeLtb2-ggW8tfR1HKs' }} 
                style={{ width: 44, height: 44 }} 
                resizeMode="contain" 
                onLoad={handleImageLoad}
                onError={handleImageLoad}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9B95A8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.scanButton}>
            <Image
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/home%20icons/search%20bar.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJob21lIGljb25zL3NlYXJjaCBiYXIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDg3ODkwNywiZXhwIjoxODc5NDg2OTA3fQ.gbg6t6tRsIsRiX9P4U_9n2bOhLLLLEJbYjcJJOd5fz4' }}
              style={styles.searchRightIcon}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageLoad}
            />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.grid}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              activeOpacity={0.7}
              onPress={() => {
                if (cat.id === 'medicine') {
                  navigation.navigate('Medicines');
                } else if (cat.id === 'grocery' || cat.id === 'quick') {
                  navigation.navigate('SwiggyConnect', { mode: 'grocery' });
                } else if (cat.id === 'food') {
                  navigation.navigate('SwiggyConnect', { mode: 'food' });
                } else {
                  navigation.navigate('CategoryComingSoon', { category: cat.title });
                }
              }}
            >
              {cat.imageUrl ? (
                <Image 
                  source={{ uri: cat.imageUrl }} 
                  style={styles.categoryImage} 
                  resizeMode="contain" 
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              ) : (
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
              )}
              <Text style={styles.categoryTitle}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.dealsSection}>
          <Text style={styles.dealsTitle}>Today's deals !</Text>
          <Image
            source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/banners/medicine%20home%20banner.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYW5uZXJzL21lZGljaW5lIGhvbWUgYmFubmVyLmpwZWciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0ODc3NTQ0LCJleHAiOjE4MTY0MTM1NDR9.YmJtNezToZLN-vGwbeplwx3f0wz83StpI-_7xav0JFo' }}
            style={styles.dealsBanner}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageLoad}
          />
        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Skeleton Overlay */}
      {!isReady && (
        <Animated.View exiting={FadeOut.duration(400)} style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', paddingTop: insets.top, zIndex: 100 }]}>
          <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 32 }]} scrollEnabled={false} showsVerticalScrollIndicator={false}>
            {/* Header Skeleton */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <SkeletonBlock width={105} height={36} borderRadius={8} />
              </View>
              <View style={styles.headerRight}>
                <SkeletonBlock width={44} height={44} borderRadius={22} />
                <SkeletonBlock width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
              </View>
            </View>

            {/* Search Bar Skeleton */}
            <SkeletonBlock width="100%" height={54} borderRadius={30} style={{ marginBottom: 32 }} />

            {/* Grid Skeleton */}
            <View style={styles.grid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, idx) => (
                <View key={`sk-cat-${idx}`} style={styles.categoryItem}>
                  <SkeletonBlock width={52} height={52} borderRadius={26} style={{ marginBottom: 8 }} />
                  <SkeletonBlock width={50} height={10} borderRadius={5} />
                </View>
              ))}
            </View>

            {/* Deals Skeleton */}
            <View style={styles.dealsSection}>
              <SkeletonBlock width={150} height={28} borderRadius={8} style={{ marginBottom: 16 }} />
              <SkeletonBlock width="100%" height={160} borderRadius={20} />
            </View>
          </ScrollView>
        </Animated.View>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F1F8',
    borderRadius: 30,
    paddingLeft: 22,
    paddingRight: 6,
    height: 54,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E8E4F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A24',
    fontWeight: '400',
  },
  scanButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#302D3A',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  searchRightIcon: {
    width: 20,
    height: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  categoryItem: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 28,
  },
  categoryIcon: {
    fontSize: 44,
  },
  categoryImage: {
    width: 52,
    height: 52,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 10,
    color: '#333333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dealsSection: {
    marginTop: -4,
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
  dealsBanner: {
    width: '100%',
    height: 160,
    borderRadius: 20,
  },
  spacer: {
    height: 40,
  },
});
