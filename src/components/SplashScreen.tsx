import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';

interface Props {
  onFinish: () => void;
  isReady: boolean;
}

export default function SplashScreen({ onFinish, isReady }: Props) {
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Fade out when ready
  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 500);
    }
  }, [isReady]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Image 
        source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/noxorlogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbm94b3Jsb2dvLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQ2MjgsImV4cCI6MTgxNjI0MDYyOH0.GpNodQ3zCNnNL5LCKxmnX8VrGalTFhnRER-SwUW_owg' }}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logo: {
    width: 200,
    height: 80,
  }
});
