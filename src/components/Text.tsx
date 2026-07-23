import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

export function Text(props: TextProps) {
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

  // If there's an existing font style we might not want to override it, but since the goal is Figtree everywhere:
  const newStyle = { ...flattenedStyle, fontFamily, fontWeight: undefined }; 
  // We remove fontWeight so React Native doesn't try to apply synthetic bolding on top of the already bold font (Android issue).

  return <RNText {...props} style={newStyle} />;
}
