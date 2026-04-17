import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useState } from 'react';
import { mapMonitorService } from '../services/mapMonitorService';

interface MapsLoaderState {
  isLoaded: boolean;
  loadError: string | null;
  googleMaps: typeof google | null;
}

let loaderPromise: Promise<typeof google> | null = null;

function getLoader(apiKey: string) {
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
    });

    const startedAt = performance.now();
    loaderPromise = loader.load().then((loadedGoogle) => {
      mapMonitorService.record({
        service: 'maps-js',
        status: 'success',
        latencyMs: performance.now() - startedAt,
      });

      return loadedGoogle;
    });
  }

  return loaderPromise;
}

export function useGoogleMapsLoader() {
  const [state, setState] = useState<MapsLoaderState>({
    isLoaded: false,
    loadError: null,
    googleMaps: null,
  });

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setState({
        isLoaded: false,
        loadError: '尚未配置 VITE_GOOGLE_MAPS_API_KEY，地图已切换为降级模式。',
        googleMaps: null,
      });
      return;
    }

    let active = true;
    const startedAt = performance.now();

    getLoader(apiKey)
      .then((loadedGoogle) => {
        if (!active) {
          return;
        }

        setState({
          isLoaded: true,
          loadError: null,
          googleMaps: loadedGoogle,
        });
      })
      .catch((error) => {
        mapMonitorService.record({
          service: 'maps-js',
          status: 'error',
          latencyMs: performance.now() - startedAt,
          detail: error instanceof Error ? error.message : 'Maps load failed',
        });

        if (!active) {
          return;
        }

        setState({
          isLoaded: false,
          loadError: '地图加载失败，请检查 API key 或网络状态。',
          googleMaps: null,
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
