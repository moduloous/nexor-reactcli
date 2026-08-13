import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Image, ScrollView } from 'react-native';
import { Text } from '../components/Text';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BG_COLOR = '#FFFFFF';
const PAPER_COLOR = '#EAE0C8';
const ZIGZAG_SIZE = 12;

export default function FlashScreen() {
  const insets = useSafeAreaInsets();
  
  const items = [
    {
      id: 1,
      name: 'Cappuccino',
      image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/flash%20icons/cappuccino.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmbGFzaCBpY29ucy9jYXBwdWNjaW5vLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODY0NDgxMzQsImV4cCI6MTg4MTA1NjEzNH0.TY09TcjEdFWSd189kTwy6ah5UzG_EyjOLO66_tQxlFQ',
    },
    {
      id: 2,
      name: 'Hot Pizza',
      image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/flash%20icons/pizza%20slice.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmbGFzaCBpY29ucy9waXp6YSBzbGljZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg2NDQ4MTYzLCJleHAiOjE4ODEwNTYxNjN9.g57-hW-nv8OnvyiyZ4GjvL0YwnDlNGKKZJCi6OUWyRI',
    },
    {
      id: 3,
      name: 'Glazed Donuts',
      image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/flash%20icons/Doughnut.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmbGFzaCBpY29ucy9Eb3VnaG51dC5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg2NDQ3OTI5LCJleHAiOjE4ODEwNTU5Mjl9.NcrNHrwn_CBLs2lfD1YCLNjYa4c4Eo2oZJAqfpMkTDE',
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}>
        
        <View style={styles.paperContainer}>
          
          {/* Top ZigZag */}
          <View style={styles.zigzagTop}>
            {Array.from({ length: Math.ceil(width / 8) }).map((_, i) => {
              const size = 10 + (Math.sin(i * 13) * 5);
              const rotation = 45 + (Math.sin(i * 21) * 35);
              const offset = Math.sin(i * 7) * 3;
              return (
                <View key={`top-${i}`} style={[
                  styles.zigzagBlockH, 
                  { 
                    width: size, height: size, 
                    transform: [{ rotate: `${rotation}deg` }, { translateY: (size / 1.5) + offset }],
                    marginLeft: -4
                  }
                ]} />
              );
            })}
          </View>
          
          {/* Bottom ZigZag */}
          <View style={styles.zigzagBottom}>
            {Array.from({ length: Math.ceil(width / 8) }).map((_, i) => {
              const size = 10 + (Math.sin(i * 11) * 5);
              const rotation = 45 + (Math.sin(i * 19) * 35);
              const offset = Math.sin(i * 5) * 3;
              return (
                <View key={`bottom-${i}`} style={[
                  styles.zigzagBlockH, 
                  { 
                    width: size, height: size, 
                    transform: [{ rotate: `${rotation}deg` }, { translateY: (size / 1.5) + offset }],
                    marginLeft: -4
                  }
                ]} />
              );
            })}
          </View>
          
          {/* Left ZigZag */}
          <View style={styles.zigzagLeft}>
            {Array.from({ length: Math.ceil(800 / 8) }).map((_, i) => {
              const size = 10 + (Math.sin(i * 17) * 5);
              const rotation = 45 + (Math.sin(i * 23) * 35);
              const offset = Math.sin(i * 13) * 3;
              return (
                <View key={`left-${i}`} style={[
                  styles.zigzagBlockV, 
                  { 
                    width: size, height: size, 
                    transform: [{ rotate: `${rotation}deg` }, { translateX: (size / 1.5) + offset }],
                    marginTop: -4
                  }
                ]} />
              );
            })}
          </View>
          
          {/* Right ZigZag */}
          <View style={styles.zigzagRight}>
            {Array.from({ length: Math.ceil(800 / 8) }).map((_, i) => {
              const size = 10 + (Math.sin(i * 29) * 5);
              const rotation = 45 + (Math.sin(i * 31) * 35);
              const offset = Math.sin(i * 37) * 3;
              return (
                <View key={`right-${i}`} style={[
                  styles.zigzagBlockV, 
                  { 
                    width: size, height: size, 
                    transform: [{ rotate: `${rotation}deg` }, { translateX: (size / 1.5) + offset }],
                    marginTop: -4
                  }
                ]} />
              );
            })}
          </View>

          {/* Paperclip */}
          <View style={styles.paperclipWrapper}>
            <Image 
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/flash%20icons/paperclip.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmbGFzaCBpY29ucy9wYXBlcmNsaXAucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NjQ1NDk1OSwiZXhwIjoxODE3OTkwOTU5fQ.KddI7TE1HU1m8uZDjcBlRhOKVFFoKZDGgPsrgGXAKMY' }}
              style={styles.paperclipImage}
            />
          </View>

          {/* Header */}
          <Text style={styles.title}>flash</Text>
          <View style={styles.dashedDivider} />
          <Text style={styles.subtitle}>get food in instant time</Text>
          <View style={styles.dashedDivider} />

          {/* Items */}
          <View style={styles.listContainer}>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <View style={styles.listItem}>
                  <View style={styles.itemImageWrapper}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.checkbox}>
                    <Feather name="check" size={24} color="#4A5D4E" style={{ marginLeft: 2, marginTop: -4 }} />
                  </View>
                </View>
                {index < items.length - 1 && <View style={styles.dashedDivider} />}
              </React.Fragment>
            ))}
            <View style={styles.dashedDivider} />
          </View>
          
        </View>

        {/* Second Paper Memo */}
        <View style={styles.secondPaperContainer}>
          <Text style={styles.secondPaperText}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#E85D75' }}>Hungry? Skip the wait. </Text>
            Get it in minutes with Nexor Flash Launching soon.
          </Text>
          
          {/* Wavy Torn Bottom Edge */}
          <View style={styles.wavyBottomEdge}>
            {Array.from({ length: Math.ceil(width / 20) }).map((_, i) => {
              const size = 30 + (Math.sin(i * 13) * 15);
              const yOffset = Math.sin(i * 7) * 8;
              return (
                <View 
                  key={`wave-${i}`} 
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: PAPER_COLOR,
                    marginLeft: -15, // overlap
                    transform: [{ translateY: yOffset }]
                  }} 
                />
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // keep some space for bottom nav
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  paperContainer: {
    width: '86%',
    backgroundColor: PAPER_COLOR,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ rotateZ: '-5deg' }],
    marginBottom: 60, // Add space between memos
  },
  
  secondPaperContainer: {
    width: '90%',
    backgroundColor: PAPER_COLOR,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 40,
  },
  secondPaperText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  wavyBottomEdge: {
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 40,
    overflow: 'hidden',
    alignItems: 'center',
  },
  
  // ZigZag Edges
  zigzagTop: {
    position: 'absolute',
    top: -ZIGZAG_SIZE / 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: ZIGZAG_SIZE,
    overflow: 'hidden',
  },
  zigzagBottom: {
    position: 'absolute',
    bottom: -ZIGZAG_SIZE / 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: ZIGZAG_SIZE,
    overflow: 'hidden',
  },
  zigzagLeft: {
    position: 'absolute',
    left: -ZIGZAG_SIZE / 2,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    width: ZIGZAG_SIZE,
    overflow: 'hidden',
  },
  zigzagRight: {
    position: 'absolute',
    right: -ZIGZAG_SIZE / 2,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    width: ZIGZAG_SIZE,
    overflow: 'hidden',
  },
  zigzagBlockH: {
    backgroundColor: PAPER_COLOR,
    marginTop: -ZIGZAG_SIZE / 2, // base adjustment
  },
  zigzagBlockV: {
    backgroundColor: PAPER_COLOR,
    marginLeft: -ZIGZAG_SIZE / 2, // base adjustment
  },

  // Paperclip
  paperclipWrapper: {
    position: 'absolute',
    top: -180,
    left: -30,
    transform: [{ rotateZ: '-12deg' }],
    zIndex: 10,
  },
  paperclipImage: {
    width: 180,
    height: 400,
    resizeMode: 'contain',
  },

  // Content
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#E85D75',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 6,
    fontFamily: 'System', // use default bold sans
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5D4E',
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  dashedDivider: {
    height: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: '#9E988A',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  
  // List
  listContainer: {
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemImageWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImage: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#607064',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    transform: [{ rotateZ: '-2deg' }],
  },
});
