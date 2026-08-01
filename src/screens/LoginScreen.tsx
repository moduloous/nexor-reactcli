import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAppStore((state) => state.setAuth);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
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
          // App.tsx handles auth navigation automatically if set up, or we just navigate
          navigation.navigate('Main');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        Alert.alert('Success', 'Account created successfully! Please login.');
        setIsLogin(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={[styles.header, { marginTop: insets.top + 20 }]}>
        <View style={styles.iconContainer}>
          <Feather name="shield" size={32} color="#4A90E2" />
        </View>
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to manage your orders' : 'Join us for seamless medicine delivery'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={20} color="#9B95A8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9B95A8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#9B95A8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9B95A8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchAction}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.skipContainer} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.skipText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A24',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#706B82',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A24',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8FC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EFF5',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A24',
    height: '100%',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#706B82',
    fontSize: 14,
  },
  switchAction: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '700',
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  skipText: {
    color: '#9B95A8',
    fontSize: 14,
    fontWeight: '500',
  }
});
