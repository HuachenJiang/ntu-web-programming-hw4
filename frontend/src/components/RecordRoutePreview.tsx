import { useEffect, useRef } from 'react';
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';
import type { RoutePlan } from '../types/models';
import { useGoogleMapsLoader } from '../hooks/useGoogleMapsLoader';
import { mapService } from '../services/mapService';
import { formatDistance, formatDuration } from '../utils/formatters';

interface RecordRoutePreviewProps {
  routePlan: RoutePlan;
}

export function RecordRoutePreview({ routePlan }: RecordRoutePreviewProps) {
  const { isLoaded, loadError, googleMaps } = useGoogleMapsLoader();
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!googleMaps || !mapRef.current) {
      return;
    }

    const map = new googleMaps.maps.Map(mapRef.current, {
      center: { lat: routePlan.destination.lat, lng: routePlan.destination.lng },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const directionsService = new googleMaps.maps.DirectionsService();
    const directionsRenderer = new googleMaps.maps.DirectionsRenderer({
      map,
      polylineOptions: {
        strokeColor: '#355c4c',
        strokeWeight: 5,
      },
    });

    mapService
      .getWalkingRoute(directionsService, {
        origin: { lat: routePlan.origin.lat, lng: routePlan.origin.lng },
        destination: { lat: routePlan.destination.lat, lng: routePlan.destination.lng },
      })
      .then((result) => directionsRenderer.setDirections(result.data.directionsResult))
      .catch(() => {
        new googleMaps.maps.Marker({
          position: { lat: routePlan.origin.lat, lng: routePlan.origin.lng },
          map,
          label: '起',
        });
        new googleMaps.maps.Marker({
          position: { lat: routePlan.destination.lat, lng: routePlan.destination.lng },
          map,
          label: '终',
        });
      });
  }, [googleMaps, routePlan]);

  return (
    <Card className="grain-shell">
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1}>
            <Stack spacing={0.8}>
              <Typography variant="h4">路线预览</Typography>
              <Typography color="text.secondary">
                {routePlan.origin.label} 到 {routePlan.destination.label}
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              {formatDistance(routePlan.distanceKm)} · {formatDuration(routePlan.durationMinutes)}
            </Typography>
          </Stack>
          {loadError && <Alert severity="error">{loadError}</Alert>}
          {isLoaded ? (
            <div ref={mapRef} className="map-surface" />
          ) : (
            <div className="map-blocked">
              <Stack spacing={1.2} textAlign="center" maxWidth={380}>
                <Typography variant="h5">地图预览暂时不可用</Typography>
                <Typography color="text.secondary">请检查 Google Maps API key、网络状态或地图服务限制。</Typography>
              </Stack>
            </div>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
