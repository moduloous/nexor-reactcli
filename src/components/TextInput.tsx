import React from 'react';
import { TextInput as RNTextInput, TextInputProps, StyleSheet } from 'react-native';

export function TextInput(props: TextInputProps) {
  const flattenedStyle = StyleSheet.flatten(props.style || {});
  let fontFamily = 'Figtree-Regular';

  if (flattenedStyle.fontWeight) {
    const weight = flattenedStyle.fontWeight.toString();
    if (weight === 'bold' || weight === '700' || weight === '800' || weight === '900') {
      fontFamily = 'Figtree-Bold';
    } else if (weight === '600') {
      fontFamily = 'Figtree-SemiBold';
    } else if (weight === '500') {
      fontFamily = 'Figtree-Medium';
    } else if (weight === '300') {
      fontFamily = 'Figtree-Light';
    } else if (weight === 'normal' || weight === '400') {
      fontFamily = 'Figtree-Regular';
    }
  }

  const newStyle = { ...flattenedStyle, fontFamily, fontWeight: undefined };

  return <RNTextInput {...props} style={newStyle} />;
}
