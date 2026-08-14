import Config from 'react-native-config';

class MapService {
  private initialized = false;

  init() {
    if (this.initialized) return;
    
    // In MapLibre v11+, access tokens and telemetry are completely removed
    // since it is an open-source community fork without tracking.
    
    this.initialized = true;
  }

  getStyleUrl(): string {
    return Config.APP_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json';
  }
}

export const mapService = new MapService();
