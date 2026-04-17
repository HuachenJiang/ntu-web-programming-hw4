interface MapMonitorPayload {
  service: 'maps-js' | 'directions' | 'geocoder';
  status: 'success' | 'error';
  latencyMs?: number;
  errorCode?: string;
  detail?: string;
}

export const mapMonitorService = {
  record(payload: MapMonitorPayload) {
    if (import.meta.env.DEV) {
      // Phase 1 only logs locally and reserves the monitoring contract.
      console.info('[map-monitor]', payload);
    }
  },
};
