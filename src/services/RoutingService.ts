import Config from 'react-native-config';

export interface RouteData {
  geometry: any; // GeoJSON LineString
  distance: number; // meters
  duration: number; // seconds
}

class RoutingService {
  private lastRouteFetchTime = 0;
  private lastRouteStartCoords: { lat: number; lng: number } | null = null;
  private isFetching = false;

  private get distanceThreshold() {
    return parseInt(Config.ROUTING_UPDATE_DISTANCE_METERS || '50', 10);
  }

  private get timeThresholdMs() {
    return parseInt(Config.ROUTING_UPDATE_INTERVAL_MS || '15000', 10);
  }

  // Haversine formula to calculate distance between two coordinates in meters
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  public shouldRecalculate(newLat: number, newLng: number): boolean {
    if (this.isFetching) return false;
    
    const now = Date.now();
    
    // First time
    if (!this.lastRouteStartCoords || this.lastRouteFetchTime === 0) {
      return true;
    }

    // Time elapsed?
    if (now - this.lastRouteFetchTime >= this.timeThresholdMs) {
      return true;
    }

    // Distance moved?
    const distMoved = this.calculateDistance(
      this.lastRouteStartCoords.lat,
      this.lastRouteStartCoords.lng,
      newLat,
      newLng
    );
    if (distMoved >= this.distanceThreshold) {
      return true;
    }

    return false;
  }

  public async getRoute(startLat: number, startLng: number, destLat: number, destLng: number): Promise<RouteData | null> {
    if (this.isFetching) return null; // Prevent concurrent requests

    this.isFetching = true;
    
    try {
      const baseUrl = Config.OSRM_BASE_URL || 'https://router.project-osrm.org';
      // OSRM format is lon,lat
      const url = `${baseUrl}/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        this.lastRouteFetchTime = Date.now();
        this.lastRouteStartCoords = { lat: startLat, lng: startLng };

        return {
          geometry: route.geometry,
          distance: route.distance,
          duration: route.duration,
        };
      }

      return null;
    } catch (err) {
      console.warn('RoutingService: Failed to fetch route', err);
      return null; // Return null on failure so caller can keep previous route
    } finally {
      this.isFetching = false;
    }
  }
}

export const routingService = new RoutingService();
