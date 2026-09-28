import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface CustomLoaderProps {
  size?: number;
  color?: string;
}

export const CustomLoader = ({ size = 60, color = '#269af2' }: CustomLoaderProps) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <ActivityIndicator size={size > 40 ? 'large' : 'small'} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
