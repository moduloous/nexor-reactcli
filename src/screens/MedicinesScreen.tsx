import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = ['OTC', 'Supplements', 'Ayurveda', 'Personal Care', 'Devices'];

const BENTO_DATA = [
  // Row 1: 2 items
  { id: '1', title: 'Fever & Pain', icon: '🤒', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/fever%20and%20pain.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvZmV2ZXIgYW5kIHBhaW4ucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgzMDMzNywiZXhwIjoxODE2MzY2MzM3fQ.s856sssHBZ8aUBBkzGiKsbsX6CxnuWYXX4Ne4JLc6LU', color: '#D6EAF8', height: 140, width: '48%' },
  { id: '2', title: 'Cold & Cough', icon: '🤧', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/cough.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvY291Z2gucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgyOTQzMywiZXhwIjoxODE2MzY1NDMzfQ.G8QowKoDo_PpceZiRO7ybB0txlLvVC3zxThVf9wODcM', color: '#FCF3CF', height: 140, width: '48%' },
  // Row 2: 3 items
  { id: '3', title: 'Digestion', icon: '🍽️', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/digestion.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvZGlnZXN0aW9uLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4MzA0NjYsImV4cCI6MTgxNjM2NjQ2Nn0.kAiD7l2nAcXfrj7-uPiiPfidN0Ay3u00ERMggPw9Xn8', color: '#E8DAEF', height: 120, width: '31%' },
  { id: '4', title: 'Heart', icon: '❤️', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/heart.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvaGVhcnQucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgyOTkxNywiZXhwIjoxODE2MzY1OTE3fQ.qcKj8r34Rj8yLFy2F6qq4zJKRMdEu3iJatdedxYV8no', color: '#FADBD8', height: 120, width: '31%' },
  { id: '5', title: 'Diabetes', icon: '💉', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/diabities.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvZGlhYml0aWVzLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4MzAxNTgsImV4cCI6MTgxNjM2NjE1OH0.THwKGOAR3B7I_ppZZby88JF22wV-kTwJcdgFT2SBkK8', color: '#FDEBD0', height: 120, width: '31%', imageWidth: 88, imageHeight: 88, imageMarginLeft: -32, imageBottom: 4 },
  // Row 3: 2 items
  { id: '6', title: 'Blood Pressure', icon: '🩺', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/blood.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvYmxvb2QucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgzMDc5NiwiZXhwIjoxODE2MzY2Nzk2fQ.lfRfjJT5jo1nwMATzIh-2-nHX1SQF1s_kI3TAZBNDlg', color: '#D1F2EB', height: 150, width: '48%', imageWidth: 106, imageHeight: 106, imageMarginLeft: -44, imageBottom: 0 },
  { id: '7', title: 'Bones & Joints', icon: '🦴', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/bone%20and%20joint.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvYm9uZSBhbmQgam9pbnQucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgzMDk5NSwiZXhwIjoxODE2MzY2OTk1fQ.lLXBwaSC4M5l9rgIee5DPBj1o-jUJkyjzIk3PTRPE2E', color: '#FADBD8', height: 150, width: '48%', imageWidth: 106, imageHeight: 106, imageMarginLeft: -53, imageBottom: 8 },
  // Row 4: 3 items
  { id: '8', title: 'Skin Care', icon: '🧴', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/skin%20care.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvc2tpbiBjYXJlLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4MzE0MjEsImV4cCI6MTgxNjM2NzQyMX0.c0PxexPFLUfEoymK--51j0hhhg4N6o5eogIkW_GENMg', color: '#D4EFDF', height: 130, width: '31%', imageWidth: 98, imageHeight: 98, imageMarginLeft: -37, imageBottom: 2 },
  { id: '9', title: 'Baby Care', icon: '👶', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/baby%20care.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvYmFieSBjYXJlLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4MzE0MDAsImV4cCI6MTgxNjM2NzQwMH0.12GxtJN7kTbuFgRq_WeGpRgoyenfjAQNjbAMQVDji0k', color: '#FDEBD0', height: 130, width: '31%', imageWidth: 88, imageHeight: 88, imageMarginLeft: -32, imageBottom: 4 },
  { id: '10', title: 'Immunity', icon: '🌿', image: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/immunity.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvaW1tdW5pdHkucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgzMTE4OCwiZXhwIjoxODE2MzY3MTg4fQ.j0p-Qm6ZJsUq2gcmBVKfBr4qZ73DCO4G0pcpEvMHgk4', color: '#D5F5E3', height: 130, width: '31%', imageWidth: 88, imageHeight: 88, imageMarginLeft: -32, imageBottom: 4 },
];

export default function MedicinesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('OTC');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Row 1: Back button (left) + Medicines title (center) + Profile (right) */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color="#1A1A24" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medicines</Text>
          <View style={styles.profileContainer}>
            <Image
              source={require('../assets/avatar.png')}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* Typography */}
        <View style={styles.typography}>
          <Text style={styles.headerBold}>Your Trusted</Text>
          <Text style={styles.headerLight}>Online pharmacy</Text>
        </View>

        {/* Search + Scan (scan inside the bar) */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicine"
            placeholderTextColor="#9B95A8"
          />
          <TouchableOpacity style={styles.scanButton}>
            <Feather name="maximize" size={15} color="#FFF" />
            <Text style={styles.scanText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Boxes */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBox}>
            <Image 
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/order%20via.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvb3JkZXIgdmlhLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4MjQyOTgsImV4cCI6MTg3OTQzMjI5OH0.PKiSYNKmTVrc9xpCXfTEodZOHSl-H4w4FvS6FiMmdkk' }}
              style={styles.quickActionImage}
              resizeMode="contain"
            />
            <Text style={styles.quickActionLabel}>Order via{'\n'}Prescription</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBox}>
            <Image 
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/reorder.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvcmVvcmRlci5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0ODI0MzQzLCJleHAiOjE4Nzk0MzIzNDN9.meeM8ZJyVZs3x-O2_4ao4Qoi4GMAptylhZKuCGAKU4s' }}
              style={styles.quickActionImage}
              resizeMode="contain"
            />
            <Text style={styles.quickActionLabel}>Reorder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBox}>
            <Image 
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/tests.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvdGVzdHMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgyNDM3MSwiZXhwIjoxODc5NDMyMzcxfQ.7esNE7VwSe8ONFSW-Vz8tkHWFbbzhin5UC3ZD6kgB0k' }}
              style={styles.quickActionImage}
              resizeMode="contain"
            />
            <Text style={styles.quickActionLabel}>Book Lab{'\n'}Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBox}>
            <Image 
              source={{ uri: 'https://mtxqrudcbctmjtrotuyk.supabase.co/storage/v1/object/sign/medicines_icons/mask.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjNhNzI3NC04MDNmLTQyMDYtYWQwYS0xOTBhYThhOTI1Y2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpY2luZXNfaWNvbnMvbWFzay5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg0ODI1MDUxLCJleHAiOjE4Nzk0MzMwNTF9.ww6c1zNskr2lJtRDjY39sFr7horQ86YOtreKKvWLmag' }}
              style={styles.quickActionImage}
              resizeMode="contain"
            />
            <Text style={styles.quickActionLabel}>Consult{'\n'}Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {CATEGORIES.map((cat) => {
            const active = activeTab === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveTab(cat)}
                style={styles.tabItem}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {cat}
                </Text>
                {active && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dynamic Bento Grid */}
        <View style={styles.bentoContainer}>
          {BENTO_DATA.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.bentoCard,
                { backgroundColor: item.color, height: item.height, width: item.width as any },
              ]}
            >
              <Text style={styles.masonryTitle}>{item.title}</Text>
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={[
                    styles.bentoImage,
                    item.width === '31%' && styles.bentoImageSmall,
                    (item as any).imageWidth && {
                      width: (item as any).imageWidth,
                      height: (item as any).imageHeight,
                      marginLeft: (item as any).imageMarginLeft,
                      bottom: (item as any).imageBottom,
                    }
                  ]}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: 22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A24',
  },
  profileContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0D8F0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  typography: {
    marginBottom: 28,
  },
  headerBold: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A24',
  },
  headerLight: {
    fontSize: 30,
    fontWeight: '300',
    color: '#706B82',
    marginTop: -2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F1F8',
    borderRadius: 30,
    paddingLeft: 22,
    paddingRight: 6,
    height: 54,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E4F0',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  quickActionBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  quickActionIcon: {
    fontSize: 50,
    marginBottom: 4,
  },
  quickActionImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A24',
    textAlign: 'center',
    lineHeight: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A24',
    fontWeight: '400',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#302D3A',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 22,
    gap: 6,
  },
  scanText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsRow: {
    gap: 24,
    paddingBottom: 20,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    color: '#9B95A8',
    fontWeight: '500',
    paddingBottom: 6,
  },
  tabTextActive: {
    color: '#1A1A24',
    fontWeight: '700',
  },
  tabIndicator: {
    height: 2.5,
    width: '100%',
    backgroundColor: '#1A1A24',
    borderRadius: 2,
  },
  bentoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  bentoCard: {
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  masonryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
    width: '100%',
  },
  bentoImage: {
    width: 106,
    height: 106,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -53,
  },
  bentoImageSmall: {
    width: 76,
    height: 76,
    marginLeft: -28,
    bottom: 8,
  },
});
