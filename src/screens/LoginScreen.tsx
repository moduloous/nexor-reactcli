import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { CustomLoader } from '../components/CustomLoader';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const setAuth = useAppStore((state) => state.setAuth);

  const handleToggle = useCallback((loginState: boolean) => {
    if (isLogin === loginState) return;
    
    // Snappier, more optimized layout animation
    LayoutAnimation.configureNext({
      duration: 200,
      create: { type: LayoutAnimation.Types.easeOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeOut },
      delete: { type: LayoutAnimation.Types.easeOut, property: LayoutAnimation.Properties.opacity },
    });
    
    setIsLogin(loginState);
    
    Animated.timing(slideAnim, {
      toValue: loginState ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isLogin, slideAnim]);

  const handleAuth = async () => {
    if (isLogin) {
      if (!email || !password) {
        useAppStore.getState().showAlert('Error', 'Please enter email and password');
        return;
      }
    } else {
      if (!username || !email || !password || !confirmPassword) {
        useAppStore.getState().showAlert('Error', 'Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        useAppStore.getState().showAlert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setAuth(data.session.access_token, data.session.refresh_token, {
            id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split('@')[0] || 'User',
            phone: '',
          });
          navigation.navigate('Main');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) throw error;

        useAppStore.getState().showAlert('Success', 'Account created successfully! Please login.');
        setIsLogin(true);
      }
    } catch (error: any) {
      useAppStore.getState().showAlert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>

        {/* Top White Section */}
        <View style={[styles.topSection, { paddingTop: insets.top }]}>
          <Image
            source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/assets/noxorlogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbm94b3Jsb2dvLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ3MDQ2MjgsImV4cCI6MTgxNjI0MDYyOH0.GpNodQ3zCNnNL5LCKxmnX8VrGalTFhnRER-SwUW_owg' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Dark Section Wrapper */}
        <View style={styles.bottomSectionWrapper}>
          {/* White patch to show through the top-left curve */}
          <View style={styles.whitePatch} />
          <View style={styles.bottomSection}>

            {/* Segmented Control */}
            <View
              style={styles.segmentedControl}
              onLayout={(e) => {
                const width = e.nativeEvent.layout.width;
                if (Math.abs(containerWidth - width) > 1) {
                  setContainerWidth(width);
                }
              }}
            >
              <Animated.View
                style={[
                  styles.slidingPill,
                  {
                    width: containerWidth > 0 ? (containerWidth - 8) / 2 : '50%',
                    transform: [{
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, containerWidth > 0 ? (containerWidth - 8) / 2 : 0]
                      })
                    }]
                  }
                ]}
              />
              <TouchableOpacity
                style={styles.segmentButton}
                onPress={() => handleToggle(true)}
                activeOpacity={1}
              >
                <Text style={[styles.segmentText, isLogin && styles.segmentTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.segmentButton}
                onPress={() => handleToggle(false)}
                activeOpacity={1}
              >
                <Text style={[styles.segmentText, !isLogin && styles.segmentTextActive]}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#666"
                />
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm password</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholderTextColor="#666"
                  />
                </View>
              )}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <CustomLoader size={24} />
              ) : (
                <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign up'}</Text>
              )}
            </TouchableOpacity>

            {/* Continue as Guest */}
            {isLogin && (
              <TouchableOpacity style={styles.skipContainer} onPress={() => navigation.navigate('Main')}>
                <Text style={styles.skipText}>Continue as Guest</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: '#FFFFFF',
    height: height * 0.32,
    borderBottomRightRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: 200,
    height: 80,
  },
  bottomSectionWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  whitePatch: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 80,
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    borderRadius: 30,
    marginBottom: 40,
    height: 52,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  slidingPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 26,
    zIndex: 1,
  },
  segmentText: {
    fontSize: 15,
    fontFamily: 'Figtree-Bold',
    color: '#999999',
  },
  segmentTextActive: {
    color: '#111111',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Figtree-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontFamily: 'Figtree-Medium',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  buttonText: {
    color: '#111111',
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
  },
  skipContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  skipText: {
    color: '#888888',
    fontSize: 14,
    fontFamily: 'Figtree-Medium',
    textDecorationLine: 'underline',
  }
});
