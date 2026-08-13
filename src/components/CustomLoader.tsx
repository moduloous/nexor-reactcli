import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface CustomLoaderProps {
  size?: number;
}

export const CustomLoader = ({ size = 60 }: CustomLoaderProps) => {
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
  <style>
    body, html {
      margin: 0;
      padding: 0;
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    .loader {    
      --r1: 154%;
      --r2: 68.5%;
      width: ${size}px;
      aspect-ratio: 1;
      border-radius: 50%; 
      background:
        radial-gradient(var(--r1) var(--r2) at top   ,#0000 79.5%,#269af2 80%),
        radial-gradient(var(--r1) var(--r2) at bottom,#269af2 79.5%,#0000 80%),
        radial-gradient(var(--r1) var(--r2) at top   ,#0000 79.5%,#269af2 80%),
        #ccc;
      background-size: 50.5% 220%;
      background-position: -100% 0%,0% 0%,100% 0%;
      background-repeat:no-repeat;
      animation: l9 2s infinite linear;
    }
    @keyframes l9 {
        33%  {background-position:    0% 33% ,100% 33% ,200% 33% }
        66%  {background-position: -100%  66%,0%   66% ,100% 66% }
        100% {background-position:    0% 100%,100% 100%,200% 100%}
    }
  </style>
  </head>
  <body>
    <div class="loader"></div>
  </body>
  </html>
  `;

  return (
    <View style={[styles.container, { width: size + 5, height: size + 5 }]}>
      <WebView
        source={{ html: htmlContent }}
        style={[styles.webview, { width: size + 5, height: size + 5 }]}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        containerStyle={[styles.webviewContainer, { width: size + 5, height: size + 5 }]}
        transparent={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    opacity: 0.99,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
