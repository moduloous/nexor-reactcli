import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Map, Camera, GeoJSONSource, Layer, Marker } from '@maplibre/maplibre-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import io, { Socket } from 'socket.io-client';
import Icon from 'react-native-vector-icons/Feather';
import { useAppStore } from '../store/useAppStore';
import { CustomLoader } from '../components/CustomLoader';
import { supabase } from '../lib/supabase';
import { mapService } from '../services/MapService';
import { routingService, RouteData } from '../services/RoutingService';

// Initialize map service
mapService.init();

// Use your actual backend URL here. Adjust this to match your environment.
const SOCKET_URL = 'http://10.0.2.2:3000'; 

interface LocationUpdate {
  latitude: number;
  longitude: number;
  heading?: number;
  timestamp: string;
}

export default function OrderTrackingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { orderId } = route.params || {};
  const token = useAppStore(state => state.accessToken); // Supabase token

  const [order, setOrder] = useState<any>(null);
  const [riderLocation, setRiderLocation] = useState<LocationUpdate | null>(null);
  const [status, setStatus] = useState<string>('Connecting...');
  const [isStale, setIsStale] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    // Fetch initial order details from Supabase to get destination coords
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('medicine_orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order', err);
        Alert.alert('Error', 'Failed to fetch order details');
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !token || !order) return;

    if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.status)) {
      setStatus(`Order is ${order.status}`);
      return;
    }

    const socket = io(`${SOCKET_URL}/medicines/delivery`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('Waiting for rider location...');
      socket.emit('joinOrderRoom', orderId);
    });

    socket.on('disconnect', () => {
      setStatus('Connection lost, reconnecting...');
    });

    socket.on('rider:location:update', async (payload: any) => {
      // 1. Instantly update rider marker
      setRiderLocation({
        latitude: payload.latitude,
        longitude: payload.longitude,
        heading: payload.heading,
        timestamp: payload.timestamp,
      });
      setIsStale(false);
      setStatus('Live tracking active');

      // 2. Decide whether to fetch a new route
      const destLat = order.delivery_lat || order.deliveryLat || 12.9116;
      const destLng = order.delivery_lng || order.deliveryLng || 77.6412;

      if (routingService.shouldRecalculate(payload.latitude, payload.longitude)) {
        const newRoute = await routingService.getRoute(
          payload.latitude, 
          payload.longitude,
          destLat,
          destLng
        );
        if (newRoute) {
          setRouteData(newRoute);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, token, order]);

  // Check for stale location (No update in 30s)
  useEffect(() => {
    if (!riderLocation) return;
    const interval = setInterval(() => {
      const diff = Date.now() - new Date(riderLocation.timestamp).getTime();
      if (diff > 30000) {
        setIsStale(true);
        setStatus('Rider location temporarily unavailable');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [riderLocation]);

  // Handle camera bounds
  useEffect(() => {
    if (cameraRef.current && order && riderLocation) {
      const destLat = order.delivery_lat || order.deliveryLat || 12.9116;
      const destLng = order.delivery_lng || order.deliveryLng || 77.6412;
      
      cameraRef.current.fitBounds(
        [riderLocation.longitude, riderLocation.latitude],
        [destLng, destLat],
        50, // padding
        500 // animation duration
      );
    }
  }, [riderLocation, order]);

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoader size={40} />
      </View>
    );
  }

  const destLat = order.delivery_lat || order.deliveryLat || 12.9116;
  const destLng = order.delivery_lng || order.deliveryLng || 77.6412;
  const mapStyleUrl = mapService.getStyleUrl();

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 1) return 'Less than a minute';
    return `${mins} min`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
      </View>

      <View style={[styles.statusBanner, isStale && styles.statusBannerStale]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <Map style={styles.map} mapStyle={mapStyleUrl}>
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [destLng, destLat],
            zoom: 14,
          }}
        />

        {/* Route Line */}
        {routeData && (
          <GeoJSONSource id="routeSource" data={routeData.geometry}>
            <Layer
              id="routeFill"
              type="line"
              style={{
                lineColor: '#6C63FF',
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </GeoJSONSource>
        )}

        {/* Customer Destination Marker */}
        <Marker
          id="destination"
          lngLat={[destLng, destLat]}
        >
          <View style={styles.destMarker}>
            <Icon name="home" size={16} color="#FFF" />
          </View>
        </Marker>

        {/* Live Rider Marker */}
        {riderLocation && (
          <Marker
            id="rider"
            lngLat={[riderLocation.longitude, riderLocation.latitude]}
          >
            <View style={styles.riderMarker}>
              <Icon 
                name="navigation" 
                size={20} 
                color="#FFF" 
                style={{ transform: [{ rotate: `${riderLocation.heading || 0}deg` }] }}
              />
            </View>
          </Marker>
        )}
      </Map>

      {/* ETA and Distance Overlay */}
      {routeData && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{formatDistance(routeData.distance)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ETA</Text>
              <Text style={styles.infoValue}>{formatDuration(routeData.duration)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  statusBanner: {
    backgroundColor: '#34C759',
    padding: 10,
    alignItems: 'center',
    zIndex: 5,
  },
  statusBannerStale: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 14,
  },
  map: { flex: 1 },
  destMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  riderMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  routeInfoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoCol: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8B99',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '800',
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  }
});
