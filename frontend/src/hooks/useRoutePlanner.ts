import { useEffect, useRef, useState } from 'react';
import { mapService } from '../services/mapService';
import type { RoutePlan } from '../types/models';

interface RoutePlannerState {
  routePlan: RoutePlan | null;
  routeError: string | null;
  isPlanning: boolean;
}

export function useRoutePlanner(googleMaps: typeof google | null) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [state, setState] = useState<RoutePlannerState>({
    routePlan: null,
    routeError: null,
    isPlanning: false,
  });

  useEffect(() => {
    if (!googleMaps || !mapElementRef.current || mapRef.current) {
      return;
    }

    const map = new googleMaps.maps.Map(mapElementRef.current, {
      center: { lat: 25.033, lng: 121.5654 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapRef.current = map;
    directionsServiceRef.current = new googleMaps.maps.DirectionsService();
    directionsRendererRef.current = new googleMaps.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#c7774b',
        strokeOpacity: 0.82,
        strokeWeight: 6,
      },
    });
    geocoderRef.current = new googleMaps.maps.Geocoder();
  }, [googleMaps]);

  function clearMarkers() {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }

  async function pinEndpoints(routePlan: RoutePlan) {
    if (!googleMaps || !mapRef.current) {
      return;
    }

    clearMarkers();

    const nextMarkers = [routePlan.origin, routePlan.destination].map((point, index) => {
      const marker = new googleMaps.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: mapRef.current,
        title: point.label,
        label: index === 0 ? '起' : '终',
      });

      return marker;
    });

    markersRef.current = nextMarkers;
  }

  async function planRoute(origin: string, destination: string) {
    if (
      !googleMaps ||
      !directionsServiceRef.current ||
      !directionsRendererRef.current ||
      !geocoderRef.current
    ) {
      setState((previous) => ({
        ...previous,
        routeError: '地图尚未准备完成，请稍后再试。',
      }));
      return;
    }

    setState((previous) => ({
      ...previous,
      isPlanning: true,
      routeError: null,
    }));

    try {
      const [routeResponse, originResult, destinationResult] = await Promise.all([
        mapService.getWalkingRoute(directionsServiceRef.current, {
          origin,
          destination,
        }),
        mapService.searchPlace(geocoderRef.current, origin),
        mapService.searchPlace(geocoderRef.current, destination),
      ]);

      const routePlan: RoutePlan = {
        ...routeResponse.data.routePlan,
        origin: {
          label: originResult.data.name,
          address: originResult.data.address,
          lat: originResult.data.lat,
          lng: originResult.data.lng,
          placeId: originResult.data.placeId,
        },
        destination: {
          label: destinationResult.data.name,
          address: destinationResult.data.address,
          lat: destinationResult.data.lat,
          lng: destinationResult.data.lng,
          placeId: destinationResult.data.placeId,
        },
      };

      directionsRendererRef.current.setDirections(routeResponse.data.directionsResult);
      await pinEndpoints(routePlan);

      setState({
        routePlan,
        routeError: null,
        isPlanning: false,
      });
    } catch (error) {
      setState({
        routePlan: null,
        routeError: error instanceof Error ? error.message : '路线规划失败',
        isPlanning: false,
      });
    }
  }

  return {
    mapElementRef,
    routePlan: state.routePlan,
    routeError: state.routeError,
    isPlanning: state.isPlanning,
    planRoute,
  };
}
