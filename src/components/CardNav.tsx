import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Platform,
  UIManager,
} from 'react-native';
import { Text } from './Text';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  withDelay,
} from 'react-native-reanimated';
import FeatherIcon from '@react-native-vector-icons/feather';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: string;
  items: CardNavItem[];
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const { width } = Dimensions.get('window');
const CLOSED_HEIGHT = 60;
const OPEN_HEIGHT = 380; // Estimated height for 3 vertical cards

const CardNav: React.FC<CardNavProps> = ({
  logo,
  items,
  baseColor = '#fff',
  menuColor = '#000',
  buttonBgColor = '#111',
  buttonTextColor = '#fff',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.poly(3)), // similar to power3.out
    });
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(progress.value, [0, 1], [CLOSED_HEIGHT, OPEN_HEIGHT], Extrapolate.CLAMP),
    };
  });

  const hamburgerLine1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [0, 4]) },
        { rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` },
      ],
    };
  });

  const hamburgerLine2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [0, -4]) },
        { rotate: `${interpolate(progress.value, [0, 1], [0, -45])}deg` },
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value > 0.1 ? progress.value : 0,
      pointerEvents: progress.value > 0.5 ? 'auto' : 'none',
    };
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: baseColor }, containerStyle]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Logo (left on mobile) */}
        <View style={styles.logoContainer}>
          <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Right side: Search Button + Hamburger */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: buttonBgColor }]}
            onPress={() => console.log('Search pressed')}
          >
            <FeatherIcon name="search" size={18} color={buttonTextColor} style={{ marginRight: 6 }} />
            <Text style={[styles.ctaText, { color: buttonTextColor }]}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hamburger} onPress={toggleMenu} activeOpacity={0.7}>
            <Animated.View style={[styles.hamburgerLine, { backgroundColor: menuColor }, hamburgerLine1Style]} />
            <Animated.View style={[styles.hamburgerLine, { backgroundColor: menuColor }, hamburgerLine2Style]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        {(items || []).slice(0, 3).map((item, idx) => {
          // Staggered animation for each card
          const cardStyle = useAnimatedStyle(() => {
            const cardProgress = Math.max(0, progress.value - idx * 0.1);
            return {
              opacity: cardProgress,
              transform: [{ translateY: interpolate(cardProgress, [0, 1], [20, 0], Extrapolate.CLAMP) }],
            };
          });

          return (
            <Animated.View
              key={idx}
              style={[
                styles.navCard,
                { backgroundColor: item.bgColor },
                cardStyle,
              ]}
            >
              <Text style={[styles.cardLabel, { color: item.textColor }]}>{item.label}</Text>
              <View style={styles.cardLinks}>
                {item.links?.map((lnk, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.cardLinkRow}
                    onPress={() => Linking.openURL(lnk.href).catch(() => {})}
                  >
                    <FeatherIcon name="arrow-up-right" size={14} color={item.textColor} style={{ marginRight: 6 }} />
                    <Text style={[styles.cardLinkText, { color: item.textColor }]}>{lnk.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32, // 16px padding on sides
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: 'absolute',
    top: 48, // safe area approx
    zIndex: 100,
  },
  topBar: {
    height: CLOSED_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  logoContainer: {
    justifyContent: 'center',
  },
  logo: {
    height: 28,
    width: 120, // adjust based on asset
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hamburger: {
    height: '100%',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    borderRadius: 2,
  },
  content: {
    position: 'absolute',
    top: CLOSED_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    gap: 8,
    zIndex: 1,
  },
  navCard: {
    flex: 1,
    minHeight: 80,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  cardLinks: {
    marginTop: 12,
    gap: 6,
  },
  cardLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLinkText: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default CardNav;
