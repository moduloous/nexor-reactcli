import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Image } from 'react-native';
import { Text } from '../components/Text';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing, 
  withSequence,
  FadeIn
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SCALLOP_SIZE = 20;
const CARD_WIDTH = Math.floor((width * 0.75) / SCALLOP_SIZE) * SCALLOP_SIZE;
const CARD_HEIGHT = Math.floor(400 / SCALLOP_SIZE) * SCALLOP_SIZE;
const SCALLOP_COUNT_V = Math.round(CARD_HEIGHT / SCALLOP_SIZE);
const SCALLOP_COUNT_H = Math.round(CARD_WIDTH / SCALLOP_SIZE);
const BG_COLOR = '#FFFFFF';
const BEIGE_COLOR = '#F5F0E6';

export default function CategoryComingSoonScreen({ route, navigation }: any) {
  const { category } = route.params || {};
  const insets = useSafeAreaInsets();
  
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedTagStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -CARD_HEIGHT / 2 },
        { rotateZ: `${rotation.value}deg` },
        { translateY: CARD_HEIGHT / 2 },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1A1A24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content (The Tag) */}
      <View style={styles.content}>
        
        {/* The Nail */}
        <View style={styles.nailOuter}>
          <View style={styles.nailInner} />
          <View style={styles.nailHighlight} />
        </View>

        {/* The Thread (Fixed from nail to the hole) */}
        <View style={styles.threadContainer}>
          <View style={styles.threadLeft} />
          <View style={styles.threadRight} />
        </View>

        {/* The Swinging Tag */}
        <Animated.View style={[styles.tagWrapper, animatedTagStyle]}>
          <View style={styles.card}>
            
            {/* Scalloped Edges */}
            <View style={styles.scallopsTop}>
              {Array.from({ length: SCALLOP_COUNT_H }).map((_, i) => (
                <View key={`top-${i}`} style={styles.scallop} />
              ))}
            </View>
            <View style={styles.scallopsBottom}>
              {Array.from({ length: SCALLOP_COUNT_H }).map((_, i) => (
                <View key={`bottom-${i}`} style={styles.scallop} />
              ))}
            </View>
            <View style={styles.scallopsLeft}>
              {Array.from({ length: SCALLOP_COUNT_V }).map((_, i) => (
                <View key={`left-${i}`} style={styles.scallop} />
              ))}
            </View>
            <View style={styles.scallopsRight}>
              {Array.from({ length: SCALLOP_COUNT_V }).map((_, i) => (
                <View key={`right-${i}`} style={styles.scallop} />
              ))}
            </View>

            {/* Tag Hole */}
            <View style={styles.tagHoleWrapper}>
              <View style={styles.tagHole} />
              <View style={styles.tagHoleRing} />
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
              <Text style={styles.brandText}>NEXORSUPER</Text>
              
              <Image 
                source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/noxorlogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbm94b3Jsb2dvLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQ2MjgsImV4cCI6MTgxNjI0MDYyOH0.GpNodQ3zCNnNL5LCKxmnX8VrGalTFhnRER-SwUW_owg' }}
                style={styles.logo}
                resizeMode="contain"
              />

              <Animated.View entering={FadeIn.delay(300).duration(800)}>
                <Text style={styles.launchingText}>launching soon</Text>
              </Animated.View>
              
              <View style={styles.divider} />
              <Text style={styles.categoryText}>{category}</Text>
              <Text style={styles.subText}>We are working hard to bring this feature to you.</Text>
            </View>
            
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 16,
    zIndex: 10,
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
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  
  // Nail
  nailOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3A3A3A',
    position: 'absolute',
    top: 50,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nailInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A1A1A',
  },
  nailHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Thread
  threadContainer: {
    position: 'absolute',
    top: 57,
    zIndex: 5,
    alignItems: 'center',
    height: 45,
  },
  threadLeft: {
    position: 'absolute',
    width: 1,
    height: 50,
    backgroundColor: '#D0D0D0',
    transform: [{ rotateZ: '-15deg' }, { translateX: -6 }],
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  threadRight: {
    position: 'absolute',
    width: 1,
    height: 50,
    backgroundColor: '#E5E5E5',
    transform: [{ rotateZ: '15deg' }, { translateX: 6 }],
    shadowColor: '#000',
    shadowOffset: { width: -1, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },

  // Tag
  tagWrapper: {
    marginTop: 50, // Distance from top for the swinging origin
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: BEIGE_COLOR,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    position: 'relative',
  },

  // Scallops
  scallopsLeft: {
    position: 'absolute',
    left: -SCALLOP_SIZE / 2,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  scallopsRight: {
    position: 'absolute',
    right: -SCALLOP_SIZE / 2,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  scallopsTop: {
    position: 'absolute',
    top: -SCALLOP_SIZE / 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  scallopsBottom: {
    position: 'absolute',
    bottom: -SCALLOP_SIZE / 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  scallop: {
    width: SCALLOP_SIZE,
    height: SCALLOP_SIZE,
    borderRadius: SCALLOP_SIZE / 2,
    backgroundColor: BG_COLOR,
  },

  // Tag Hole
  tagHoleWrapper: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tagHole: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BG_COLOR,
    zIndex: 2,
  },
  tagHoleRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(160, 110, 80, 0.2)', // Brownish paper reinforcer ring
    borderWidth: 1,
    borderColor: 'rgba(160, 110, 80, 0.4)',
    zIndex: 1,
  },

  // Content
  cardContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 20,
    width: '100%',
  },
  brandText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#9B89B3', // Purple-ish tone to match the vibe
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 35,
    marginBottom: 16,
    mixBlendMode: 'multiply',
  },
  launchingText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: -1,
    lineHeight: 32,
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 24,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A24',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subText: {
    fontSize: 12,
    color: '#706B82',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 5,
  }
});
