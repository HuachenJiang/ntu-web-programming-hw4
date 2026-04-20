import type { ApiResponse } from '../types/api';
import type { RoutePlan, RouteRequest, SearchLocationResult } from '../types/models';
import { mapMonitorService } from './mapMonitorService';

interface RoutePlanningResult {
  routePlan: RoutePlan;
  directionsResult: google.maps.DirectionsResult;
}

function extractLegSummary(result: google.maps.DirectionsResult, overviewPolyline?: string): RoutePlan {
  const route = result.routes[0];
  const leg = route.legs[0];

  return {
    origin: {
      label: leg.start_address,
      address: leg.start_address,
      lat: leg.start_location.lat(),
      lng: leg.start_location.lng(),
    },
    destination: {
      label: leg.end_address,
      address: leg.end_address,
      lat: leg.end_location.lat(),
      lng: leg.end_location.lng(),
    },
    waypoints: [],
    distanceKm: Number(((leg.distance?.value ?? 0) / 1000).toFixed(1)),
    durationMinutes: Math.round((leg.duration?.value ?? 0) / 60),
    overviewPolyline,
  };
}

export const mapService = {
  async searchPlace(
    geocoder: google.maps.Geocoder,
    query: string,
  ): Promise<ApiResponse<SearchLocationResult>> {
    const startedAt = performance.now();
    try {
      const response = await geocoder.geocode({ address: query });
      const result = response.results[0];

      if (!result) {
        mapMonitorService.record({
          service: 'geocoder',
          status: 'error',
          latencyMs: performance.now() - startedAt,
          errorCode: 'ZERO_RESULTS',
        });
        throw new Error('没有找到这个地点，请试试更完整的地名');
      }

      const payload: SearchLocationResult = {
        name: result.address_components[0]?.long_name ?? result.formatted_address,
        address: result.formatted_address,
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
        placeId: result.place_id,
      };

      mapMonitorService.record({
        service: 'geocoder',
        status: 'success',
        latencyMs: performance.now() - startedAt,
      });

      return {
        success: true,
        message: '地点解析成功',
        data: payload,
      };
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Geocoder failed';
      const errorCode = detail.includes('REQUEST_DENIED') ? 'REQUEST_DENIED' : undefined;

      mapMonitorService.record({
        service: 'geocoder',
        status: 'error',
        latencyMs: performance.now() - startedAt,
        errorCode,
        detail,
      });

      if (errorCode === 'REQUEST_DENIED') {
        throw new Error('地点解析被 Google Maps 拒绝，请检查 Geocoding API 与 key 的 referrer 限制。');
      }

      throw error instanceof Error ? error : new Error('地点解析失败');
    }
  },

  async getWalkingRoute(
    directionsService: google.maps.DirectionsService,
    request: RouteRequest,
  ): Promise<ApiResponse<RoutePlanningResult>> {
    const startedAt = performance.now();

    try {
      const directionsResult = await directionsService.route({
        origin: request.origin,
        destination: request.destination,
        travelMode: google.maps.TravelMode.WALKING,
      });

      const routePlan = extractLegSummary(
        directionsResult,
        directionsResult.routes[0]?.overview_polyline ?? undefined,
      );

      mapMonitorService.record({
        service: 'directions',
        status: 'success',
        latencyMs: performance.now() - startedAt,
      });

      return {
        success: true,
        message: '路线规划成功',
        data: {
          routePlan,
          directionsResult,
        },
      };
    } catch (error) {
      mapMonitorService.record({
        service: 'directions',
        status: 'error',
        latencyMs: performance.now() - startedAt,
        detail: error instanceof Error ? error.message : 'Directions failed',
      });

      throw new Error('路线规划失败，请确认起点和终点是否可步行到达');
    }
  },
};
