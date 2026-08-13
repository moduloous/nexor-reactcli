import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text } from './Text';
import { useAppStore } from '../store/useAppStore';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

export function CustomAlertModal() {
  const alertData = useAppStore((state) => state.alertData);
  const hideAlert = useAppStore((state) => state.hideAlert);

  if (!alertData.visible) return null;

  const buttons = alertData.buttons && alertData.buttons.length > 0 
    ? alertData.buttons 
    : [{ text: 'OK', onPress: () => {} }];

  return (
    <Modal
      transparent
      visible={alertData.visible}
      animationType="none"
      onRequestClose={hideAlert}
    >
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={StyleSheet.absoluteFill}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={hideAlert}
          />
        </Animated.View>
        
        <Animated.View 
          entering={ZoomIn.duration(300).springify()} 
          exiting={ZoomOut.duration(200)} 
          style={styles.alertBox}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{alertData.title}</Text>
            <Text style={styles.message}>{alertData.message}</Text>
          </View>
          
          <View style={[styles.buttonContainer, buttons.length > 2 && styles.buttonContainerVertical]}>
            {buttons.map((btn, index) => {
              const isPrimary = index === buttons.length - 1; // last button usually primary
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttons.length > 2 && styles.buttonVertical,
                    isPrimary && !isDestructive && !isCancel && styles.buttonPrimary,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel
                  ]}
                  onPress={() => {
                    hideAlert();
                    if (btn.onPress) {
                      // small delay to allow modal to close smoothly before firing action
                      setTimeout(() => btn.onPress!(), 100);
                    }
                  }}
                >
                  <Text 
                    style={[
                      styles.buttonText,
                      isPrimary && !isDestructive && !isCancel && styles.buttonTextPrimary,
                      isDestructive && styles.buttonTextDestructive,
                      isCancel && styles.buttonTextCancel
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 36, 0.4)',
  },
  alertBox: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    padding: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A24',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#706B82',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonVertical: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  buttonPrimary: {
    // Optionally distinct bg color, but typically native alerts just have colored text
  },
  buttonDestructive: {
  },
  buttonCancel: {
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  buttonTextPrimary: {
    fontWeight: '700',
  },
  buttonTextDestructive: {
    color: '#E74C3C',
  },
  buttonTextCancel: {
    color: '#1A1A24',
    fontWeight: '500',
  },
});
